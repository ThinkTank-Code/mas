import { Schema, Types, model } from 'mongoose';
import { IStudent } from './student.interface';



const studentSchema = new Schema<IStudent>(
    {
        name: { type: String, required: true },
        email: { type: String, required: true },
        studentId: { type: String, required: true, unique: true },
        batch: {
            type: Schema.Types.ObjectId,
            ref: 'Batch',
            required: true,
        },
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
