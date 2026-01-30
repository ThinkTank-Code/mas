import { z } from 'zod';

export const createBatchSchema = z.object({
    courseId: z.string(),
    startDate: z.coerce.date(),
    endDate: z.coerce.date(),
    enrollmentStartDate: z.coerce.date(),
    enrollmentEndDate: z.coerce.date(),
    price: z.number().min(0),
    currency: z.string().default('BDT'),
    maxCapacity: z.number().min(1),
    instructors: z.array(
        z.object({
            instructorId: z.string(),
            role: z.enum(['Primary', 'Assistant']),
        })
    ).min(1),
    certificateTemplate: z.string().optional(),
    accessDurationAfterEnd: z.number().min(0).optional(),
    status: z.enum(['Draft', 'Upcoming', 'Active', 'Completed', 'Cancelled']).optional(),
}).refine((data) => data.endDate > data.startDate, {
    message: 'End date must be after start date',
    path: ['endDate'],
}).refine((data) => data.enrollmentEndDate > data.enrollmentStartDate, {
    message: 'Enrollment end date must be after enrollment start date',
    path: ['enrollmentEndDate'],
});

export const updateBatchSchema = z.object({
    startDate: z.coerce.date().optional(),
    endDate: z.coerce.date().optional(),
    enrollmentStartDate: z.coerce.date().optional(),
    enrollmentEndDate: z.coerce.date().optional(),
    price: z.number().min(0).optional(),
    maxCapacity: z.number().min(1).optional(),
    instructors: z.array(
        z.object({
            instructorId: z.string(),
            role: z.enum(['Primary', 'Assistant']),
        })
    ).optional(),
    certificateTemplate: z.string().optional(),
    accessDurationAfterEnd: z.number().optional(),
    status: z.enum(['Draft', 'Upcoming', 'Active', 'Completed', 'Cancelled']).optional(),
});

export const updateBatchStatusSchema = z.object({
    status: z.enum(['Draft', 'Upcoming', 'Active', 'Completed', 'Cancelled']),
});
