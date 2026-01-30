import mongoose, { Schema, Document } from 'mongoose';

export type EmailStatus = 'pending' | 'processing' | 'sent' | 'failed' | 'cancelled';
export type EmailPriority = 'high' | 'normal' | 'low';

export interface IEmailLog extends Document {
    to: string;
    subject: string;
    html: string;
    text?: string;
    eventType?: string; // e.g., 'verify_email'
    eventId?: string;   // Unique ID to prevent duplicates
    status: EmailStatus;
    priority: EmailPriority;
    attempts: number;
    maxRetries: number;
    lastError?: string;
    nextAttemptAt: Date;
    attachments?: Array<{ filename: string; path?: string; content?: string }>;
    createdAt: Date;
    updatedAt: Date;
}

const EmailLogSchema = new Schema<IEmailLog>(
    {
        to: { type: String, required: true, index: true },
        subject: { type: String, required: true },
        html: { type: String, required: true }, // Store HTML to allow retry after crash
        text: { type: String },
        eventType: { type: String, index: true },
        eventId: { type: String, index: true },
        status: { 
            type: String, 
            enum: ['pending', 'processing', 'sent', 'failed', 'cancelled'], 
            default: 'pending',
            index: true 
        },
        priority: { type: String, enum: ['high', 'normal', 'low'], default: 'normal' },
        attempts: { type: Number, default: 0 },
        maxRetries: { type: Number, default: 3 },
        lastError: { type: String },
        nextAttemptAt: { type: Date, default: Date.now, index: true },
        attachments: [{
            filename: String,
            path: String,
            content: String
        }]
    },
    { timestamps: true }
);

// Compound index for efficient polling: Give me pending high-priority emails due for sending
EmailLogSchema.index({ status: 1, nextAttemptAt: 1, priority: 1 });

// Prevent duplicate emails for the same event
EmailLogSchema.index(
    { eventType: 1, eventId: 1, to: 1 },
    { unique: true, partialFilterExpression: { eventId: { $exists: true } } }
);

export const EmailLogModel = mongoose.model<IEmailLog>('EmailLog', EmailLogSchema);