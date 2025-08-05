import { z } from 'zod';

export const batchStatusEnum = z.enum(['upcoming', 'running', 'completed']);

// ✅ Create Batch Schema
export const createBatchSchema = z.object({
    body: z.object({
        title: z
            .string({
                required_error: 'Title is required',
            })
            .min(1, 'Title cannot be empty')
    }),
});

// ✅ Update Batch Schema
export const updateBatchSchema = z.object({
    body: z.object({
        title: z.string().min(1, 'Title cannot be empty').optional(),
        status: batchStatusEnum.optional(),
        isCurrent: z.boolean().optional(),
    }),
});
