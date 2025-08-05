import { Schema, model } from 'mongoose';

export interface IStudent {
    name: string;
    email: string;
    studentId: string;
    address: string;
    phone: string;
    paymentStatus: 'pending' | 'success' | 'failed';
}

const studentSchema = new Schema<IStudent>(
    {
        name: { type: String, required: true },
        email: { type: String, required: true },
        studentId: { type: String, required: true, unique: true },
        address: { type: String, required: true },
        phone: { type: String, required: true },
        paymentStatus: {
            type: String,
            enum: ['pending', 'success', 'failed'],
            default: 'pending',
        },
    },
    {
        timestamps: true,
    }
);

export const StudentModel = model<IStudent>('Student', studentSchema);
