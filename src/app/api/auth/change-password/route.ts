import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifySession } from '@/lib/security/session';
import { comparePassword, hashPassword } from '@/lib/security/password';
import { getSheetsAPI } from '@/lib/googleSheets/auth';
import { INFO_DATA_SHEET_NAME, INFO_SHEET_ID } from '@/lib/googleSheets/config';
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
        const { currentPassword, newPassword } = body;

        if (!currentPassword || !newPassword) {
            return NextResponse.json(
                { success: false, error: 'Password atual e nova são obrigatórias' },
                { status: 400 }
            );
        }

        // Find user - prefer UUID if available, fallback to email
        let user;
        let sheetRowNumber: number | undefined;

        // We need to search the sheet directly to get the correct row number
        // because getAllInfoDataUsers filters out empty rows which shifts indices
        const sheets = await getSheetsAPI();
        const response = await sheets.spreadsheets.values.get({
            spreadsheetId: INFO_SHEET_ID,
            range: `${INFO_DATA_SHEET_NAME}!A10:G`, // Headers in row 10
        });

        const rows = response.data.values || [];
        if (rows.length <= 1) {
            return NextResponse.json(
                { success: false, error: 'Utilizador não encontrado' },
                { status: 404 }
            );
        }

        // Skip header row (index 0 = row 10) and search for user
        // Row number = 10 + index (where index 0 is header, index 1 is first user at row 11)
        for (let i = 1; i < rows.length; i++) {
            const row = rows[i];
            const rowEmail = (row[2] || '').trim().toLowerCase();
            const rowUUID = (row[6] || '').trim().toLowerCase();

            // Match by UUID first, then by email
            const matchByUUID = session.uuid && rowUUID === session.uuid.toLowerCase();
            const matchByEmail = rowEmail === session.email.toLowerCase();

            if (matchByUUID || matchByEmail) {
                user = {
                    name: (row[0] || '').trim(),
                    surname: (row[1] || '').trim(),
                    email: (row[2] || '').trim(),
                    password: (row[3] || '').trim(),
                    birth: (row[4] || '').trim(),
                    uuid: (row[6] || '').trim(),
                };
                sheetRowNumber = 10 + i; // Row 10 is headers, so row 11 is index 1, etc.
                console.log(`✅ [Change Password] Found user at row ${sheetRowNumber}: ${user.email}`);
                break;
            }
        }

        if (!user || sheetRowNumber === undefined) {
            return NextResponse.json(
                { success: false, error: 'Utilizador não encontrado' },
                { status: 404 }
            );
        }

        // Verify current password (supports both hashed and plain text)
        const isHashed = user.password.startsWith('$2a$') ||
            user.password.startsWith('$2b$') ||
            user.password.startsWith('$2y$');

        let passwordMatches = false;
        if (isHashed) {
            passwordMatches = await comparePassword(currentPassword, user.password);
        } else {
            // Legacy plain text comparison
            passwordMatches = user.password === currentPassword;
        }

        if (!passwordMatches) {
            return NextResponse.json(
                { success: false, error: 'Password atual incorreta' },
                { status: 400 }
            );
        }

        // Hash new password
        const hashedNewPassword = await hashPassword(newPassword);

        // Update password in Google Sheets using the correct row number
        console.log(`🔧 [Change Password] Updating password at ${INFO_DATA_SHEET_NAME}!D${sheetRowNumber}`);

        await sheets.spreadsheets.values.update({
            spreadsheetId: INFO_SHEET_ID,
            range: `${INFO_DATA_SHEET_NAME}!D${sheetRowNumber}`,
            valueInputOption: 'RAW',
            requestBody: {
                values: [[hashedNewPassword]],
            },
        });

        // Clear cache
        clearInfoDataCache();

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
