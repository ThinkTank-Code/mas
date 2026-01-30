import { z } from 'zod';

export const lessonSchema = z.object({
    lessonId: z.string().min(1),
    title: z.string().min(1),
    type: z.enum(['video', 'reading']),
    duration: z.number().optional(),
    isPreview: z.boolean().optional(),
    content: z.any().optional(),
    media: z.object({
        type: z.enum(['youtube', 'gdrive', 'video']),
        url: z.string().url(),
        thumbnail: z.string().url().optional(),
    }).optional(),
});

export const moduleSchema = z.object({
    moduleId: z.string().min(1),
    title: z.string().min(1),
    description: z.string().optional(),
    order: z.number().optional(),
    duration: z.number().optional(),
    lessons: z.array(lessonSchema).optional(),
});

export const createCourseSchema = z.object({
    body: z.object({
        title: z.string().min(3),
        slug: z.string().min(3).optional(),
        courseCode: z.string().optional(),
        subtitle: z.string().optional(),
        description: z.string().optional(),
        shortDescription: z.string().max(300).optional(),
        instructor: z.union([
            z.string(),
            z.object({
                id: z.string().optional(),
                name: z.string().optional(),
                email: z.string().email().optional(),
                avatarUrl: z.string().url().optional(),
            })
        ]).optional(),
        category: z.string().optional(),
        subcategory: z.string().optional(),
        level: z.string().optional(),
        language: z.string().optional(),
        duration: z.object({
            hours: z.number().optional(),
            weeks: z.number().optional(),
            hoursPerWeek: z.number().optional(),
        }).optional(),
        pricing: z.object({
            amount: z.number().optional(),
            currency: z.string().optional(),
            discountPrice: z.number().nullable().optional(),
            discountExpiry: z.string().nullable().optional(),
        }).optional(),
        enrollment: z.any().optional(),
        curriculum: z.array(moduleSchema).optional(),
        tags: z.array(z.string()).optional(),
        thumbnailUrl: z.string().url().optional(),
        coverImageUrl: z.string().url().optional(),
        isPublished: z.boolean().optional(),
        isFeatured: z.boolean().optional(),
    }),
});

export const updateCourseSchema = z.object({
    body: z.object({
        title: z.string().min(3).optional(),
        slug: z.string().min(3).optional(),
        courseCode: z.string().optional(),
        subtitle: z.string().optional(),
        description: z.string().optional(),
        shortDescription: z.string().max(300).optional(),
        instructor: z.union([
            z.string(),
            z.object({
                id: z.string().optional(),
                name: z.string().optional(),
                email: z.string().email().optional(),
                avatarUrl: z.string().url().optional(),
            })
        ]).optional(),
        category: z.string().optional(),
        subcategory: z.string().optional(),
        level: z.string().optional(),
        language: z.string().optional(),
        duration: z.object({
            hours: z.number().optional(),
            weeks: z.number().optional(),
            hoursPerWeek: z.number().optional(),
        }).optional(),
        pricing: z.object({
            amount: z.number().optional(),
            currency: z.string().optional(),
            discountPrice: z.number().nullable().optional(),
            discountExpiry: z.string().nullable().optional(),
        }).optional(),
        enrollment: z.any().optional(),
        curriculum: z.array(moduleSchema).optional(),
        tags: z.array(z.string()).optional(),
        thumbnailUrl: z.string().url().optional(),
        coverImageUrl: z.string().url().optional(),
        isPublished: z.boolean().optional(),
        isFeatured: z.boolean().optional(),
    }),
});
