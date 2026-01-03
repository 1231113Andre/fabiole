import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/client';
import { VerificationCodeService } from '@/lib/email';
import { Logger } from '@/lib/utils/logger';
import { checkRateLimit } from '@/lib/security/rateLimit';
import { normalizeEmail } from '@/lib/auth/helpers';

export async function POST(request: NextRequest) {
    try {
        // Rate limiting: strict for password reset (prevent abuse)
        const rateLimitResult = checkRateLimit(request, {
            maxRequests: 5, // Max 5 requests per window
            windowMs: 15 * 60 * 1000, // 15 minutes
            message: 'Muitas tentativas. Por favor, aguarda antes de solicitar outro código.',
        });

        if (!rateLimitResult.allowed) {
            return NextResponse.json(
                { 
                    error: rateLimitResult.message || 'Muitas tentativas. Por favor, aguarda antes de solicitar outro código.',
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
        const { email } = body;

        // Pre-validate email format (fast, before DB query)
        if (!email || typeof email !== 'string') {
            return NextResponse.json(
                { error: 'Email é obrigatório' },
                { status: 400 }
            );
        }

        // Basic email format validation (fast, client-side regex might miss edge cases)
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return NextResponse.json(
                { error: 'Por favor, insere um email válido.' },
                { status: 400 }
            );
        }

        const normalizedEmail = normalizeEmail(email);

        // Check if user exists
        const user = await db.user.findUnique({
            where: { email: normalizedEmail },
            select: { id: true, name: true }
        });

        // Always return success immediately to prevent email enumeration attacks
        // Send email asynchronously (non-blocking) for better performance
        const responseMessage = 'Se este email existir na nossa base de dados, enviámos um código para redefinir a password.';
        
        // Don't await email sending - send it in background for better performance
        if (user) {
            // Send email asynchronously (non-blocking)
            VerificationCodeService.sendVerificationCode(
                normalizedEmail,
                user.name || undefined,
                'password-reset'
            ).then(result => {
                if (!result.success) {
                    Logger.error('Auth', `Failed to send password reset code to ${normalizedEmail}`, result.error);
                } else {
                    Logger.info('Auth', `Password reset code sent to ${normalizedEmail}`);
                }
            }).catch(error => {
                Logger.error('Auth', `Error sending password reset code to ${normalizedEmail}`, error);
            });
        } else {
            Logger.warn('Auth', `Password reset requested for non-existent email: ${normalizedEmail}`);
        }

        // Return success immediately (don't wait for email to send)
        return NextResponse.json({
            success: true,
            message: responseMessage
        });

    } catch (error) {
        Logger.error('Auth', 'Error in forgot-password send-code', error);
        return NextResponse.json(
            { error: 'Erro interno do servidor' },
            { status: 500 }
        );
    }
}

