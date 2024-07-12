import { jsonDateReviver, tryParseJson, tryStringifyJson } from '../index';

export function deepEqual(a: any, b: any) {
    if (a && b && typeof a === 'object' && typeof b === 'object') {
        if (Object.keys(a).length !== Object.keys(b).length) return false;
        for (var key in a) if (!deepEqual(a[key], b[key])) return false;
        return true;
    } else {
        return a === b;
    }
}

export function loopObjects(obj: any,
    callback?: (item: any, key: any, prevItem: any, rootObj: any) => void,
    primitiveCallback?: (item: any, key: any, prevItem: any, rootObj: any) => void,
    rootObj?: any) {
    for (let i in obj) {
        if (!obj.hasOwnProperty(i)) continue;
        if (typeof obj[i] === 'object') {
            callback?.(obj[i], i, obj, rootObj || obj);
            loopObjects(obj[i], callback, primitiveCallback, rootObj || obj);
        } else {
            primitiveCallback?.(obj[i], i, obj, rootObj || obj);
        }
    }
}

export async function loopObjectsAsync(obj: any,
    callback?: (item: any, key: any, prevItem: any, rootObj: any) => Promise<void>,
    primitiveCallback?: (item: any, key: any, prevItem: any, rootObj: any) => Promise<void>,
    rootObj?: any) {
    for (let i in obj) {
        if (!obj.hasOwnProperty(i)) continue;
        if (typeof obj[i] === 'object') {
            await callback?.(obj[i], i, obj, rootObj || obj);
            loopObjects(obj[i], callback, primitiveCallback, rootObj || obj);
        } else {
            await primitiveCallback?.(obj[i], i, obj, rootObj || obj);
        }
    }
}

export function flattenObject(obj: any, separator: string = '.', skipArrays: boolean = false): Record<string, any> {
    let flattenKeys: Record<string, any> = {};

    for (let i in obj) {
        if (!obj.hasOwnProperty(i)) continue;
        if (typeof obj[i] === 'object') {
            if (skipArrays && Array.isArray(obj[i])) {
                let flatObject = obj[i].map((e: any) => typeof(e) === 'object' ? flattenObject(e, separator, skipArrays) : e);
                flattenKeys[i] = flatObject;
            } else {
                let flatObject = flattenObject(obj[i], separator, skipArrays);
                for (let j in flatObject) {
                    if (!flatObject.hasOwnProperty(j)) continue;
                    flattenKeys[i + separator + j] = flatObject[j];
                }
            }
        } else {
            flattenKeys[i] = obj[i];
        }
    }

    return flattenKeys;
}

// ['a','b'], [[1,2],[3,4]] -> [{a:1,b:2},{a:3,b:4}]
export function parseHeaderMatrix<T>(headers: string[], data: T[][]): T[] {
    return data.map(row => {
        const obj: any = {};
        headers.forEach((header, i) => obj[header] = row[i]);
        return obj;
    });
}

export function renameObjectKeys(obj: any, replacements: Record<string, string>) {
    for (let key of Object.keys(obj)) {
        const newKey = replacements[key];
        if (newKey) {
            Object.defineProperty(obj, newKey, Object.getOwnPropertyDescriptor(obj, key)!);
            delete obj[key];
        }
    }
}

export function reviveObjDates<T>(obj: T): T {
    const str = tryStringifyJson(obj);
    return tryParseJson(str, jsonDateReviver) as T;
}
