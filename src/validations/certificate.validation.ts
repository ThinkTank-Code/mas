import { z } from 'zod';

export const revokeCertificateSchema = z.object({
    reason: z.string().min(10),
});
