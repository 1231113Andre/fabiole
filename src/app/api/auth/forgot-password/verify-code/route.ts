import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/client';
import { VerificationCodeService } from '@/lib/email';
import { Logger } from '@/lib/utils/logger';
import { checkRateLimit } from '@/lib/security/rateLimit';
import { normalizeEmail } from '@/lib/auth/helpers';

export async function POST(request: NextRequest) {
    try {
        // Rate limiting: prevent brute-force attempts
        const rateLimitResult = await checkRateLimit(request, {
            maxRequests: 10, // Max 10 verification attempts per window
            windowMs: 15 * 60 * 1000, // 15 minutes
            message: 'Muitas tentativas. Por favor, aguarda antes de tentar novamente.',
        });

        if (!rateLimitResult.allowed) {
            return NextResponse.json(
                {
                    error: rateLimitResult.message || 'Muitas tentativas. Por favor, aguarda antes de tentar novamente.',
                    retryAfter: rateLimitResult.retryAfter
                },
                {
                    status: 429,
                    headers: {
                        'Retry-After': String(rateLimitResult.retryAfter || 900),
                    }
                }
            );
        }

        const body = await request.json();
        const { email, code } = body;

        if (!email || !code) {
            return NextResponse.json(
                { error: 'Email e código são obrigatórios' },
                { status: 400 }
            );
        }

        // Validate code format (6 digits) - fast pre-validation
        if (typeof code !== 'string' || !/^\d{6}$/.test(code)) {
            return NextResponse.json(
                { error: 'Código inválido. O código deve ter 6 dígitos.' },
                { status: 400 }
            );
        }

        const normalizedEmail = normalizeEmail(email);

        // Check if user exists (parallel with verification for performance)
        const userPromise = db.user.findUnique({
            where: { email: normalizedEmail },
            select: { id: true }
        });

        // Verify code using VerificationCodeService (now async with Redis)
        // Note: We don't consume the code here, only verify it
        // The code will be consumed in the reset step
        const stored = await VerificationCodeService.getCode(normalizedEmail);

        let isValid = false;
        let errorMessage = 'Código inválido ou expirado';

        if (!stored) {
            errorMessage = 'Código não encontrado. Por favor, solicita um novo código.';
        } else if (new Date() > stored.expiresAt) {
            await VerificationCodeService.deleteCode(normalizedEmail);
            errorMessage = 'Código expirado. Por favor, solicita um novo código.';
        } else if (stored.code === code) {
            isValid = true;
            // Update attempts count (verification passed but not consumed yet)
        } else {
            // Increment attempts on invalid code
            await VerificationCodeService.updateAttempts(normalizedEmail, stored.attempts + 1);
            const remainingAttempts = 3 - (stored.attempts + 1);
            Logger.warn('Security', `Invalid code for ${normalizedEmail}. ${remainingAttempts} attempts remaining.`);
            errorMessage = remainingAttempts > 0
                ? `Código inválido. Tens ${remainingAttempts} tentativa(s) restante(s).`
                : 'Por favor, solicita um novo código.';
        }

        // Wait for user check (timing protection)
        const user = await userPromise;

        // Only return success if both code is valid AND user exists
        if (isValid && user) {
            Logger.info('Auth', `Password reset code verified for ${normalizedEmail}`);
            return NextResponse.json({
                success: true,
                message: 'Código verificado com sucesso'
            });
        }

        // Return error (don't reveal if user doesn't exist)
        return NextResponse.json(
            { error: errorMessage },
            { status: 400 }
        );

    } catch (error) {
        Logger.error('Auth', 'Error in forgot-password verify-code', error);
        return NextResponse.json(
            { error: 'Erro interno do servidor' },
            { status: 500 }
        );
    }
}
