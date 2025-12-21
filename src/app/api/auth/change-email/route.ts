import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifySession } from '@/lib/security/session';
import { comparePassword } from '@/lib/security/password';
import { getAllInfoDataUsers, userExistsInInfoData, renameUserSheet, findUserByUUID } from '@/lib/googleSheets';
import { getSheetsAPI } from '@/lib/googleSheets/auth';
import { ACCOUNT_DATA_SHEET_ID, INFO_DATA_SHEET_NAME } from '@/lib/googleSheets/config';
import { clearInfoDataCache } from '@/lib/googleSheets/cache';

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

        // Check if new email is already in use
        const emailExists = await userExistsInInfoData(newEmail);
        if (emailExists) {
            return NextResponse.json(
                { success: false, error: 'Este email já está registado' },
                { status: 409 }
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

        const oldEmail = session.email;

        // 1. Update email in infoData sheet
        const rowNumber = userIndex + 11;
        const sheets = await getSheetsAPI();

        await sheets.spreadsheets.values.update({
            spreadsheetId: ACCOUNT_DATA_SHEET_ID,
            range: `${INFO_DATA_SHEET_NAME}!C${rowNumber}`,
            valueInputOption: 'RAW',
            requestBody: {
                values: [[newEmail.toLowerCase()]],
            },
        });

        // 2. Rename user's personal data sheet (if it exists)
        try {
            const sheetRenamed = await renameUserSheet(oldEmail, newEmail);
            if (sheetRenamed) {
                console.log(`✅ [Change Email] User sheet renamed from ${oldEmail} to ${newEmail}`);
            } else {
                console.log(`ℹ️ [Change Email] User sheet not found for ${oldEmail} (may not exist yet)`);
            }
        } catch (renameError) {
            // Non-blocking - log error but don't fail the operation
            console.error(`⚠️ [Change Email] Failed to rename user sheet:`, renameError);
        }

        // Clear cache
        clearInfoDataCache();

        console.log(`✅ [Change Email] Email changed from ${oldEmail} to ${newEmail}`);

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
        console.error('❌ [Change Email] Error:', error);
        return NextResponse.json(
            { success: false, error: 'Erro ao alterar email' },
            { status: 500 }
        );
    }
}

