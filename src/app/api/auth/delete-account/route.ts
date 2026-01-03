import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/client';
import { Logger } from '@/lib/utils/logger';
import { getAuthenticatedUser, verifyPasswordWithFallback } from '@/lib/auth/helpers';

export async function DELETE(request: NextRequest) {
    try {
        // Get authenticated user
        const userResult = await getAuthenticatedUser();
        if (userResult.response) {
            return userResult.response;
        }

        const body = await request.json();
        const { password } = body;

        if (!password) {
            return NextResponse.json(
                { success: false, error: 'Password é obrigatória para confirmar' },
                { status: 400 }
            );
        }

        // Verify password
        const isPasswordValid = await verifyPasswordWithFallback(
            password,
            userResult.user!.password,
            userResult.user!.email
        );

        if (!isPasswordValid) {
            return NextResponse.json(
                { success: false, error: 'Password incorreta' },
                { status: 400 }
            );
        }

        // Delete user
        await db.user.delete({
            where: { id: userResult.user!.id }
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

        Logger.warn('Security', `Account Termination: User profile ${userResult.user!.email} has been permanently deleted from the database registry.`);

        return response;
    } catch (error) {
        Logger.error('Security', 'Account Termination Failure: A critical exception occurred during the user deletion lifecycle.', error);
        return NextResponse.json(
            { success: false, error: 'Erro ao eliminar conta' },
            { status: 500 }
        );
    }
}
