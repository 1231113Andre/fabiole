import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifySession } from '@/lib/security/session';
import { comparePassword } from '@/lib/security/password';
import { getAllInfoDataUsers, findUserByUUID } from '@/lib/googleSheets';
import { getSheetsAPI } from '@/lib/googleSheets/auth';
import { ACCOUNT_DATA_SHEET_ID, INFO_DATA_SHEET_NAME } from '@/lib/googleSheets/config';
import { clearInfoDataCache } from '@/lib/googleSheets/cache';

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

        // Find user - prefer UUID if available, fallback to email
        let user;
        let userIndex;

        if (session.uuid) {
            const result = await findUserByUUID(session.uuid);
            if (result) {
                user = result.user;
                userIndex = result.rowIndex;
            }
        }

        // Fallback to email lookup
        if (!user) {
            const users = await getAllInfoDataUsers();
            userIndex = users.findIndex(
                (u) => u.email.toLowerCase() === session.email.toLowerCase()
            );
            if (userIndex !== -1) {
                user = users[userIndex];
            }
        }

        if (!user || userIndex === undefined) {
            return NextResponse.json(
                { success: false, error: 'Utilizador não encontrado' },
                { status: 404 }
            );
        }

        // Verify password
        const isHashed = user.password.startsWith('$2a$') ||
            user.password.startsWith('$2b$') ||
            user.password.startsWith('$2y$');

        let passwordMatches = false;
        if (isHashed) {
            passwordMatches = await comparePassword(password, user.password);
        } else {
            passwordMatches = user.password === password;
        }

        if (!passwordMatches) {
            return NextResponse.json(
                { success: false, error: 'Password incorreta' },
                { status: 400 }
            );
        }

        // Delete user row from Google Sheets
        // We'll clear the row contents instead of deleting to avoid shifting rows
        const rowNumber = userIndex + 11;
        const sheets = await getSheetsAPI();

        await sheets.spreadsheets.values.update({
            spreadsheetId: ACCOUNT_DATA_SHEET_ID,
            range: `${INFO_DATA_SHEET_NAME}!A${rowNumber}:G${rowNumber}`,
            valueInputOption: 'RAW',
            requestBody: {
                values: [['', '', '', '', '', '', '']], // 7 columns: A-G
            },
        });

        // Clear cache
        clearInfoDataCache();

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

        console.log(`🗑️ [Delete Account] Account deleted: ${session.email}`);

        return response;
    } catch (error) {
        console.error('❌ [Delete Account] Error:', error);
        return NextResponse.json(
            { success: false, error: 'Erro ao eliminar conta' },
            { status: 500 }
        );
    }
}
