import { z } from 'zod';

export const submitProjectSchema = z.object({
    submissionUrl: z.string().url(),
    description: z.string().min(10),
    filesSubmitted: z.array(
        z.object({
            fileName: z.string(),
            fileUrl: z.string().url(),
            fileSize: z.number().optional(),
        })
    ).optional(),
});

export const reviewSubmissionSchema = z.object({
    status: z.enum(['Submitted', 'UnderReview', 'RevisionRequested', 'Approved', 'Rejected']),
    feedback: z.string().min(10),
    score: z.number().min(0).max(100).optional(),
}).refine((data) => {
    if (data.status === 'Approved' && !data.score) {
        return false;
    }
    return true;
}, {
    message: 'Score is required when status is Approved',
    path: ['score'],
});
