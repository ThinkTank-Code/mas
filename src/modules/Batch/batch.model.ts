import { Schema, model, Document } from 'mongoose';

export type BatchStatus = 'upcoming' | 'running' | 'completed';

export interface IBatch extends Document {
    title: string;
    status: BatchStatus;
    isCurrent: boolean;
    courseFee: number;
    createdAt: Date;
    updatedAt: Date;
}

const batchSchema = new Schema<IBatch>(
    {
        title: {
            type: String,
            unique: true,
            required: true,
            trim: true,
        },
        status: {
            type: String,
            enum: ['upcoming', 'running', 'completed'],
            default: 'upcoming',
        },
        isCurrent: {
            type: Boolean,
            default: false,
        },
        courseFee: {
            type: Number,
            required: true,
            min: 0,
        },
    },
    {
        timestamps: true,
    }
);

export const BatchModel = model<IBatch>('Batch', batchSchema);
