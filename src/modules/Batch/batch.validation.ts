import { z } from 'zod';

export const batchStatusEnum = z.enum(['upcoming', 'running', 'completed']);

// ✅ Create Batch Schema
export const createBatchSchema = z.object({
    body: z.object({
        title: z
            .string({
                required_error: 'Title is required',
            })
            .min(1, 'Title cannot be empty'),
        courseFee: z
            .number({
                required_error: 'Course fee is required',
                invalid_type_error: 'Course fee must be a number',
            })
            .nonnegative('Course fee must be zero or greater'),
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
