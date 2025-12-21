import { getSession } from '@/lib/security/session';
import { BaseRouteHandler } from '@/lib/api/core/BaseRouteHandler';
import { ApiResponse } from '@/lib/api/core/ApiResponse';
import { z } from 'zod';
import { validationMiddleware } from '@/lib/api/middleware/ValidationMiddleware';
import { VerificationCodeService } from '@/lib/email/VerificationCodeService';
import { findUserInInfoData, userExistsInInfoData } from '@/lib/googleSheets';

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

            console.log(`[ChangeEmailRequest] Current(Session): ${currentEmail}, Next(Input): ${nextEmail}`);

            if (currentEmail === nextEmail) {
                return ApiResponse.badRequest("O novo email deve ser diferente do atual.");
            }

            // 3. Verify current password
            // We can reuse findUserInInfoData to verify credentials
            const user = await findUserInInfoData(currentEmail, currentPassword);
            if (!user) {
                return ApiResponse.unauthorized("Password incorreta.");
            }

            // 4. Check if new email is already taken
            const emailExists = await userExistsInInfoData(nextEmail);
            if (emailExists) {
                return ApiResponse.conflict("Este email já está em uso por outra conta.");
            }

            // 5. Send verification code to CURRENT email
            // We send it to the current email to verify identity before allowing changes
            const result = await VerificationCodeService.sendVerificationCode(currentEmail, user.name);

            if (!result.success) {
                throw new Error(result.error || "Falha ao enviar código de verificação.");
            }

            return ApiResponse.success({
                message: "Código de verificação enviado para o teu email atual.",
                emailSentTo: currentEmail
            });

        } catch (error) {
            console.error("[ChangeEmailRequest] Error:", error);
            if (error instanceof Error) {
                return ApiResponse.badRequest(error.message);
            }
            return ApiResponse.error("Erro ao processar pedido de alteração de email.");
        }
    });

export const POST = handler.toNextHandler();
