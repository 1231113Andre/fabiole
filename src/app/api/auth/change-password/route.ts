import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifySession } from '@/lib/security/session';
import { comparePassword, hashPassword } from '@/lib/security/password';
import { db } from '@/lib/db/client';

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
        const { currentPassword, newPassword } = body;

        if (!currentPassword || !newPassword) {
            return NextResponse.json(
                { success: false, error: 'Password atual e nova são obrigatórias' },
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

        // 2. Verify current password
        const isPasswordValid = await comparePassword(currentPassword, userDB.password);
        if (!isPasswordValid) {
            return NextResponse.json(
                { success: false, error: 'Password atual incorreta' },
                { status: 400 }
            );
        }

        // 3. Update in Prisma
        const hashedNewPassword = await hashPassword(newPassword);
        await db.user.update({
            where: { id: userDB.id },
            data: { password: hashedNewPassword }
        });

        console.log(`✅ [Change Password] Password changed for: ${session.email}`);

        return NextResponse.json({
            success: true,
            message: 'Password alterada com sucesso',
        });
    } catch (error) {
        console.error('❌ [Change Password] Error:', error);
        return NextResponse.json(
            { success: false, error: 'Erro ao alterar password' },
            { status: 500 }
        );
    }
}
