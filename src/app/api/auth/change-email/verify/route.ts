import { getSession } from '@/lib/security/session';
import { BaseRouteHandler } from '@/lib/api/core/BaseRouteHandler';
import { ApiResponse } from '@/lib/api/core/ApiResponse';
import { z } from 'zod';
import { validationMiddleware } from '@/lib/api/middleware/ValidationMiddleware';
import { VerificationCodeService } from '@/lib/email/VerificationCodeService';
import { updateUserEmailCommand } from '@/lib/googleSheets/updateUser';
import { AuthService } from '@/lib/api/services/AuthService';
import { revalidatePath } from 'next/cache';

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

            const currentEmail = session.email.toLowerCase();
            const nextEmail = newEmail.toLowerCase();

            // 2. Verify Code
            const verificationResult = VerificationCodeService.verifyCode(currentEmail, code);

            if (!verificationResult.valid) {
                if (verificationResult.error === 'EXPIRED') {
                    return ApiResponse.badRequest("O código expirou. Pede um novo.");
                }
                return ApiResponse.badRequest("Código incorreto.");
            }

            // 3. Update Email in Google Sheets (search by UUID for reliability)
            const updated = await updateUserEmailCommand(session.uuid, currentEmail, nextEmail);
            if (!updated) {
                throw new Error("Falha ao atualizar email no sistema.");
            }

            // 4. Update Session - Create new session cookie with new email
            const updatedUser = {
                name: session.name,
                surname: session.surname,
                email: nextEmail,
                birth: session.birth,
                uuid: session.uuid,
            };

            console.log(`🔄 [ChangeEmailVerify] Creating new session cookie for: ${nextEmail}`);
            const sessionCookies = await AuthService.createSessionCookie(updatedUser);

            const response = ApiResponse.success({
                message: "Email alterado com sucesso! A tua sessão foi atualizada.",
                newEmail: nextEmail
            });

            // Apply new cookies
            response.cookies = sessionCookies;
            console.log(`✅ [ChangeEmailVerify] Session cookies prepared for: ${nextEmail}`);

            // Force re-render of SSR components (navbar, etc.)
            revalidatePath('/', 'layout');
            revalidatePath('/dashboard', 'layout');

            return response;

        } catch (error) {
            console.error("[ChangeEmailVerify] Error:", error);
            if (error instanceof Error) {
                return ApiResponse.badRequest(error.message);
            }
            return ApiResponse.error("Erro ao verificar alteração de email.");
        }
    });

export const POST = handler.toNextHandler();
