import { z } from 'zod';

export const updateLessonProgressSchema = z.object({
    watchedDuration: z.number().min(0),
    lastWatchedPosition: z.number().min(0).optional(),
    isCompleted: z.boolean().optional(),
});
