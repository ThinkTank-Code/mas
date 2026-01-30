import { z } from 'zod';

const updateSettings = z.object({
  body: z.object({
    featuredEnrollmentCourse: z.string().optional(),
    featuredEnrollmentBatch: z.string().optional(),
  }),
});

export const SettingsValidation = {
  updateSettings,
};