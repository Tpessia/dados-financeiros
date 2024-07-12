import { deepEqual } from '../index';

export function chunckfyArray<T>(array: T[], chunckLength: number) {
    let chunks: T[][] = [];
    for (let i = 0, j = array.length; i < j; i += chunckLength)
        chunks.push(array.slice(i, i + chunckLength));
    return chunks;
}

export function arrayDistinct<T>(array: T[], deep: boolean = false) {
    const filterUnique = (value: T, index: number, self: T[]) =>
        self.indexOf(value) === index;

    const filterUniqueDeep = (value: T, index: number, self: T[]) =>
        deepEqual(self.indexOf(value), index);

    return array.filter(deep ? filterUniqueDeep : filterUnique);
}

export function sortByStr<T>(array: T[], selector: (e: T) => any = e => e) {
    return array.sort((a, b) => (selector(a) || '').localCompare(selector(b) || ''));
}

export function sortByNumber<T>(array: T[], selector: (e: T) => any = e => e) {
    return array.sort((a, b) => (selector(a) || 0) - (selector(b) || 0));
}

export function numDictToArray<T>(dict: {[key: number]: T}) {
    return (Object.entries(dict) as any as [number, T][]).reduce((acc, val) => {
        acc[val[0]] = val[1];
        return acc;
    }, [] as T[]);
}

export function spliceImmutable<T>(array: T[], start: number, deleteCount?: number, ...items: T[]) {
    // const rest = array.slice(start, start + deleteCount);
    let newArray = array.slice(0, start);
    if (items && items.length > 0) newArray.push(...items);
    if (deleteCount != null) newArray = newArray.concat(array.slice(start + deleteCount));
    return newArray;
}

export function arrayRandomItem<T>(arr: T[]) {
    const random = Math.floor(Math.random() * arr.length);
    return arr[random];
}

export function pickEvenly<T>(arr: T[], len: number): T[] {
    if (len <= 0 || arr.length <= 1 || arr.length < len) return arr;
    const step = (arr.length - 1) / (len - 1);
    return Array.from({ length: len }, (_, i) => arr[Math.round(i * step)]);
}
