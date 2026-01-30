import { z } from 'zod';

export const updateInstructorProfileSchema = z.object({
    bio: z.string().max(1000).optional(),
    expertise: z.array(z.string()).optional(),
    socialLinks: z.object({
        linkedin: z.string().url().optional(),
        github: z.string().url().optional(),
        twitter: z.string().url().optional(),
        website: z.string().url().optional(),
    }).optional(),
    profilePicture: z.string().url().optional(),
});
