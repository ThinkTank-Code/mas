import { Schema, model } from 'mongoose';
import { IStudent } from './student.interface';

const studentSchema = new Schema<IStudent>(
    {
        name: { type: String, required: true },
        email: { type: String, required: true, unique: true },
        address: { type: String, required: true },
        phone: { type: String, required: true },
        status: {
            type: String,
            enum: ['active', 'blocked', 'deleted'],
            default: 'active',
        },
    },
    {
        timestamps: true,
    }
);

export const StudentModel = model<IStudent>('Student', studentSchema);
