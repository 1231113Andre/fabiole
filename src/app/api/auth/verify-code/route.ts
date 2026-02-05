// API route for verifying codes
// POST /api/auth/verify-code

import { BaseRouteHandler } from '@/lib/api/core/BaseRouteHandler';
import { ApiResponse } from '@/lib/api/core/ApiResponse';
import { requestIdMiddleware } from '@/lib/api/middleware/RequestIdMiddleware';
import { timeoutMiddleware } from '@/lib/api/middleware/TimeoutMiddleware';
import { rateLimitMiddleware } from '@/lib/api/middleware/RateLimitMiddleware';
import { validationMiddleware } from '@/lib/api/middleware/ValidationMiddleware';
import { sanitizationMiddleware } from '@/lib/api/middleware/SanitizationMiddleware';
import { RATE_LIMITS } from '@/lib/security/rateLimit';
import { VerificationCodeService } from '@/lib/email';
import { z } from 'zod';
import { createOptionsHandler } from '@/lib/api/utils/cors';

const verifyCodeSchema = z.object({
    email: z.string().email('Invalid email address'),
    code: z.string().length(6, 'Code must be 6 digits').regex(/^\d{6}$/, 'Code must be 6 digits'),
});

const errorMessages: Record<string, string> = {
    EXPIRED: 'O código de verificação expirou. Por favor, peça um novo.',
    INVALID: 'Código de verificação inválido. Por favor, tente novamente.',
    NOT_FOUND: 'Nenhum código de verificação encontrado. Por favor, peça um novo.',
    TOO_MANY_ATTEMPTS: 'Demasiadas tentativas falhadas. Por favor, peça um novo código.',
};

const verifyCodeHandler = new BaseRouteHandler()
    .use(requestIdMiddleware)
    .use(timeoutMiddleware(10000))
    .use(rateLimitMiddleware(RATE_LIMITS.AUTH))
    .use(validationMiddleware(verifyCodeSchema))
    .use(sanitizationMiddleware)
    .handle(async (context) => {
        const { email, code } = context.validatedData as {
            email: string;
            code: string;
        };

        const result = await VerificationCodeService.verifyCode(email, code);

        if (!result.valid) {
            const errorMessage = result.error
                ? errorMessages[result.error] || 'Falha na verificação'
                : 'Falha na verificação';

            return ApiResponse.error(errorMessage, 400);
        }

        return ApiResponse.success({
            message: 'E-mail verificado com sucesso',
            verified: true,
            email,
        });
    });

export const POST = verifyCodeHandler.toNextHandler();

export const OPTIONS = createOptionsHandler({
    methods: ['POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type'],
});
