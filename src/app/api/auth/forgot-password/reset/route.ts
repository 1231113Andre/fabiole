import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/client';
import { VerificationCodeService } from '@/lib/email';
import { hashPassword, validatePasswordStrength } from '@/lib/security/password';
import { Logger } from '@/lib/utils/logger';
import { checkRateLimit } from '@/lib/security/rateLimit';
import { normalizeEmail } from '@/lib/auth/helpers';
import { clearCachedAuthUser } from '@/lib/cache/userCache';

export async function POST(request: NextRequest) {
    try {
        // Rate limiting: prevent brute-force password reset attempts
        const rateLimitResult = await checkRateLimit(request, {
            maxRequests: 3, // Max 3 password reset attempts per window
            windowMs: 30 * 60 * 1000, // 30 minutes
            message: 'Muitas tentativas de reset de password. Por favor, aguarda antes de tentar novamente.',
        });

        if (!rateLimitResult.allowed) {
            return NextResponse.json(
                {
                    error: rateLimitResult.message || 'Muitas tentativas de reset de password. Por favor, aguarda antes de tentar novamente.',
                    retryAfter: rateLimitResult.retryAfter
                },
                {
                    status: 429,
                    headers: {
                        'Retry-After': String(rateLimitResult.retryAfter || 1800),
                    }
                }
            );
        }

        const body = await request.json();
        const { email, code, password } = body;

        if (!email || !code || !password) {
            return NextResponse.json(
                { error: 'Email, código e password são obrigatórios' },
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

        // Validate password strength
        const passwordValidation = validatePasswordStrength(password);
        if (!passwordValidation.isValid) {
            return NextResponse.json(
                { error: passwordValidation.error || 'Password não cumpre os requisitos' },
                { status: 400 }
            );
        }

        // Verify the code one final time and consume it
        const verificationResult = await VerificationCodeService.verifyCode(normalizedEmail, code);

        if (!verificationResult.valid) {
            let errorMessage = 'Código inválido ou expirado';
            switch (verificationResult.error) {
                case 'NOT_FOUND':
                    errorMessage = 'Sessão expirada. Por favor, solicita um novo código.';
                    break;
                case 'EXPIRED':
                    errorMessage = 'Código expirado. Por favor, solicita um novo código.';
                    break;
                case 'TOO_MANY_ATTEMPTS':
                    errorMessage = 'Demasiadas tentativas. Por favor, solicita um novo código.';
                    break;
                case 'INVALID':
                    errorMessage = 'Código inválido. Verifica e tenta novamente.';
                    break;
            }
            return NextResponse.json({ error: errorMessage }, { status: 400 });
        }

        // Find user
        const user = await db.user.findUnique({
            where: { email: normalizedEmail },
            select: { id: true }
        });

        if (!user) {
            return NextResponse.json(
                { error: 'Utilizador não encontrado' },
                { status: 404 }
            );
        }

        // Hash and update password
        const hashedPassword = await hashPassword(password);
        await db.user.update({
            where: { id: user.id },
            data: {
                password: hashedPassword
            }
        });

        // Invalidate auth cache
        await clearCachedAuthUser(normalizedEmail);

        Logger.success('Auth', `Password reset successful for ${normalizedEmail}`);

        return NextResponse.json({
            success: true,
            message: 'Password alterada com sucesso'
        });

    } catch (error) {
        Logger.error('Auth', 'Error in forgot-password reset', error);
        return NextResponse.json(
            { error: 'Erro interno do servidor' },
            { status: 500 }
        );
    }
}
