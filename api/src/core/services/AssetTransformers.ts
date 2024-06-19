import { businessDaysInYear, businessDaysRange, dateToIsoStr, datesRange, getFirstOfMonth, getLastOfMonth, isWeekend } from '@/@utils';
import { AssetData } from '@/core/models/AssetData';
import { round } from 'lodash';

export const initValue: number = 1000;

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
        });
      }
    }
  }

  return dailyData;
}

export function assetfy(data: AssetData[], initValue: number): AssetData[] {
  const assetData: AssetData[] = [];
  let assetValue = initValue;

  for (const { assetCode, date, value } of data) {
    assetData.push({
      assetCode,
      date,
      value: assetValue,
    });

    assetValue = assetValue * (1 + value);
  }

  return assetData;
}

export function convertCurrency<T extends AssetData>(data: T[], currency: AssetData[]): T[] {
  const convertedData: T[] = [];
  let lastCurrencyValue: number;

  for (const assetData of data) {
    const currencyData = currency.find(c => dateToIsoStr(assetData.date) === dateToIsoStr(c.date));
    if (currencyData) lastCurrencyValue = currencyData.value;

    const data: AssetData = {
      assetCode: assetData.assetCode,
      date: assetData.date,
      value: assetData.value * lastCurrencyValue,
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
    const periodsPerYear = tradingDaysByYear.get(year)-1 || 252;
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
    const { assetCode, date } = data[i];
    const previousValue = data[i - 1].value;
    const dailyChange = data[i].value - previousValue;
    const leveragedDailyChange = dailyChange * leverage;
    let leveragedValue = currentValue + leveragedDailyChange;

    // Handle negative value
    if (leveragedValue < 0) leveragedValue = 0;

    leveragedData.push({
      assetCode,
      date,
      value: leveragedValue,
    });

    currentValue = leveragedValue;
  }

  return leveragedData;
}

export function cleanUpData(data: AssetData[]): AssetData[] {
  return data.map(e => ({ assetCode: e.assetCode, date: e.date, value: e.value > 1 ? round(e.value, 2) : e.value }));
}
