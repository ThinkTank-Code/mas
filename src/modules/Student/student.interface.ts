import { Types } from "mongoose";

export interface IStudent {
    name: string;
    email: string;
    studentId: string;
    address: string;
    phone: string;
    paymentStatus: 'pending' | 'success' | 'failed';
    batch: Types.ObjectId;
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