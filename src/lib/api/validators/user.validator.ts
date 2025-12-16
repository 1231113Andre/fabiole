import { z } from 'zod';

/**
 * User data query parameters schema
 */
export const userDataQuerySchema = z.object({
  refresh: z
    .string()
    .optional()
    .transform((val) => val === 'true'),
});

export type UserDataQuery = z.infer<typeof userDataQuerySchema>;










