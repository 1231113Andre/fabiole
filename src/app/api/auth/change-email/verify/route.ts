import { getSession } from '@/lib/security/session';
import { BaseRouteHandler } from '@/lib/api/core/BaseRouteHandler';
import { ApiResponse } from '@/lib/api/core/ApiResponse';
import { z } from 'zod';
import { requestIdMiddleware } from '@/lib/api/middleware/RequestIdMiddleware';
import { timeoutMiddleware } from '@/lib/api/middleware/TimeoutMiddleware';
import { rateLimitMiddleware } from '@/lib/api/middleware/RateLimitMiddleware';
import { csrfMiddleware } from '@/lib/api/middleware/CsrfMiddleware';
import { validationMiddleware } from '@/lib/api/middleware/ValidationMiddleware';
import { sanitizationMiddleware } from '@/lib/api/middleware/SanitizationMiddleware';
import { RATE_LIMITS } from '@/lib/security/rateLimit';
import { VerificationCodeService } from '@/lib/email/VerificationCodeService';
import { db } from '@/lib/db/client';
import { AuthService } from '@/lib/api/services/AuthService';
import { revalidatePath } from 'next/cache';
import { normalizeEmail } from '@/lib/auth/helpers';
import { clearUserData, clearCachedAuthUser } from '@/lib/cache/userCache';
import { Logger } from '@/lib/utils/logger';

// Validation schema
const verifyChangeEmailSchema = z.object({
    code: z.string().length(6, "Invalid code length").regex(/^\d{6}$/, 'Code must be 6 digits'),
    newEmail: z.string().email("Invalid email address"),
});

const handler = new BaseRouteHandler()
    .use(requestIdMiddleware)
    .use(timeoutMiddleware(15000))
    .use(rateLimitMiddleware(RATE_LIMITS.AUTH)) // Strict rate limiting for security
    .use(csrfMiddleware)
    .use(validationMiddleware(verifyChangeEmailSchema))
    .use(sanitizationMiddleware)
    .handle(async (context) => {
        try {
            // 1. Get current session
            const session = await getSession();
            if (!session || !session.email || !session.uuid) {
                return ApiResponse.unauthorized();
            }

            const { code, newEmail } = context.validatedData as {
                code: string;
                newEmail: string;
            };

            const currentEmail = normalizeEmail(session.email);
            const nextEmail = normalizeEmail(newEmail);

            // 2. Verify Code
            const verificationResult = await VerificationCodeService.verifyCode(currentEmail, code);

            if (!verificationResult.valid) {
                if (verificationResult.error === 'EXPIRED') {
                    return ApiResponse.badRequest("O código expirou. Pede um novo.");
                }
                return ApiResponse.badRequest("Código incorreto.");
            }

            // 3. Clear caches keys (old and new)
            // Critical for security (prevent login with old email) and consistency
            await clearUserData(currentEmail);
            await clearCachedAuthUser(currentEmail);

            await clearUserData(nextEmail);
            await clearCachedAuthUser(nextEmail);

            // 4. Update Email in Prisma
            await db.user.update({
                where: { id: session.uuid },
                data: { email: nextEmail }
            });

            // 5. Update Session - Create new session cookie with new email
            const updatedUser = {
                name: session.name,
                surname: session.surname,
                email: nextEmail,
                birth: session.birth,
                uuid: session.uuid,
                avatarUrl: session.avatarUrl,
            };

            Logger.info('Auth', `Creating new session cookie for email change: ${nextEmail}`);

            // Get client info for session tracking (from original request context is not available here, so we skip it)
            const sessionCookies = await AuthService.createSessionCookie(updatedUser);

            const response = ApiResponse.success({
                message: "Email alterado com sucesso! A tua sessão foi atualizada.",
                newEmail: nextEmail
            });

            // Apply new cookies
            response.cookies = sessionCookies;
            Logger.success('Auth', `Email changed successfully for user: ${session.uuid}`);

            // Force re-render of SSR components (navbar, etc.)
            revalidatePath('/', 'layout');
            revalidatePath('/dashboard', 'layout');

            return response;

        } catch (error) {
            Logger.error('Auth', 'Error verifying email change', error);
            if (error instanceof Error) {
                return ApiResponse.badRequest(error.message);
            }
            return ApiResponse.error("Erro ao verificar alteração de email.");
        }
    });

export const POST = handler.toNextHandler();
