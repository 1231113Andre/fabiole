import { z } from 'zod';

/**
 * Registration form validation schema
 */
export const registerSchema = z.object({
    firstName: z.string().min(2, 'O nome deve ter pelo menos 2 caracteres'),
    lastName: z.string().min(2, 'O apelido deve ter pelo menos 2 caracteres'),
    email: z.string().email('Por favor, introduza um e-mail válido.'),
    password: z.string()
        .min(8, 'A palavra-passe deve ter pelo menos 8 caracteres.')
        .refine((password) => /[A-Z]/.test(password), 'A palavra-passe deve conter pelo menos uma letra maiúscula.')
        .refine((password) => /[a-z]/.test(password), 'A palavra-passe deve conter pelo menos uma letra minúscula.')
        .refine((password) => /[0-9]/.test(password), 'A palavra-passe deve conter pelo menos um número.'),
    birthDate: z.string().min(1, "A data de nascimento é obrigatória"),
    gender: z.enum(['Masculino', 'Feminino', 'Outro']),
    terms: z.boolean().refine(val => val === true, {
        message: 'Deve concordar com os termos de serviço.',
    }),
});

export type RegisterSchema = z.infer<typeof registerSchema>;

