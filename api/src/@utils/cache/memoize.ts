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