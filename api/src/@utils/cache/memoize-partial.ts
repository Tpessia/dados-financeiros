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