import { Types } from "mongoose";

export interface IStudent {
    name: string;
    email: string;
    address: string;
    phone: string;
    status: 'active' | 'blocked' | 'deleted'
}

export interface GetStudentsParams {
    search?: string;
    paymentStatus?: 'pending' | 'success' | 'failed';
    batch?: string; // batch id as string
    page?: number;
    limit?: number;
    sortBy?: keyof IStudent;
    sortOrder?: 'asc' | 'desc';
}