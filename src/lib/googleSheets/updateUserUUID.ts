/**
 * Update user UUID in infoData sheet
 * @description Updates the UUID column for a specific user in infoData.
 *              Used for auto-generating missing UUIDs during login.
 * 
 * @param {string} email - User's email address
 * @param {string} uuid - UUID to set for the user
 * @returns {Promise<boolean>} True if updated successfully
 */

import { getSheetsAPI } from './auth';
import { ACCOUNT_DATA_SHEET_ID, INFO_DATA_SHEET_NAME } from './config';
import { clearInfoDataCache } from './cache';
import { getAllInfoDataUsers } from './infoData';

export async function updateUserUUID(email: string, uuid: string): Promise<boolean> {
    try {
        console.log(`🔧 [Google Sheets] Updating UUID for user: ${email}`);

        const users = await getAllInfoDataUsers();
        const userIndex = users.findIndex(
            (u) => u.email.toLowerCase() === email.toLowerCase()
        );

        if (userIndex === -1) {
            console.log(`❌ [Google Sheets] User not found for UUID update: ${email}`);
            return false;
        }

        // Row index in sheet: header is row 10, first user is row 11
        // userIndex 0 = row 11, userIndex 1 = row 12, etc.
        const rowNumber = 11 + userIndex;

        const sheets = await getSheetsAPI();
        await sheets.spreadsheets.values.update({
            spreadsheetId: ACCOUNT_DATA_SHEET_ID,
            range: `${INFO_DATA_SHEET_NAME}!G${rowNumber}`,
            valueInputOption: 'RAW',
            requestBody: {
                values: [[uuid]],
            },
        });

        console.log(`✅ [Google Sheets] UUID updated for ${email}: ${uuid}`);

        // Clear cache so next read gets fresh data
        clearInfoDataCache();

        return true;
    } catch (error) {
        console.error(`❌ [Google Sheets] Error updating UUID for ${email}:`, error);
        return false;
    }
}
