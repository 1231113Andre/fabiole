import { z } from 'zod';

/**
 * Login form validation schema
 */
export const loginSchema = z.object({
    email: z.string().email('Por favor, insere um email válido.'),
    password: z.string().min(1, 'Password é obrigatória.'),
    rememberMe: z.boolean().optional(),
});

export type LoginSchema = z.infer<typeof loginSchema>;

