import * as moment from 'moment-timezone';

// Date -> ['2020','12','31']
export function extractIsoDateParts(date: Date): string[] {
    if (!date) return [];

    const day = prependZeros(date.getDate());
    const month = prependZeros((date.getMonth() + 1));
    const year = date.getFullYear().toString();

    return [year, month, day];
}

// Date -> ['2020','12','31','23','59','59','999','-03:00']
export function extractIsoDateTimeParts(date: Date): string[] {
    if (!date) return [];

    const dateParts = extractIsoDateParts(date);

    const hours = prependZeros(date.getHours());
    const minutes = prependZeros(date.getMinutes());
    const seconds = prependZeros(date.getSeconds());
    const milliseconds = prependZeros(date.getMilliseconds(), 3);
    const tzoAbs = Math.abs(date.getTimezoneOffset()),
        tzoDif = date.getTimezoneOffset() >= 0 ? '-' : '+',
        tzo = `${tzoDif}${prependZeros(tzoAbs / 60)}:${prependZeros(tzoAbs % 60)}`;

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

// Date -> 2020-12-31 23:59:59.999-03:00
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
        difference += `${prependZeros(hours)}:`;

    if (minutes != null)
        difference += `${prependZeros(minutes)}:`; 

    if (seconds != null)
        difference += `${prependZeros(seconds)}.`; 

    if (milliseconds != null)
        difference += `${appendZeros(prependZeros(milliseconds, 3), 3)}`; 

    return difference;
}

export function prependZeros(number: string | number, size: number = 2) {
    let str = number.toString();
    if (str.length < size)
        str = '0' + str;
    return str;
}

export function appendZeros(number: string | number, size: number = 2) {
    let str = number.toString();
    if (str.length < size)
        str = str + '0';
    return str;
}

// 2021-09-30T21:00:00-03:00 -> 2021-10-01T00:00:00-03:00
export function normalizeTimezone(date: string | Date): Date;
export function normalizeTimezone(date: string | Date | null | undefined): Date | null
export function normalizeTimezone(date: string | Date | null | undefined) {
    if (date == null) return null;
    if (typeof(date) === 'string') date = new Date(date);
    return new Date(date.getTime() + date.getTimezoneOffset() * 60 * 1000);
}

export function addDays(date: Date, days: number) {
    var result = new Date(date);
    result.setDate(result.getDate() + days);
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
