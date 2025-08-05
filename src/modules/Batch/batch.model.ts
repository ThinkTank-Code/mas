import { Schema, model, Document } from 'mongoose';

export type BatchStatus = 'upcoming' | 'running' | 'completed';

export interface IBatch extends Document {
    title: string;
    status: BatchStatus;
    isCurrent: boolean;
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
    },
    {
        timestamps: true,
    }
);

export const BatchModel = model<IBatch>('Batch', batchSchema);
