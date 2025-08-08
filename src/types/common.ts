import { IGenericErrorMessage } from './error';

export type IGenericResponse<T> = {
    meta: {
        page: number;
        limit: number;
        total: number;
    };
    data: T;
};

export type IGenericErrorResponse = {
    statusCode: number;
    message: string;
    errorMessages: IGenericErrorMessage[];
};

export enum Status {
    Pending = "pending",
    Success = "success",
    Failed = "failed",
    Review = "review",
    Risk = "risk",
    Cancel = "cancel"
}
