// Similar to Promise.all, but parallel
export function promiseParallel<T>(tasks: (() => Promise<T>)[], concurrencyLimit: number): Promise<T[]> {
    return new Promise<T[]>((res, rej) => {
        if (tasks.length === 0) res([]);

        const results: T[] = [];
        const pool: Promise<T>[] = [];
        let canceled: boolean = false;

        tasks.slice(0, concurrencyLimit).map(e => runPromise(e));

        function runPromise(task: () => Promise<T>): Promise<T> {
            const promise = task();

            pool.push(promise);

            promise.then(r => {
                if (canceled) return;

                results.push(r);

                const poolIndex = pool.indexOf(promise);
                pool.splice(poolIndex, 1);

                if (tasks.length === results.length)
                    res(results);

                const nextIndex = concurrencyLimit + results.length - 1;
                const nextTask = tasks[nextIndex];

                if (!nextTask) return;

                runPromise(nextTask);
            }).catch(err => {
                canceled = true;
                rej(err);
            });

            return promise;
        }
    });
}

// Similar to Promise.all, but parallel and without rejection
export function promiseParallelAll<T, TRej = Error>(tasks: (() => Promise<T>)[], concurrencyLimit: number): Promise<(T | TRej)[]> {
    return new Promise<(T | TRej)[]>((res, rej) => {
        if (tasks.length === 0) res([]);

        const results: (T | TRej)[] = [];
        const pool: Promise<T>[] = [];
        let canceled: boolean = false;

        tasks.slice(0, concurrencyLimit).map(e => runPromise(e));

        function runPromise(task: () => Promise<T>): Promise<T> {
            const promise = task();

            pool.push(promise);

            promise.catch((e: TRej) => e)
            .then(r => {
                if (canceled) return;

                results.push(r);

                const poolIndex = pool.indexOf(promise);
                pool.splice(poolIndex, 1);

                if (tasks.length === results.length)
                    res(results);

                const nextIndex = concurrencyLimit + results.length - 1;
                const nextTask = tasks[nextIndex];

                if (!nextTask) return;

                runPromise(nextTask);
            });

            return promise;
        }
    });
}

export async function promiseRetry<T>(func: () => Promise<T>, maxRetries: number, onError?: (err: any) => void): Promise<T> {
    try {
        return await func();
    } catch (err) {
        onError?.(err);
        const funcAny = (func as any);
        funcAny._retries = (funcAny._retries as number ?? 0) + 1;
        if (funcAny._retries >= maxRetries) throw err;
        else return await promiseRetry(func, maxRetries, onError);
    }
}

export type TypedFunction<T = any> = (...args: any[]) => any | Promise<T>;
export type TypedFunctionWrapper<T extends TypedFunction> = ((...args: Parameters<T>) => ReturnType<T>);
export type TypedSyncFunction<T = any> = (...args: any[]) => T;
export type TypedAsyncFunction<T = any> = (...args: any[]) => Promise<T>;

export function isPromise<T>(value: T | Promise<T>): value is Promise<T> {
    return value instanceof Promise;
}

export function isAsyncFunction(func: TypedFunction): func is TypedAsyncFunction {
    return func.constructor.name == 'AsyncFunction';
}

// Receives a value that could be already resolved or yet a Promise,
// and calls the callback with the resolved value,
// returning the resolved result or a new promise
// export function runOrResolve<T, U>(value: T, func: (resolved: T) => U): U;
// export function runOrResolve<T, U>(value: Promise<T>, func: (resolved: T) => U): Promise<U>;
export function runOrResolve<T, U>(value: T | Promise<T>, callback: (resolved: T) => U, errCallback?: (rejected: any) => any): U | Promise<U> {
    return isPromise(value)
        ? value.then(callback).catch(err => errCallback?.(err) ?? (err => { throw err; })(err))
        : callback(value as T);
}
