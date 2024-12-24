import { businessDaysInYear, businessDaysRange, dateToIsoStr, datesRange, getFirstOfMonth, getLastOfMonth, isWeekend, round } from '@/@utils';
import { AssetData } from '@/core/models/AssetData';
import { AssetHistData } from '@/core/models/AssetHistData';
import { ConfigService } from '@/core/services/config.service';

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

export function assetfy(data: AssetData[], initValue: number): AssetData[] {
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

    const newItem: Omit<AssetData, 'assetCode'> = {
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

  const assetKeys = key.split(ConfigService.config.sumRegex).filter(k => k !== '');
  const operations = [...key.matchAll(ConfigService.config.sumRegexG)].map(m => m[0]);
  const assets = assetKeys.map(k => data.find(d => d.key === k));

  if (assets.some(a => !a)) throw new Error(`Missing assets for ${key}`);

  const newData: AssetHistData<AssetData> = {
    key,
    granularity: data[0].granularity,
    metadata: assets.flatMap(e => e!.metadata),
    type: assets.map(e => e!.type).join('+') as any,
    data: [],
  };

  const currencies = new Set(assets.map(e => e!.data[0].currency));
  if (currencies.size !== 1) throw new Error('Currency missmatch at sumAssets');
  const currency = currencies.values().next().value;

  const dataMap = assets.map(e => new Map(e!.data.map(f => [dateToIsoStr(f.date), f.value])));
  const dates = new Set(dataMap.flatMap(e => [...e.keys()]));
  let prevValues: number[] = [];
  let baseValues: number[] = [];

  for (let date of dates) {
    const values = dataMap.map((e, i) => {
      const currentValue = e.get(date);
      const prevValue = prevValues[i];
      if (!currentValue) return 1;
      if (!prevValue) {
        baseValues[i] = currentValue;
        return 1;
      }
      return currentValue / baseValues[i];
    });

    prevValues = dataMap.map((e, i) => e.get(date) ?? prevValues[i]);

    const value = values.reduce((sum, val, i) => {
      const op = i === 0 ? 1 : operations[i-1] === '+' ? 1 : -1;
      return sum * Math.pow(val, op);
    }, 1);

    newData.data.push({
      date: new Date(date),
      assetCode: key,
      value,
      currency,
    });
  }

  return newData;
 }