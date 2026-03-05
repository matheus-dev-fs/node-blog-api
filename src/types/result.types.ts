export type ResultSuccess<T> = {
    success: true;
    data: T;
}

export type ResultError = {
    success: false;
    error: string;
}

export type Result<T> = ResultSuccess<T> | ResultError;