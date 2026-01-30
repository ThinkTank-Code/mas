import { z } from 'zod';

export const registerSchema = z.object({
    name: z.string().min(2).max(100),
    email: z.string().email(),
    password: z.string().min(6).max(50),
    phoneNumber: z.string().regex(/^[0-9]{10,15}$/).optional(),
});

export const loginSchema = z.object({
    email: z.string().email(),
    password: z.string(),
});

export const verifyEmailSchema = z.object({
    token: z.string(),
});

export const forgotPasswordSchema = z.object({
    email: z.string().email(),
});

export const resetPasswordSchema = z.object({
    token: z.string(),
    newPassword: z.string().min(6).max(50),
});

export const changePasswordSchema = z.object({
    currentPassword: z.string(),
    newPassword: z.string().min(6).max(50),
});

export const updateProfileSchema = z.object({
    name: z.string().min(2).max(100).optional(),
    phoneNumber: z.string().regex(/^[0-9]{10,15}$/).optional(),
    profilePicture: z.string().url().optional(),
});
