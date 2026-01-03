import { NextRequest, NextResponse } from 'next/server';
import { hashPassword, validatePasswordStrength } from '@/lib/security/password';
import { db } from '@/lib/db/client';
import { Logger } from '@/lib/utils/logger';
import { getAuthenticatedUser, verifyPasswordWithFallback } from '@/lib/auth/helpers';

export async function POST(request: NextRequest) {
    try {
        // Get authenticated user
        const userResult = await getAuthenticatedUser();
        if (userResult.response) {
            return userResult.response;
        }

        const body = await request.json();
        const { currentPassword, newPassword } = body;

        if (!currentPassword || !newPassword) {
            return NextResponse.json(
                { success: false, error: 'Password atual e nova são obrigatórias' },
                { status: 400 }
            );
        }

        // Validate new password strength
        const passwordValidation = validatePasswordStrength(newPassword);
        if (!passwordValidation.isValid) {
            return NextResponse.json(
                { success: false, error: passwordValidation.error || 'Password não cumpre os requisitos' },
                { status: 400 }
            );
        }

        // Verify current password
        const isPasswordValid = await verifyPasswordWithFallback(
            currentPassword,
            userResult.user!.password,
            userResult.user!.email
        );

        if (!isPasswordValid) {
            return NextResponse.json(
                { success: false, error: 'Password atual incorreta' },
                { status: 400 }
            );
        }

        // Update password
        const hashedNewPassword = await hashPassword(newPassword);
        await db.user.update({
            where: { id: userResult.user!.id },
            data: { password: hashedNewPassword }
        });

        Logger.success('Security', `Password changed for: ${userResult.user!.email}.`);

        return NextResponse.json({
            success: true,
            message: 'Password alterada com sucesso',
        });
    } catch (error) {
        Logger.error('Security', 'Password change failed.', error);
        return NextResponse.json(
            { success: false, error: 'Erro ao alterar password' },
            { status: 500 }
        );
    }
}
