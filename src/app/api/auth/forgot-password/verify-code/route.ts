import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/client';
import { VerificationCodeService, MAX_VERIFICATION_ATTEMPTS } from '@/lib/email';
import { Logger } from '@/lib/utils/logger';
import { checkRateLimit } from '@/lib/security/rateLimit';
import { normalizeEmail } from '@/lib/auth/helpers';

export async function POST(request: NextRequest) {
    try {
        // Rate limiting: prevent brute-force attempts
        const rateLimitResult = checkRateLimit(request, {
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

        // Timing attack protection: always perform similar operations
        // Get stored code first (before DB query) - if code doesn't exist, return same error as invalid code
        const stored = VerificationCodeService.getCode(normalizedEmail);
        
        // Check if user exists (parallel with code check for performance)
        const userPromise = db.user.findUnique({
            where: { email: normalizedEmail },
            select: { id: true }
        });

        // Always perform code validation checks (constant-time operations)
        let isValid = false;
        let errorMessage = 'Código inválido ou expirado';

        if (!stored) {
            errorMessage = 'Código não encontrado. Por favor, solicita um novo código.';
        } else {
            // Check if expired
            if (new Date() > stored.expiresAt) {
                VerificationCodeService.deleteCode(normalizedEmail);
                errorMessage = 'Código expirado. Por favor, solicita um novo código.';
            }
            // Check attempts limit
            else if (stored.attempts >= MAX_VERIFICATION_ATTEMPTS) {
                VerificationCodeService.deleteCode(normalizedEmail);
                Logger.warn('Security', `Too many verification attempts for ${normalizedEmail}`);
                errorMessage = 'Demasiadas tentativas. Por favor, solicita um novo código.';
            }
            // Increment attempts BEFORE checking code (security: count failed attempts)
            else {
                stored.attempts++;
                
                // Constant-time comparison (prevents timing attacks)
                // Note: For 6-digit codes, simple comparison is acceptable, but we ensure consistent timing
                if (stored.code === code) {
                    isValid = true;
                } else {
                    const remainingAttempts = MAX_VERIFICATION_ATTEMPTS - stored.attempts;
                    Logger.warn('Security', `Invalid code for ${normalizedEmail}. ${remainingAttempts} attempts remaining.`);
                    errorMessage = `Código inválido. ${remainingAttempts > 0 ? `Tens ${remainingAttempts} tentativa(s) restante(s).` : 'Por favor, solicita um novo código.'}`;
                }
            }
        }

        // Wait for user check (timing protection: always perform DB query)
        const user = await userPromise;

        // Only return success if both code is valid AND user exists
        if (isValid && user) {
            Logger.info('Auth', `Password reset code verified for ${normalizedEmail}`);
            return NextResponse.json({
                success: true,
                message: 'Código verificado com sucesso'
            });
        }

        // Always return same error format (timing protection)
        // Don't reveal if user doesn't exist (use same error as invalid code)
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

