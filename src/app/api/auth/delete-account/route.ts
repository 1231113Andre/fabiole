import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifySession } from '@/lib/security/session';
import { comparePassword } from '@/lib/security/password';
import { db } from '@/lib/db/client';
import { Logger } from '@/lib/utils/logger';

export async function DELETE(request: NextRequest) {
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
        const { password } = body;

        if (!password) {
            return NextResponse.json(
                { success: false, error: 'Password é obrigatória para confirmar' },
                { status: 400 }
            );
        }

        // 1. Find user in Prisma
        const userDB = await db.user.findUnique({
            where: { email: session.email }
        });

        if (!userDB) {
            return NextResponse.json(
                { success: false, error: 'Utilizador não encontrado' },
                { status: 404 }
            );
        }

        // 2. Verify password
        const isPasswordValid = await comparePassword(password, userDB.password);
        if (!isPasswordValid) {
            return NextResponse.json(
                { success: false, error: 'Password incorreta' },
                { status: 400 }
            );
        }

        // 3. Delete from Prisma
        await db.user.delete({
            where: { id: userDB.id }
        });

        // Clear session cookie
        const response = NextResponse.json({
            success: true,
            message: 'Conta eliminada com sucesso',
        });

        response.cookies.set('auth_session', '', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 0,
            path: '/',
        });

        Logger.warn('Security', `Account Termination: User profile ${session.email} has been permanently deleted from the database registry.`);

        return response;
    } catch (error) {
        Logger.error('Security', 'Account Termination Failure: A critical exception occurred during the user deletion lifecycle.', error);
        return NextResponse.json(
            { success: false, error: 'Erro ao eliminar conta' },
            { status: 500 }
        );
    }
}
