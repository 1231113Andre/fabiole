import { getSession } from '@/lib/security/session';
import { BaseRouteHandler } from '@/lib/api/core/BaseRouteHandler';
import { ApiResponse } from '@/lib/api/core/ApiResponse';
import { z } from 'zod';
import { validationMiddleware } from '@/lib/api/middleware/ValidationMiddleware';
import { VerificationCodeService } from '@/lib/email/VerificationCodeService';
import { db } from '@/lib/db/client';
import { AuthService } from '@/lib/api/services/AuthService';
import { revalidatePath } from 'next/cache';
import { normalizeEmail } from '@/lib/auth/helpers';
import { Logger } from '@/lib/utils/logger';

// Validation schema
const verifyChangeEmailSchema = z.object({
    code: z.string().length(6, "Invalid code length"),
    newEmail: z.string().email("Invalid email address"),
});

const handler = new BaseRouteHandler()
    .use(validationMiddleware(verifyChangeEmailSchema))
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
            const verificationResult = VerificationCodeService.verifyCode(currentEmail, code);

            if (!verificationResult.valid) {
                if (verificationResult.error === 'EXPIRED') {
                    return ApiResponse.badRequest("O código expirou. Pede um novo.");
                }
                return ApiResponse.badRequest("Código incorreto.");
            }

            // 3. Update Email in Prisma
            await db.user.update({
                where: { id: session.uuid },
                data: { email: nextEmail }
            });

            // 4. Update Session - Create new session cookie with new email
            const updatedUser = {
                name: session.name,
                surname: session.surname,
                email: nextEmail,
                birth: session.birth,
                uuid: session.uuid,
            };

            Logger.info('Auth', `Creating new session cookie for email change: ${nextEmail}`);
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
