import { isIsoDate } from '../index';

export function tryParseJson<T = any>(str: string | undefined | null, reviver?: (this: any, key: string, value: any) => any, warn: boolean = true) {
    try {
        if (str == null) return null;
        return JSON.parse(str, reviver) as T;
    } catch (err) {
        if (warn) console.warn(err);
        return null;
    }
}

export function tryStringifyJson(obj: any, replacer?: (this: any, key: string, value: any) => any, warn: boolean = true) {
    try {
        if (obj == null) return null;
        if (typeof obj === 'string') return obj;
        return JSON.stringify(obj, replacer);
    } catch (err) {
        if (warn) console.warn(err);
        return null;
    }
}

export function tryStringifyCircularJson(obj: any, warn: boolean = true): string | null {
    try {
        if (obj == null) return null;
        if (typeof obj === 'string') return obj;
    
        const cache = new Set<any>();
        return JSON.stringify(obj, (key, value) => {
            if (typeof value === 'object' && value !== null) {
                if (cache.has(value)) return; // Duplicate reference found, discard key
                cache.add(value); // Store value in our collection
            }
            return value;
        });
    } catch (err) {
        if (warn) console.warn(err);
        return null;
    }
}

export function jsonDateReviver(key: string, value: any) {
    if (typeof value === 'string') {
        const isDate = isIsoDate(value);
        if (isDate) return new Date(value);
    }

    return value;
}
