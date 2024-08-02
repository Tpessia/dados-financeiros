import { jsonDateReviver, readFileSync, runOrResolve, tryParseJson, tryStringifyJson, TypedFunction, TypedFunctionWrapper, writeFileSync } from '@/@utils';
import { createHash } from 'crypto';
import * as fs from 'fs';
import { cloneDeep, isEqual, merge } from 'lodash';
import { tmpdir } from 'os';
import * as path from 'path';

// TYPES

export type MemoizedProps = { _memoizeCache: MemoizeCache<any, any> };
export type Memoized<F extends TypedFunction> = TypedFunctionWrapper<F> & MemoizedProps;

export interface MemoizeConfig {
  funcKey?: (config: MemoizeConfig) => string;
  itemKey?: (config: MemoizeConfig, args: any[], cache: MemoizeCache<any, any>) => string;
  onCall?: (config: MemoizeConfig, args: any[], cache: MemoizeCache<any, any>) => void;
  cacheType?: MemoizeCacheType | MemoizeCache<any, any>;
  cacheConfig?: MemoizeCacheConfig;
  _instance?: Object;
  _target?: Object;
  _method?: PropertyDescriptor;
}
export interface MemoizeCacheConfig {
  cacheDir?: string;
  cachePath?: string;
  maxAge?: number; // seconds
}

export enum MemoizeCacheType {
  Memory = 'Memory',
  Storage = 'Storage',
}

export function isMemoizeCacheType(value: any): value is MemoizeCacheType {
  return Object.values(MemoizeCacheType).includes(value as MemoizeCacheType);
}

export interface MemoizeCacheItem<F extends TypedFunction> {
  date: Date;
  value: ReturnType<F>;
}

export type MemoizeCacheMap<F extends TypedFunction> = Record<string, MemoizeCacheItem<F>>;

export interface MemoizeCache<F extends TypedFunction, C> {
  type: MemoizeCacheType | string;
  disabled?: boolean;
  config?: MemoizeConfig['cacheConfig'];
  cache: C;
  state: any;
  memoizedFunc?: Memoized<ReturnType<F>>;
  init: () => void;
  get: (key: string) => MemoizeCacheItem<F> | undefined;
  set: (key: string, value: MemoizeCacheItem<F> | Promise<MemoizeCacheItem<F>>) => void;
  delete: (key: string) => void;
  flush: () => void;
  invalidate: (predicate: (key: string, value: MemoizeCacheItem<F>) => boolean) => void;
}

// CONSTS

export const globalMemoizeConfig: Partial<MemoizeConfig> = { // HOW-TO: globalMemoizeConfig.maxAge = 10;
  cacheType: MemoizeCacheType.Memory,
  cacheConfig: {
    cacheDir: path.join(tmpdir(), `/${path.basename(process.cwd())}-${path.basename(process.argv[1])}`),
  },
};

const memoizeMemory = <F extends TypedFunction>(config: MemoizeConfig) => {
  const memoryCache: MemoizeCache<F, MemoizeCacheMap<F>> = {
    type: MemoizeCacheType.Memory,
    config: config.cacheConfig,
    cache: {},
    state: {},
    init: () => memoryCache.cache ??= {}, 
    get: key => memoryCache.cache[key],
    set: (key, value) => {
      runOrResolve(value, resolved => memoryCache.cache[key] = resolved);
    },
    delete: key => delete memoryCache.cache[key],
    flush: () => {
      memoryCache.cache = {};
    },
    invalidate: predicate => {
      const cacheArr = Object.entries(memoryCache.cache);
      for (let cacheItem of cacheArr) {
        const isInvalid = predicate(cacheItem[0], cacheItem[1]);
        if (isInvalid) memoryCache.delete(cacheItem[0]);
      }
    },
  };

  return memoryCache;
};

const memoizeStorage = <F extends TypedFunction>(config: MemoizeConfig) => {
  // TODO: do not load all to memory

  const getFileInfo = (cachePath: string) => {
    if (!fs.existsSync(cachePath)) return null;
    const fileStats = fs.statSync(cachePath);
    const fileId = `${fileStats.ino}-${fileStats.size}-${fileStats.mtimeMs}`;
    const hash = createHash('md5').update(fileId).digest('hex');
    return {
      size: fileStats.size,
      hash,
    };
  };

  // Create + Fetch + Modify + Save
  const syncCache = (callback?: (cacheObj: MemoizeCacheMap<F>) => MemoizeCacheMap<F> | Promise<MemoizeCacheMap<F>>) => {
    const fileInfoKey = '_fileInfo';
    const fileInfo = getFileInfo(storageCache.config.cachePath);
    const oldFileInfo = storageCache.state[fileInfoKey];
    const fileChanged = fileInfo && (oldFileInfo == null || oldFileInfo.hash !== fileInfo.hash);

    const prevCache = fileChanged
      ? tryParseJson<MemoizeCacheMap<F>>(readFileSync(storageCache.config.cachePath), jsonDateReviver)
      : storageCache.cache;
    const newCache = callback?.(prevCache) ?? prevCache;

    return runOrResolve(newCache, resolved => {
      storageCache.cache = resolved;
      if (!isEqual(prevCache, resolved) || fileInfo == null)
        writeFileSync(storageCache.config.cachePath, tryStringifyJson(resolved));
      const newFileInfo = getFileInfo(storageCache.config.cachePath);
      storageCache.state[fileInfoKey] = newFileInfo;
      return storageCache.cache;
    }, err => {
      return err; // prevent unhandled promise rejection
    });
  }

  if (config.cacheConfig.cacheDir == null && config.cacheConfig.cachePath == null) throw new Error('Invalid cacheDir (null)');
  const defaultConfig: MemoizeCacheConfig = { cachePath: path.join(config.cacheConfig.cacheDir, `memoize-${config.funcKey(config)}.json`) };

  const storageCache: MemoizeCache<F, MemoizeCacheMap<F>> = {
    type: MemoizeCacheType.Storage,
    config: merge(defaultConfig, config.cacheConfig),
    cache: {},
    state: {},
    init: () => {
      syncCache(); 
    },
    get: key => {
      const cache = syncCache() as object;
      return cache.hasOwnProperty(key) ? cache[key] : undefined;
    },
    set: (key, value) => {
      syncCache(cache => runOrResolve(value, resolved => ({ ...cache, [key]: resolved })));
    },
    delete: key => {
      syncCache(cache => { delete cache[key]; return cache; });
    },
    flush: () => {
      fs.existsSync(storageCache.config.cachePath) && fs.unlinkSync(storageCache.config.cachePath);
      storageCache.cache = {};
    },
    invalidate: predicate => {
      syncCache(cache => {
        for (let cacheKey in cache) {
          const isInvalid = predicate(cacheKey, cache[cacheKey]);
          if (isInvalid) delete cache[cacheKey];
        }
        return cache;
      });
    },
  };

  return storageCache;
};

const cacheTypes: Record<MemoizeCacheType, (config: MemoizeConfig) => MemoizeCache<any, any>> = {
  [MemoizeCacheType.Memory]: memoizeMemory,
  [MemoizeCacheType.Storage]: memoizeStorage,
};

// FUNCTIONS

export function memoize<F extends TypedFunction>(func: Memoized<F>, config: MemoizeConfig): Memoized<F> {
  config = merge(cloneDeep(globalMemoizeConfig), config);

  if (config.funcKey == null) throw new Error('Invalid funcKey');

  const cache = isMemoizeCacheType(config.cacheType) ? cacheTypes[config.cacheType](config) : config.cacheType;

  const memoized: Memoized<F> = function (...args: Parameters<F>): ReturnType<F> {
    if (cache.disabled) {
      config.onCall?.(config, args, cache);
      return func(...args);
    }

    cache.init();
    config.onCall?.(config, args, cache);

    const itemKey = config.itemKey?.(config, args, cache) ?? JSON.stringify(args);
    const cacheEntry = cache.get(itemKey);

    if (cacheEntry !== undefined) {
      const cacheAge = cacheEntry.date != null ? (Date.now() - cacheEntry.date.getTime()) / 1000 : null;
      const validEntry = cacheAge != null && (config.cacheConfig.maxAge ? cacheAge < config.cacheConfig.maxAge : true);
      if (validEntry) return cacheEntry.value;
      else cache.delete(itemKey);
    }

    const result = func(...args);

    cache.set(itemKey, runOrResolve(result, resolved => ({ date: new Date(), value: resolved })));

    return result;
  };

  memoized._memoizeCache = cache;
  cache.memoizedFunc = memoized;

  return memoized;
}

// Decorator factory (runs once with params)
export function Memoize(config?: MemoizeConfig) { // use with "@Memoize()"
  // Decorator function (runs once before constructor)
  return function (target: Object, name: string, descriptor: PropertyDescriptor) {
    // Decorator descriptor (runs on every call)
    return {
      configurable: true,
      get() {
        config ??= {} as any;
        config._instance = this;
        config._target = target;
        config._method = descriptor;
        config.funcKey ??= () => `${config._instance?.constructor?.name}:${config._method.value?.name}`;

        const memoized = memoize(config._method.value.bind(config._instance), config);

        Object.defineProperty(config._instance, name, {
          value: memoized,
          configurable: true,
          writable: true,
        });

        return memoized;
      },
    };
  };
}

// export function Memoize(key?: string, flush?: boolean) { // use with "@Memoize()"
//   return function (target: any, name: string, descriptor: PropertyDescriptor) {
//     const originalMethod = descriptor.value;
//     key ??= `${target?.constructor?.name}:${originalMethod?.name}`;
//     descriptor.value = memoizeDisk(originalMethod, key);
//     descriptor.value._flush = flush;
//     return descriptor;
//   };
// }

// export function Memoize(target: any, name: string, descriptor: PropertyDescriptor) {
//   const originalMethod = descriptor.value;
//   const key = `${target?.constructor?.name}:${originalMethod?.name}`;
//   descriptor.value = memoizeDisk(originalMethod, key);
//   return descriptor;
// }