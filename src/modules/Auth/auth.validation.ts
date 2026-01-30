import { z } from 'zod';

const loginValidationSchema = z.object({
  body: z.object({
    email: z.string().email({ message: 'Invalid email address' }),
    password: z.string().min(1, { message: 'Password is required' }),
  }),
});

const registerValidationSchema = z.object({
  body: z.object({
    name: z.string().min(2, { message: 'Name must be at least 2 characters' }),
    email: z.string().email({ message: 'Invalid email address' }),
    password: z.string().min(6, { message: 'Password must be at least 6 characters' }),
  }),
});

const changePasswordValidationSchema = z.object({
  body: z.object({
    currentPassword: z.string().min(1, { message: 'Current password is required' }),
    newPassword: z.string().min(6, { message: 'New password must be at least 6 characters' }),
  }),
});

const refreshTokenValidationSchema = z.object({
  cookies: z.object({
    refreshToken: z.string().min(1).optional(),
  }).optional(),
  body: z.object({
    refreshToken: z.string().min(1).optional(),
  }).optional(),
}).refine((data) => {
  return !!(data?.cookies?.refreshToken || data?.body?.refreshToken);
}, { message: 'Refresh token is required' });

const forgetPasswordValidationSchema = z.object({
  body: z.object({
    email: z.string().email({ message: 'Invalid email address' }),
  }),
});

const resetPasswordValidationSchema = z.object({
  body: z.object({
    token: z.string().min(1, { message: 'Reset token is required' }),
    newPassword: z.string().min(6, { message: 'New password must be at least 6 characters' }),
  }),
});

const createUserValidationSchema = z.object({
  body: z.object({
    name: z.string().min(2, { message: 'Name must be at least 2 characters' }),
    email: z.string().email({ message: 'Invalid email address' }),
    password: z.string().min(6, { message: 'Password must be at least 6 characters' }),
    role: z.enum(['STUDENT', 'INSTRUCTOR', 'ADMIN', 'SUPERADMIN']).optional(),
  }),
});

const updateUserValidationSchema = z.object({
  body: z.object({
    name: z.string().min(2, { message: 'Name must be at least 2 characters' }).optional(),
    email: z.string().email({ message: 'Invalid email address' }).optional(),
    role: z.enum(['STUDENT', 'INSTRUCTOR', 'ADMIN', 'SUPERADMIN']).optional(),
    isActive: z.boolean().optional(),
  }),
});

export {
  loginValidationSchema,
  registerValidationSchema,
  changePasswordValidationSchema,
  refreshTokenValidationSchema,
  forgetPasswordValidationSchema,
  resetPasswordValidationSchema,
  createUserValidationSchema,
  updateUserValidationSchema,
};