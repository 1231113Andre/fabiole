import { z } from 'zod';

/**
 * Registration form validation schema
 */
export const registerSchema = z.object({
    firstName: z.string().min(2, 'First name is required'),
    lastName: z.string().min(2, 'Last name is required'),
    email: z.string().email('Please enter a valid email address.'),
    password: z.string()
        .min(8, 'Password must be at least 8 characters long.')
        .refine((password) => /[A-Z]/.test(password), 'Password must contain at least one uppercase letter.')
        .refine((password) => /[a-z]/.test(password), 'Password must contain at least one lowercase letter.')
        .refine((password) => /[0-9]/.test(password), 'Password must contain at least one number.'),
    birthDate: z.string().min(1, "Birth date is required"),
    gender: z.enum(['Masculino', 'Feminino', 'Outro']),
    terms: z.boolean().refine(val => val === true, {
        message: 'You must agree to the terms of service.',
    }),
});

export type RegisterSchema = z.infer<typeof registerSchema>;

