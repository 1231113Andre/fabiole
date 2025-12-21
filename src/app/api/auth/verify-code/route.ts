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

const verifyCodeSchema = z.object({
    email: z.string().email('Invalid email address'),
    code: z.string().length(6, 'Code must be 6 digits').regex(/^\d{6}$/, 'Code must be 6 digits'),
});

const errorMessages: Record<string, string> = {
    EXPIRED: 'Verification code has expired. Please request a new one.',
    INVALID: 'Invalid verification code. Please try again.',
    NOT_FOUND: 'No verification code found. Please request a new one.',
    TOO_MANY_ATTEMPTS: 'Too many failed attempts. Please request a new code.',
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

        const result = VerificationCodeService.verifyCode(email, code);

        if (!result.valid) {
            const errorMessage = result.error
                ? errorMessages[result.error] || 'Verification failed'
                : 'Verification failed';

            return ApiResponse.error(errorMessage, 400);
        }

        return ApiResponse.success({
            message: 'Email verified successfully',
            verified: true,
            email,
        });
    });

export const POST = verifyCodeHandler.toNextHandler();

export async function OPTIONS() {
    return new Response(null, {
        status: 204,
        headers: {
            'Access-Control-Allow-Methods': 'POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type',
            'Access-Control-Max-Age': '86400',
        },
    });
}
