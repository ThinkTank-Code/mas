import { z } from 'zod';
import { Role } from '../../types/role';

export const adminRegisterSchema = z.object({
    name: z.string().min(1),
    email: z.string().email(),
    password: z.string().min(6),
    role: z.enum([Role.ADMIN, Role.SUPERADMIN]).optional(),
});

export const adminLoginSchema = z.object({
    email: z.string().email(),
    password: z.string().min(1),
});