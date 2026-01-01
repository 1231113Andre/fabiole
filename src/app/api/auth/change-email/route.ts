import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifySession } from '@/lib/security/session';
import { comparePassword } from '@/lib/security/password';
import { db } from '@/lib/db/client';
import { Logger } from '@/lib/utils/logger';

export async function POST(request: NextRequest) {
    try {
        // Get session from cookie
        const cookieStore = await cookies();
        const sessionCookie = cookieStore.get('auth_session');

        if (!sessionCookie) {
            return NextResponse.json(
                { success: false, error: 'Não autenticado' },
                { status: 401 }
            );
        }

        // Verify session
        const session = await verifySession(sessionCookie.value);
        if (!session || !session.email) {
            return NextResponse.json(
                { success: false, error: 'Sessão inválida' },
                { status: 401 }
            );
        }

        const body = await request.json();
        const { newEmail, password } = body;

        if (!newEmail || !password) {
            return NextResponse.json(
                { success: false, error: 'Email e password são obrigatórios' },
                { status: 400 }
            );
        }

        // 1. Check if new email is already in use (in Prisma)
        const emailExists = await db.user.findUnique({ where: { email: newEmail.toLowerCase() } });
        if (emailExists) {
            return NextResponse.json(
                { success: false, error: 'Este email já está registado' },
                { status: 409 }
            );
        }

        // 2. Find user in Prisma
        const user = await db.user.findUnique({
            where: session.uuid ? { id: session.uuid } : { email: session.email }
        });

        if (!user) {
            return NextResponse.json(
                { success: false, error: 'Utilizador não encontrado' },
                { status: 404 }
            );
        }

        // 3. Verify password
        let passwordMatches = await comparePassword(password, user.password);

        // Fallback for legacy plain text passwords
        if (!passwordMatches) {
            passwordMatches = user.password === password;
        }

        if (!passwordMatches) {
            return NextResponse.json(
                { success: false, error: 'Password incorreta' },
                { status: 400 }
            );
        }

        const oldEmail = session.email;

        // 4. Update email in Prisma
        await db.user.update({
            where: { id: user.id },
            data: { email: newEmail.toLowerCase() }
        });

        Logger.success('Security', `Identity Maintenance: Primary email successfully updated for profile ${user.id}. Mapping change: ${oldEmail} -> ${newEmail}.`);

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
