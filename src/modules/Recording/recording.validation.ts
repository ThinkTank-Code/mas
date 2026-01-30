import { z } from 'zod';

const createRecording = z.object({
    body: z.object({
        course: z.string().min(1, 'Course ID is required'),
        title: z.string().min(1, 'Title is required'),
        description: z.string().optional(),
        videoUrl: z.string().url('Valid video URL is required'),
        videoType: z.enum(['youtube', 'gdrive'], {
            required_error: 'Video type must be youtube or gdrive',
        }),
    }),
});

const updateRecording = z.object({
    body: z.object({
        course: z.string().optional(),
        title: z.string().optional(),
        description: z.string().optional(),
        videoUrl: z.string().url().optional(),
        videoType: z.enum(['youtube', 'gdrive']).optional(),
    }),
});

export const RecordingValidation = {
    createRecording,
    updateRecording,
};