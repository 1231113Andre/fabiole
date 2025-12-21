/**
 * @fileoverview UUID Migration Script
 * @description One-time migration to generate UUIDs for existing users
 * Updates both infoData (column G) and user sheets (column F2)
 */

import { randomUUID } from 'crypto';

export async function generateMissingUUIDs(): Promise<{
    updated: number;
    skipped: number;
    userSheetsUpdated: number;
    users: Array<{ email: string; uuid: string; sheetUpdated: boolean }>;
}> {
    // Import dynamically to work in API context
    const { getAllInfoDataUsers, generateUserSheetName } = await import('@/lib/googleSheets');
    const { getSheetsAPI } = await import('@/lib/googleSheets/auth');
    const { ACCOUNT_DATA_SHEET_ID, INFO_DATA_SHEET_NAME } = await import('@/lib/googleSheets/config');
    const { clearInfoDataCache, clearUserCache } = await import('@/lib/googleSheets/cache');

    const sheets = await getSheetsAPI();
    const users = await getAllInfoDataUsers();

    let updated = 0;
    let skipped = 0;
    let userSheetsUpdated = 0;
    const updatedUsers: Array<{ email: string; uuid: string; sheetUpdated: boolean }> = [];

    // Get all existing sheets
    const spreadsheet = await sheets.spreadsheets.get({
        spreadsheetId: ACCOUNT_DATA_SHEET_ID,
    });
    const existingSheetNames = spreadsheet.data.sheets?.map(
        (sheet: any) => sheet.properties?.title
    ) || [];

    for (let i = 0; i < users.length; i++) {
        const user = users[i];
        let uuid = user.uuid?.trim() || '';
        let needsUpdate = false;
        let sheetUpdated = false;

        // Generate UUID if missing
        if (!uuid) {
            uuid = randomUUID();
            needsUpdate = true;

            // Row number: i + 11 (0-indexed + 1 for header row 10 + 10 for offset)
            const rowNumber = i + 11;

            // Update column G in infoData with new UUID
            await sheets.spreadsheets.values.update({
                spreadsheetId: ACCOUNT_DATA_SHEET_ID,
                range: `${INFO_DATA_SHEET_NAME}!G${rowNumber}`,
                valueInputOption: 'RAW',
                requestBody: {
                    values: [[uuid]],
                },
            });

            console.log(`✅ Generated UUID for ${user.email}: ${uuid}`);
            updated++;
        } else {
            console.log(`⏭️ Skipping ${user.email} - already has UUID: ${uuid}`);
            skipped++;
        }

        // Also update user sheet if it exists (F2 = UUID)
        const userSheetName = generateUserSheetName(user.email);
        if (existingSheetNames.includes(userSheetName)) {
            try {
                await sheets.spreadsheets.values.update({
                    spreadsheetId: ACCOUNT_DATA_SHEET_ID,
                    range: `${userSheetName}!F2`,
                    valueInputOption: 'RAW',
                    requestBody: {
                        values: [[uuid]],
                    },
                });
                console.log(`📋 Updated user sheet ${userSheetName} with UUID`);
                sheetUpdated = true;
                userSheetsUpdated++;
                clearUserCache(user.email);
            } catch (err) {
                console.warn(`⚠️ Could not update user sheet ${userSheetName}:`, err);
            }
        }

        if (needsUpdate || sheetUpdated) {
            updatedUsers.push({ email: user.email, uuid, sheetUpdated });
        }
    }

    // Clear cache after migration
    clearInfoDataCache();

    return { updated, skipped, userSheetsUpdated, users: updatedUsers };
}

