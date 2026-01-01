import { getSession } from '@/lib/security/session';
import { BaseRouteHandler } from '@/lib/api/core/BaseRouteHandler';
import { ApiResponse } from '@/lib/api/core/ApiResponse';
import { z } from 'zod';
import { validationMiddleware } from '@/lib/api/middleware/ValidationMiddleware';
import { VerificationCodeService } from '@/lib/email/VerificationCodeService';
import { db } from '@/lib/db/client';
import { comparePassword } from '@/lib/security/password';
import { Logger } from '@/lib/utils/logger';

// Validation schema
const requestChangeEmailSchema = z.object({
    currentPassword: z.string().min(1, "Password is required"),
    newEmail: z.string().email("Invalid email address"),
});

const handler = new BaseRouteHandler()
    .use(validationMiddleware(requestChangeEmailSchema))
    .handle(async (context) => {
        try {
            // 1. Get current session
            const session = await getSession();
            if (!session || !session.email) {
                return ApiResponse.unauthorized();
            }

            const { currentPassword, newEmail } = context.validatedData as {
                currentPassword: string;
                newEmail: string;
            };

            // 2. Normalize emails
            const currentEmail = session.email.toLowerCase();
            const nextEmail = newEmail.toLowerCase();

            // Note: Flow control tracking for sensitive identity updates
            if (currentEmail === nextEmail) {
                return ApiResponse.badRequest("O novo email deve ser diferente do atual.");
            }

            // 3. Verify current password
            const userDB = await db.user.findUnique({
                where: { email: currentEmail }
            });

            if (!userDB) {
                return ApiResponse.unauthorized("Utilizador não encontrado.");
            }

            const isPasswordValid = await comparePassword(currentPassword, userDB.password);
            if (!isPasswordValid) {
                return ApiResponse.unauthorized("Password incorreta.");
            }

            // 4. Check if new email is already taken
            const existingEmail = await db.user.findUnique({
                where: { email: nextEmail }
            });

            if (existingEmail) {
                return ApiResponse.conflict("Este email já está em uso por outra conta.");
            }

            // 5. Send verification code to CURRENT email
            // We send it to the current email to verify identity before allowing changes
            const result = await VerificationCodeService.sendVerificationCode(currentEmail, userDB.name);

            if (!result.success) {
                throw new Error(result.error || "Falha ao enviar código de verificação.");
            }

            return ApiResponse.success({
                message: "Código de verificação enviado para o teu email atual.",
                emailSentTo: currentEmail
            });

        } catch (error) {
            Logger.error('Security', 'Email Update Initiation Failure: A critical exception occurred during the change-request verification sequence.', error);
            if (error instanceof Error) {
                return ApiResponse.badRequest(error.message);
            }
            return ApiResponse.error("Erro ao processar pedido de alteração de email.");
        }
    });

export const POST = handler.toNextHandler();
