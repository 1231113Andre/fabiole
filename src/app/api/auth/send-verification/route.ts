// API route for sending verification codes
// POST /api/auth/send-verification

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
import { db } from '@/lib/db/client';

const sendVerificationSchema = z.object({
    email: z.string().email('Invalid email address'),
    firstName: z.string().optional(),
});

const sendVerificationHandler = new BaseRouteHandler()
    .use(requestIdMiddleware)
    .use(timeoutMiddleware(15000))
    .use(rateLimitMiddleware(RATE_LIMITS.AUTH)) // Strict rate limiting
    .use(validationMiddleware(sendVerificationSchema))
    .use(sanitizationMiddleware)
    .handle(async (context) => {
        const { email, firstName } = context.validatedData as {
            email: string;
            firstName?: string;
        };

        // Check if user already exists
        const existingUser = await db.user.findUnique({
            where: { email },
            select: { id: true }, // Select minimal data for performance
        });

        if (existingUser) {
            return ApiResponse.conflict('Este email já está registado. Tenta iniciar sessão.');
        }

        const result = await VerificationCodeService.sendVerificationCode(email, firstName);

        if (!result.success) {
            return ApiResponse.error(result.error || 'Failed to send verification code', 400);
        }

        return ApiResponse.success({
            message: 'Verification code sent successfully',
            email,
        });
    });

export const POST = sendVerificationHandler.toNextHandler();

export const OPTIONS = createOptionsHandler({
    methods: ['POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type'],
});
