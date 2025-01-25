import { businessDaysInYear, businessDaysRange, dateToIsoStr, datesRange, getEndOfDay, getFirstOfMonth, getLastOfMonth, getStartOfDay, isWeekend, round } from '@/@utils';
import { AssetData } from '@/core/models/AssetData';
import { AssetHistData } from '@/core/models/AssetHistData';
import { ConfigService } from '@/core/services/config.service';
import { orderBy } from 'lodash';

export const initAssetValue: number = 100;

export function dailyfyPercents(monthlyData: AssetData[], maxDate?: Date): AssetData[] {
  const dailyData: AssetData[] = [];

  for (const data of monthlyData) {
    const daysInMonth = datesRange(getFirstOfMonth(data.date), getLastOfMonth(data.date)).filter(e => !isWeekend(e));
    const dailyValue = Math.pow(1 + data.value, 1 / daysInMonth.length) - 1;

    for (const day of daysInMonth) {
      if (maxDate != null && day > maxDate) break;

      const dayOfWeek = day.getDay();
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

      if (!isWeekend) {
        dailyData.push({
          assetCode: data.assetCode,
          date: day,
          value: dailyValue,
          currency: data.currency,
        });
      }
    }
  }

  return dailyData;
}

export function assetfy(data: AssetData[], initValue: number = initAssetValue): AssetData[] {
  const assetData: AssetData[] = [];
  let assetValue = initValue;

  for (const { value, ...rest } of data) {
    assetData.push({
      ...rest,
      value: assetValue,
    });

    assetValue = assetValue * (1 + value);
  }

  return assetData;
}

export function convertCurrency<T extends AssetData>(data: T[], currency: AssetData[]): T[] {
  const convertedData: T[] = [];
  let lastCurrency: AssetData;

  const currencyMap = new Map(currency.map(c => [dateToIsoStr(c.date), c]));

  for (const assetData of data) {
    const currencyData = currencyMap.get(dateToIsoStr(assetData.date));
    if (currencyData) lastCurrency = currencyData;

    if (!lastCurrency) continue;

    const data: AssetData = {
      assetCode: assetData.assetCode,
      date: assetData.date,
      value: assetData.value * lastCurrency.value,
      currency: lastCurrency.currency,
    };

    convertedData.push(data as any);
  }

  return convertedData;
}

export function generateFixedRate(assetCode: string, start: Date, end: Date, initValue: number, annualIrr: number): AssetData[] {
  const dates = businessDaysRange(start, end);
  const data: AssetData[] = [];

  // Get the start and end years from the date range
  const startYear = start.getFullYear();
  const endYear = end.getFullYear();

  // Count the trading days for each year in the date range
  const tradingDaysByYear = new Map<number, number>();
  for (let year = startYear; year <= endYear; year++) {
    const tradingDays = businessDaysInYear(year);
    tradingDaysByYear.set(year, tradingDays);
  }

  // Generate the asset data
  for (let i = 0; i < dates.length; i++) {
    const date = dates[i];
    const year = date.getFullYear();
    const periodNumber = i; // + 1;
    const periodsPerYear = tradingDaysByYear.get(year)-1 || 260;
    const rate = Math.pow(1 + annualIrr, periodNumber / periodsPerYear);
    data.push({ assetCode, date, value: initValue * rate });
  }

  return data;
}

export function applyLeverage(data: AssetData[], leverage: number): AssetData[] {
  if (leverage <= 0 || leverage === 1) return data;

  const leveragedData: AssetData[] = [];

  let currentValue = data[0].value;
  leveragedData.push({ ...data[0], value: currentValue });

  for (let i = 1; i < data.length; i++) {
    const { value, ...rest } = data[i];
    const previousValue = data[i - 1].value;
    const dailyChange = value - previousValue;
    const leveragedDailyChange = dailyChange * leverage;
    let leveragedValue = currentValue + leveragedDailyChange;

    // TODO: Handle negative value
    // if (leveragedValue < 0) leveragedValue = 0;

    leveragedData.push({
      ...rest,
      value: leveragedValue,
    });

    currentValue = leveragedValue;
  }

  return leveragedData;
}

export function cleanUpData(data: AssetHistData<AssetData>): AssetHistData<AssetData> {
  const newData: AssetData[] = [];

  for (let item of data.data) {
    if (!data.metadata.assetCode && item.assetCode) data.metadata.assetCode = item.assetCode;
    if (!data.metadata.currency && item.currency) data.metadata.currency = item.currency;

    const newItem: Partial<AssetData> = {
      date: item.date,
      value: item.value > 1 ? round(item.value, 2) : item.value,
    };
    newData.push(newItem as AssetData);
  }

  data.data = newData;

  return data;
}

export function sumAssets(key: string, ...data: AssetHistData<AssetData>[]): AssetHistData<AssetData> {
  if (!data.length) throw new Error('Length 0 at sumAssets');

  const cfg = ConfigService.config;

  // Parse assets and operations from key (e.g. "VTI+TSLA~BRL=X")
  const assetKeys = key.split(cfg.sumRegex).filter(k => k !== '');
  const operations = [...key.matchAll(cfg.sumRegexG)].map(m => m[0]);
  const assets = assetKeys.map(k => data.find(d => d.key === k));
  if (assets.some(a => !a || !a.data.length)) throw new Error(`Missing assets for ${key}`);

  // Validate currencies
  const currencies = new Set(assets.map(e => e.data[0].currency));
  if (currencies.size !== 1) throw new Error('Currency missmatch at sumAssets');
  const currency = currencies.values().next().value;

  // Prepare data structure for calculations
  const dataMap = assets.map(e => new Map(e.data.map(f => [dateToIsoStr(f.date), f.value])));
  const dates = new Set(orderBy(dataMap.flatMap(e => [...e.keys()])));

  let initValues: number[] = [];
  let lastestValues: number[] = [];

  // Calculate return variations for each date
  const timeseriesData = [...dates].map(date => {
    // Get variation for each asset relative to its initial value
    const variations = dataMap.map((assetData, i) => {
      const currentValue = assetData.get(date) ?? lastestValues[i];

      // Handle first data point (return 1 = no variation)
      if (!currentValue) return 1;
      
      // Set initial values for relative return calculation
      if (!initValues[i]) initValues[i] = currentValue;

      return currentValue / initValues[i];
    });

    // Update last known values for next iteration
    lastestValues = dataMap.map((e, i) => e.get(date) ?? lastestValues[i]);

    // Combine variations applying operations (+ or ~)
    const combinedVariation = variations.reduce((total, variation, i) => {
      const multiplier = i === 0 ? 1 : operations[i-1] === cfg.sumOp ? 1 : -1;
      return total * Math.pow(variation, multiplier);
    }, initAssetValue);

    return {
      date: new Date(date),
      assetCode: key,
      value: combinedVariation,
      currency,
    };
  });

  return {
    key,
    granularity: data[0].granularity,
    metadata: { ...assets[0].metadata, ...assets.flatMap(e => e.metadata) },
    type: assets.map(e => e.type).join('+') as any,
    data: timeseriesData,
  };
}

export function trimAssets(key: string, ...data: AssetHistData<AssetData>[]): AssetHistData<AssetData> {
  if (!data.length) throw new Error('Length 0 at sumAssets');

  const cfg = ConfigService.config;

  // Parse asset from key (e.g. "SELIC.SA[2023-01-01|2024-01-01]")
  const assetCode = key.replace(cfg.trimmerRegex, '');
  const [_, start, end] = key.match(cfg.trimmerRegex) || [];
  const asset = data.find(d => d.key === assetCode);
  if (asset == null || !asset.data.length) throw new Error(`Missing asset for ${key}`);

  // Filter the data
  const startDate = start ? getStartOfDay(new Date(start)) : null;
  const endDate = end ? getEndOfDay(new Date(end)) : null;
  const trimmedData = asset.data.filter(e => (!startDate || e.date >= startDate) && (!endDate || e.date <= endDate));

  return {
    ...asset,
    key,
    data: trimmedData,
  };
}