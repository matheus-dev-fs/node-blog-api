export type ServiceSuccess<T> = {
    success: true;
    data: T;
}

export type ServiceError = {
    success: false;
    error: string;
}

export type ServiceResult<T> = ServiceSuccess<T> | ServiceError;