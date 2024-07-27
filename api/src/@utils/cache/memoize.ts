import { jsonDateReviver, readFileSync, runOrResolve, tryParseJson, tryStringifyJson, TypedFunction, TypedFunctionWrapper, writeFileSync } from '@/@utils';
import { createHash } from 'crypto';
import * as fs from 'fs';
import { isEqual, merge } from 'lodash';
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
  _target?: Object;
  _method?: PropertyDescriptor;
  _instance?: Object;
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
  date: Date,
  value: ReturnType<F>,
}

export type MemoizeCacheMap<F extends TypedFunction> = Record<string, MemoizeCacheItem<F>>;

export interface MemoizeCache<F extends TypedFunction, C> {
  disabled?: boolean,
  config?: MemoizeConfig['cacheConfig'],
  cache: C,
  state: any,
  memoizedFunc?: Memoized<ReturnType<F>>,
  init: () => void,
  get: (key: string) => MemoizeCacheItem<F> | undefined,
  set: (key: string, value: MemoizeCacheItem<F> | Promise<MemoizeCacheItem<F>>) => void,
  delete: (key: string) => void,
  flush: () => void,
  invalidate: (predicate: (key: string, value: MemoizeCacheItem<F>) => boolean) => void,
}

// CONSTS

export const globalMemoizeConfig: Partial<MemoizeConfig> = { // HOW-TO: globalMemoizeConfig.maxAge = 10;
  cacheType: MemoizeCacheType.Memory,
  cacheConfig: {
    cacheDir: path.join(tmpdir(), `/${path.basename(process.cwd())}-${path.basename(process.argv[1])}`),
  }
};

const memoizeMemory = <F extends TypedFunction>(config: MemoizeConfig) => {
  const memoryCache: MemoizeCache<F, MemoizeCacheMap<F>> = {
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
    }, err => err);
  }

  if (config.cacheConfig.cacheDir == null && config.cacheConfig.cachePath == null) throw new Error('Invalid cacheDir (null)');
  const defaultConfig: MemoizeCacheConfig = { cachePath: path.join(config.cacheConfig.cacheDir, `memoize-${config.funcKey(config)}.json`) };

  const storageCache: MemoizeCache<F, MemoizeCacheMap<F>> = {
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
  config = merge(globalMemoizeConfig, config);

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
        config._target = target;
        config._method = descriptor;
        config._instance = this;
        config.funcKey ??= () => `${config._instance?.constructor?.name}:${config._method.value?.name}`;

        const memoized = memoize(config._method.value.bind(config._instance), config).bind(config._instance);

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




// interface DataPoint {
//   value: number;
//   date: Date;
// }

// interface CacheEntry {
//   key: string;
//   data: DataPoint[];
// }

// interface CacheResult {
//   data: CacheEntry[];
//   missing: { minDate: Date; maxDate: Date }[];
// }

// const cache = new Map<string, DataPoint[]>();

// function fetchData(minDate: Date, maxDate: Date): DataPoint[] {
//   // Mock data
//   return [{ value: 123, date: minDate }, { value: 321, date: maxDate }];
// }

// function getData(minDate: Date, maxDate: Date): DataPoint[] {
//   const { data: cacheData, missing } = getDataFromCache(minDate, maxDate);
//   const fetchedData = missing.map(e => fetchData(e.minDate, e.maxDate)).flatMap(e => e);
  
//   // Flatten the cache data
//   const flattenedCacheData = cacheData.map(entry => entry.data).flatMap(e => e);
//   console.log(fetchedData, flattenedCacheData);
  
//   // Combine and sort the data
//   return [...fetchedData, ...flattenedCacheData].sort((a, b) => a.date.getTime() - b.date.getTime());
// }

// function getDataFromCache(minDate: Date, maxDate: Date): CacheResult {
//   // (e.g. minDate: 2023-03-15, maxDate: 2023-04-20)
//   const result: CacheResult = {
//       data: [],    // Will store cache entries that overlap with the requested date range
//       missing: [],  // Will store date ranges not found in the cache
//   };

//   // Convert cache keys to DateRange objects for easier manipulation
//   // (e.g. Assume cache has: '2023-03-01>2023-03-31', '2023-04-10>2023-04-30')
//   const cacheRanges = Array.from(cache.keys()).map(key => {
//       const [start, end] = key.split('>');
//       return {
//           minDate: new Date(start),
//           maxDate: new Date(end)
//       };
//   });
//   // (e.g. cacheRanges now: [{minDate: 2023-03-01, maxDate: 2023-03-31}, {minDate: 2023-04-10, maxDate: 2023-04-30}])

//   // Sort cache ranges by minDate to optimize the search process
//   cacheRanges.sort((a, b) => a.minDate.getTime() - b.minDate.getTime());
//   // (e.g. cacheRanges remains the same as they're already sorted)

//   // Initialize currentDate to the start of the requested range
//   let currentDate = new Date(minDate.getTime());
//   // (e.g. currentDate: 2023-03-15)

//   // Iterate through the entire requested date range
//   while (currentDate <= maxDate) {
//       // Find a cache range that overlaps with the current date
//       const overlappingRange = cacheRanges.find(range => 
//           range.minDate <= currentDate && range.maxDate >= currentDate
//       );
//       // (e.g. First iteration: overlappingRange is {minDate: 2023-03-01, maxDate: 2023-03-31})

//       if (overlappingRange) {
//           // If an overlapping range is found, add it to the result
//           const key = `${overlappingRange.minDate.toISOString().slice(0, 10)}>${overlappingRange.maxDate.toISOString().slice(0, 10)}`;
//           result.data.push({ key, data: cache.get(key)! });
//           // (e.g. result.data now has one entry: {key: '2023-03-01>2023-03-31', data: [...]}])

//           // Move currentDate to the end of the overlapping range (or maxDate if it's earlier)
//           currentDate = new Date(Math.min(maxDate.getTime(), overlappingRange.maxDate.getTime()) + 86400000); // Add one day
//           // (e.g. currentDate is now 2023-04-01)
//       } else {
//           // If no overlapping range is found, look for the next available cache range
//           const nextOverlap = cacheRanges.find(range => range.minDate > currentDate);
//           // (e.g. nextOverlap is {minDate: 2023-04-10, maxDate: 2023-04-30})
          
//           // Determine the end of the missing range
//           const missingEndDate = nextOverlap 
//               ? new Date(Math.min(maxDate.getTime(), nextOverlap.minDate.getTime() - 86400000)) // One day before next overlap
//               : new Date(maxDate.getTime()); // Or maxDate if no next overlap
//           // (e.g. missingEndDate is 2023-04-09)
          
//           // Add the missing range to the result
//           result.missing.push({ minDate: new Date(currentDate.getTime()), maxDate: missingEndDate });
//           // (e.g. result.missing now has one entry: {minDate: 2023-04-01, maxDate: 2023-04-09})
          
//           // Move currentDate to the start of the next day after the missing range
//           currentDate = new Date(missingEndDate.getTime() + 86400000); // Add one day
//           // (e.g. currentDate is now 2023-04-10)
//       }
//   }

//   // (e.g. Final result:
//   //  result.data = [
//   //    {key: '2023-03-01>2023-03-31', data: [...]},
//   //    {key: '2023-04-10>2023-04-30', data: [...]}
//   //  ]
//   //  result.missing = [
//   //    {minDate: 2023-04-01, maxDate: 2023-04-09}
//   //  ])

//   return result;
// }

// // Helper function to add data to the cache
// function addToCache(minDate: Date, maxDate: Date, data: DataPoint[]): void {
//   const key = `${minDate.toISOString().slice(0, 10)}>${maxDate.toISOString().slice(0, 10)}`;
//   cache.set(key, data);
// }

// // Example usage
// const startDate = new Date('2020-04-01');
// const endDate = new Date('2020-06-30');

// // Add some data to the cache
// addToCache(new Date('2020-04-01'), new Date('2020-04-30'), [
//   { value: 100, date: new Date('2020-01-15') },
//   { value: 200, date: new Date('2020-01-30') }
// ]);

// addToCache(new Date('2020-06-01'), new Date('2020-06-30'), [
//   { value: 300, date: new Date('2020-03-15') },
//   { value: 400, date: new Date('2020-03-30') }
// ]);

// const result = getData(startDate, endDate);
// console.log(result);