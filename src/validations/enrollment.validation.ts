import { z } from 'zod';

export const initiateEnrollmentSchema = z.object({
    batchId: z.string(),
});

export const updateEnrollmentStatusSchema = z.object({
    status: z.enum(['Pending', 'Active', 'Completed', 'Expired', 'Cancelled', 'PaymentFailed']),
    reason: z.string().optional(),
});
