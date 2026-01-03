import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/client';
import { Logger } from '@/lib/utils/logger';
import { getAuthenticatedUser, verifyPasswordWithFallback, normalizeEmail } from '@/lib/auth/helpers';

export async function POST(request: NextRequest) {
    try {
        // Get authenticated user
        const userResult = await getAuthenticatedUser();
        if (userResult.response) {
            return userResult.response;
        }

        const body = await request.json();
        const { newEmail, password } = body;

        if (!newEmail || !password) {
            return NextResponse.json(
                { success: false, error: 'Email e password são obrigatórios' },
                { status: 400 }
            );
        }

        const normalizedNewEmail = normalizeEmail(newEmail);

        // Check if new email is already in use
        const emailExists = await db.user.findUnique({ where: { email: normalizedNewEmail } });
        if (emailExists) {
            return NextResponse.json(
                { success: false, error: 'Este email já está registado' },
                { status: 409 }
            );
        }

        // Verify password
        const passwordMatches = await verifyPasswordWithFallback(
            password,
            userResult.user!.password,
            userResult.user!.email
        );

        if (!passwordMatches) {
            return NextResponse.json(
                { success: false, error: 'Password incorreta' },
                { status: 400 }
            );
        }

        const oldEmail = userResult.user!.email;

        // Update email
        await db.user.update({
            where: { id: userResult.user!.id },
            data: { email: normalizedNewEmail }
        });

        Logger.success('Security', `Identity Maintenance: Primary email successfully updated for profile ${userResult.user!.id}. Mapping change: ${oldEmail} -> ${normalizedNewEmail}.`);

        // Clear session cookie to force re-login with new email
        const response = NextResponse.json({
            success: true,
            message: 'Email alterado com sucesso. Por favor, inicia sessão novamente.',
        });

        response.cookies.set('auth_session', '', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 0,
            path: '/',
        });

        return response;
    } catch (error) {
        Logger.error('Security', 'Identity Update Failure: A critical exception occurred while committing the new primary email to the database.', error);
        return NextResponse.json(
            { success: false, error: 'Erro ao alterar email' },
            { status: 500 }
        );
    }
}
