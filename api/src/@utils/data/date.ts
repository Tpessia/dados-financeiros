import * as moment from 'moment-timezone';

// Date -> ['2020','12','31']
export function extractIsoDateParts(date: Date): string[] {
    if (!date) return [];

    const day = String(date.getDate()).padStart(2, '0');
    const month = String((date.getMonth() + 1)).padStart(2, '0');
    const year = date.getFullYear().toString();

    return [year, month, day];
}

// Date -> ['2020','12','31','23','59','59','999','-03:00']
export function extractIsoDateTimeParts(date: Date): string[] {
    if (!date) return [];

    const dateParts = extractIsoDateParts(date);

    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    const milliseconds = String(date.getMilliseconds()).padStart(3, '0');
    const tzoAbs = Math.abs(date.getTimezoneOffset()),
        tzoDif = date.getTimezoneOffset() >= 0 ? '-' : '+',
        tzo = `${tzoDif}${String(tzoAbs / 60).padStart(2, '0')}:${String(tzoAbs % 60).padStart(2, '0')}`;

    return dateParts.concat([hours, minutes, seconds, milliseconds, tzo]);
}

// Date -> 31/12/2020
export function dateToStr(date: Date, separator?: string): string;
export function dateToStr(date: Date | null | undefined, separator?: string): string | null;
export function dateToStr(date: Date | null | undefined, separator: string = '/'): string | null {
    if (date == null) return null;
    const dateParts = extractIsoDateParts(date);
    return dateParts.reverse().join(separator);
}

// Date -> 2020-12-31
export function dateToIsoStr(date: Date): string;
export function dateToIsoStr(date: Date | null | undefined): string | null;
export function dateToIsoStr(date: Date | null | undefined): string | null {
    if (date == null) return null;
    return extractIsoDateParts(date).join('-');
}

// Date -> 2020-12-31T23:59:59.999-03:00
export function dateTimeToIsoStr(date: Date): string;
export function dateTimeToIsoStr(date: Date | null | undefined): string | null;
export function dateTimeToIsoStr(date: Date | null | undefined): string | null {
    if (date == null) return null;
    const parts = extractIsoDateTimeParts(date);
    return `${parts[0]}-${parts[1]}-${parts[2]}T${parts[3]}:${parts[4]}:${parts[5]}.${parts[6]}${parts[7]}`;
}

// Date -> 23:59:59.999
export function timeToIsoStr(date: Date): string;
export function timeToIsoStr(date: Date | null | undefined): string | null;
export function timeToIsoStr(date: Date | null | undefined): string | null {
    if (date == null) return null;
    const parts = extractIsoDateTimeParts(date);
    return `${parts[3]}:${parts[4]}:${parts[5]}.${parts[6]}`;
}

// Date -> 2020-12
export function dateToYearMonthStr(date: Date, separator?: string): string;
export function dateToYearMonthStr(date: Date | null | undefined, separator?: string): string | null;
export function dateToYearMonthStr(date: Date | null | undefined, separator: string = '-'): string | null {
    if (date == null) return null;
    const parts = extractIsoDateParts(date);
    return `${parts[0]}${separator}${parts[1]}`;
}

// 31/12/2020 -> Date
export function strToDate(str: string | Date): Date;
export function strToDate(str: string | Date | null): Date | null;
export function strToDate(str: string | Date | undefined): Date | undefined;
export function strToDate(str: string | Date | null | undefined): Date | null | undefined;
export function strToDate(str: string | Date | null | undefined): Date | null | undefined {
    if (str == null) return str as any;
    if (str instanceof Date) return str;

    if (/\//.test(str)) {
        const parts = str.split('/');
        return new Date(+parts[2], +parts[1] - 1, +parts[0]);
    }
    
    return new Date(str);
}

export function isDate(date: any): date is Date {
    return date instanceof Date;
}

export function isIsoDate(str: string) {
    return (/(\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d\.\d+([+-][0-2]\d:[0-5]\d|Z))|(\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d([+-][0-2]\d:[0-5]\d|Z))|(\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d([+-][0-2]\d:[0-5]\d|Z))/).test(str);
}

export function isValidDate(date: Date | string | undefined | null) {
    if (date == null) return false;
    if (date instanceof Date) return !isNaN(date.getTime());
    else return !isNaN(new Date(date).getTime());
}

// 2020-12-31T00:00:00Z -> Moment
export function parseMoment(str: string | Date | null | undefined, format?: string): moment.Moment | null {
    if (str instanceof Date) return moment.parseZone(str.toISOString());
    if (typeof str === 'string') str = str.trim();
    if (!str) return null;

    const date = isIsoDate(str) ? moment.parseZone(str) : moment(str, format);
    return date;
}

// 2020-12-31T00:00:00Z -> Date
export function parseDate(str: string | Date | null | undefined, format?: string): Date | null {
    const date = parseMoment(str, format);
    return date?.isValid() ? date.toDate() : null;
}

// Date -> 2020-12-31
export const isoFormat = () => 'YYYY-MM-DDTHH:mm:ss.SSSZ';

// Date -> 2020-12-31 23:59:59.999-03:00
export const dateIsoFormat = () => 'YYYY-MM-DD';

// Date -> 23:59:59.999
export const timeIsoFormat = () => 'HH:mm:ss.SSS';

// Date -> 31/12/2020
export const dateFormat = (separator: string) => `DD${separator}MM${separator}YYYY`;

// Date -> 2020/12
export const yearMonthFormat = (separator: string) => `YYYY${separator}MM`;

export const dateToUnix = (date: Date) => date.getTime() / 1000;

export const getDateOnly = (date: Date) => new Date(date.getFullYear(), date.getMonth(), date.getDate());

export const getStartOfDay = (date: Date) => new Date(date.getFullYear(), date.getMonth(), date.getDate());

export const getEndOfDay = (date: Date) => new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59, 999);

export const getFirstOfYear = (date: Date) => new Date(date.getFullYear(), 0, 1);

export const getLastOfYear = (date: Date) => new Date(date.getFullYear(), 11, 31);

export const getFirstOfMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth(), 1);

export const getLastOfMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth() + 1, 0);

export enum DurationLevel {
    MilliSeconds = 0,
    Seconds = 1,
    Minutes = 2,
    Hours = 3,
    Days = 4,
}

export function getDiffDuration(a: Date, b: Date, level: DurationLevel = DurationLevel.Hours) {
    let diffMilli = Math.abs(a.getTime() - b.getTime());
    return getDuration(diffMilli, level);
}

export function getDuration(durationMilli: number, level: DurationLevel = DurationLevel.Hours) {
    let durationSecs = durationMilli / 1000;

    let days: number | null = null;
    let hours: number | null = null;
    let minutes: number | null = null;
    let seconds: number | null = null;
    let milliseconds: number | null = null;

    if (level >= DurationLevel.Days) {
        // calculate days
        days = Math.floor(durationSecs / 86400);
        durationSecs -= days * 86400;
    }

    if (level >= DurationLevel.Hours) {
        // calculate hours
        hours = Math.floor(durationSecs / 3600);
        durationSecs -= hours * 3600;
    }

    if (level >= DurationLevel.Minutes) {
        // calculate minutes
        minutes = Math.floor(durationSecs / 60);
        durationSecs -= minutes * 60;
    }

    if (level >= DurationLevel.Seconds) {
        // calculate seconds
        seconds = Math.floor(durationSecs);
        durationSecs -= seconds;
    }

    if (level >= DurationLevel.MilliSeconds) {
        // calculate milliseconds
        milliseconds = Math.floor(durationSecs * 1000);
    }

    let difference = '';

    if (days != null)
      difference += `${days} `;

    if (hours != null)
        difference += `${String(hours).padStart(2, '0')}:`;

    if (minutes != null)
        difference += `${String(minutes).padStart(2, '0')}:`; 

    if (seconds != null)
        difference += `${String(seconds).padStart(2, '0')}.`; 

    if (milliseconds != null)
        difference += `${String(milliseconds).padStart(3, '0').padEnd(3, '0')}`; 

    return difference;
}

// 2021-09-30T21:00:00-03:00 -> 2021-10-01T00:00:00-03:00
export function normalizeTimezone(date: string | Date): Date;
export function normalizeTimezone(date: string | Date | null | undefined): Date | null
export function normalizeTimezone(date: string | Date | null | undefined) {
    if (date == null) return null;
    if (typeof(date) === 'string') date = new Date(date);
    return new Date(date.getTime() + date.getTimezoneOffset() * 60 * 1000);
}

export function addDate(date: Date, days: number = 0, hours: number = 0, minutes: number = 0, seconds: number = 0, milliseconds: number = 0): Date {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    result.setHours(result.getHours() + hours, result.getMinutes() + minutes, result.getSeconds() + seconds, result.getMilliseconds() + milliseconds);
    return result;
}

export const isWeekend = (date: Date) => date.getDay() % 6 === 0;

export function datesRange(startDate: Date, endDate: Date) {
    const dates: Date[] = [];
    let currentDate = new Date(startDate);

    while (currentDate <= endDate) {
        dates.push(new Date(currentDate));
        currentDate.setDate(currentDate.getDate() + 1);
    }

    return dates;
}

export const businessDaysRange = (startDate: Date, endDate: Date) => datesRange(startDate, endDate).filter(e => !isWeekend(e));

export function businessDaysInYear(year: number) {
    const startDate = new Date(year, 0, 1); // January 1st of the given year
    const endDate = new Date(year, 11, 31); // December 31st of the given year
    const businessDays = businessDaysRange(startDate, endDate).length;
    return businessDays;
}

// Utility function to handle all date range splitting logic
export function splitDateRanges(startDate: Date, endDate: Date, maxYears: number): [Date, Date][] {
    const MAX_DATE_RANGE_MS = maxYears * 365 * 24 * 60 * 60 * 1000;
    
    // If the range is smaller than our max, return it as a single range
    if (endDate.getTime() - startDate.getTime() <= MAX_DATE_RANGE_MS) {
        return [[startDate, endDate]];
    }
    
    // Otherwise, split into multiple ranges
    const ranges: Array<[Date, Date]> = [];
    let currentStart = new Date(startDate);
    
    while (currentStart < endDate) {
        let currentEnd = new Date(currentStart.getTime() + MAX_DATE_RANGE_MS);
        if (currentEnd > endDate) {
            currentEnd = new Date(endDate);
        }
        
        ranges.push([new Date(currentStart), new Date(currentEnd)]);
        currentStart = new Date(currentEnd.getTime() + 1); // Add 1ms to avoid overlap
    }
    
    return ranges;
};
