import { jsonDateReviver, readFileSync, runOrResolve, tryParseJson, tryStringifyJson, writeFileSync } from '@/@utils';
import * as fs from 'fs';
import { tmpdir } from 'os';
import * as path from 'path';

// TYPES

export type TypedFunction = (...args: any[]) => any;

export type MemoizedProps = { _memoizeCache: MemoizeCache<any, any> };
export type Memoized<T extends TypedFunction> = ((...args: Parameters<T>) => ReturnType<T>) & MemoizedProps;

export interface MemoizeConfig {
  cacheType?: MemoizeCacheType | MemoizeCache<any, any>,
  cacheDir?: string,
  funcKey?: string,
  cacheConfig?: any,
  maxAge?: number, // seconds
}

export enum MemoizeCacheType {
  Memory = 'Memory',
  Storage = 'Storage',
}

export function isMemoizeCacheType(value: any): value is MemoizeCacheType {
  return Object.values(MemoizeCacheType).includes(value as MemoizeCacheType);
}

export interface MemoizeCacheItem<T extends TypedFunction> {
  date: Date,
  value: ReturnType<T>,
}

export type MemoizeCacheMap<T extends TypedFunction> = Map<string, MemoizeCacheItem<T>>;

export interface MemoizeCache<T extends TypedFunction, C> {
  disabled?: boolean,
  config?: any,
  cache: C,
  memoizedFunc?: Memoized<ReturnType<T>>,
  init: () => void,
  get: (key: string) => MemoizeCacheItem<T> | undefined,
  set: (key: string, value: MemoizeCacheItem<T> | Promise<MemoizeCacheItem<T>>) => void,
  delete: (key: string) => void,
  flush: () => void,
  invalidate: (predicate: (key: string, value: MemoizeCacheItem<T>) => boolean) => void,
}

// CONSTS

export const globalMemoizeConfig: Partial<MemoizeConfig> = { // HOW-TO: globalMemoizeConfig.maxAge = 10;
  cacheType: MemoizeCacheType.Memory,
  cacheDir: path.join(tmpdir(), `/${path.basename(process.cwd())}-${path.basename(process.argv[1])}`),
};

const memoizeMemory = <T extends TypedFunction>(config: MemoizeConfig) => {
  const memoryCache: MemoizeCache<T, MemoizeCacheMap<T>> = {
    config: config.cacheConfig,
    cache: new Map<string, ReturnType<T>>(),
    init: () => memoryCache.cache ??= new Map<string, MemoizeCacheItem<T>>(), 
    get: key => memoryCache.cache.has(key) ? memoryCache.cache.get(key) : undefined,
    set: (key, value) => {
      runOrResolve(value, resolved => memoryCache.cache.set(key, resolved));
    },
    delete: key => memoryCache.cache.delete(key),
    flush: () => memoryCache.cache.clear(),
    invalidate: predicate => {
      const cacheArr = Array.from(memoryCache.cache);
      for (let cacheItem of cacheArr) {
        const isInvalid = predicate(cacheItem[0], cacheItem[1]);
        if (isInvalid) memoryCache.delete(cacheItem[0]);
      }
    },
  };

  return memoryCache;
}

const memoizeStorage = <T extends TypedFunction>(config: MemoizeConfig) => {
  // Fetch + Modify + Save
  const syncCache = (set?: (cacheObj: MemoizeCacheMap<T>) => MemoizeCacheMap<T> | Promise<MemoizeCacheMap<T>>) => {
    const prevCache = tryParseJson<MemoizeCacheMap<T>>(readFileSync(storageCache.config.cachePath), jsonDateReviver);
    const newCache = set?.(prevCache) ?? prevCache;

    return runOrResolve(newCache, resolved => {
      storageCache.cache = resolved;
      writeFileSync(storageCache.config.cachePath, tryStringifyJson(resolved));
      return storageCache.cache;
    });
  }

  const storageCache: MemoizeCache<T, MemoizeCacheMap<T>> = {
    config: {
      cachePath: path.join(config.cacheDir, `memoize-${config.funcKey}.json`),
      ...config.cacheConfig,
    },
    cache: new Map<string, ReturnType<T>>(),
    init: () => {
      storageCache.cache ??= new Map<string, MemoizeCacheItem<T>>();
      if (!fs.existsSync(storageCache.config.cachePath)) {
        writeFileSync(storageCache.config.cachePath, JSON.stringify({}));
      }
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
    flush: () => fs.existsSync(storageCache.config.cachePath) && fs.unlinkSync(storageCache.config.cachePath),
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
}

const cacheTypes: Record<MemoizeCacheType, (config: MemoizeConfig) => MemoizeCache<any, any>> = {
  [MemoizeCacheType.Memory]: memoizeMemory,
  [MemoizeCacheType.Storage]: memoizeStorage,
};

// FUNCTIONS

export function memoize<T extends (...args: any[]) => Promise<any>>(func: Memoized<T>, config: MemoizeConfig): Memoized<T> {
  config = { ...globalMemoizeConfig, ...config };

  if (config.funcKey == null) throw new Error('Invalid funcKey');

  const cache = isMemoizeCacheType(config.cacheType) ? cacheTypes[config.cacheType](config) : config.cacheType;

  const memoized: Memoized<T> = function (...args: Parameters<T>): ReturnType<T> {
    config = { ...globalMemoizeConfig, ...config };

    if (cache.disabled) return func(...args);

    cache.init();
    
    const paramsKey = JSON.stringify(args);

    const cacheEntry = cache.get(paramsKey);

    if (cacheEntry !== undefined) {
      const cacheAge = (Date.now() - cacheEntry.date.getTime()) / 1000;
      const validEntry = config.maxAge ? cacheAge < config.maxAge : true;
      if (validEntry) return cacheEntry.value;
      else cache.delete(paramsKey);
    }

    const result = func(...args);

    cache.set(paramsKey, runOrResolve(result, resolved => ({ date: new Date(), value: resolved })));

    return result;
  };

  memoized._memoizeCache = cache; // HOW-TO: (this.myFunc as Memoized<any>)._memoizeCache.flush()
  cache.memoizedFunc = memoized;

  return memoized;
}

// Decorator factory (runs once with params)
export function Memoize(config?: MemoizeConfig) { // use with "@Memoize()"

  // Decorator function (runs once before constructor)
  return function (target: any, name: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;

    config ??= {} as any;
    config.funcKey ??= `${target?.constructor?.name}:${originalMethod?.name}`;

    // Decorator descriptor (runs on every call)
    return {
      configurable: true,
      get() {
        const memoized = memoize(originalMethod.bind(this), config);
        // memoized._funcValue = this._funcValue;
        Object.defineProperty(this, name, {
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
