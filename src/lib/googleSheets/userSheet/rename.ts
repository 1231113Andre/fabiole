/**
 * @fileoverview User sheet rename operations
 * @author Personal Trainer Platform Team
 * @description Handles renaming user sheets when email changes
 * @since 1.0.0
 */

import { getSheetsAPI } from '../auth';
import { ACCOUNT_DATA_SHEET_ID } from '../config';
import { generateUserSheetName } from '../utils';
import { clearUserCache } from '../cache';

/**
 * Rename user sheet when email changes
 * @description Finds the user's sheet by old email and renames it to match new email.
 *              Also updates the email in the sheet data (row 2, column C).
 * 
 * @param {string} oldEmail - User's old email address
 * @param {string} newEmail - User's new email address
 * @returns {Promise<boolean>} True if renamed successfully, false if sheet not found
 * @throws {Error} If rename operation fails
 * 
 * @example
 * const success = await renameUserSheet('old@email.com', 'new@email.com');
 * if (success) {
 *   console.log('Sheet renamed successfully');
 * }
 * 
 * @author Personal Trainer Platform Team
 * @since 1.0.0
 */
export async function renameUserSheet(oldEmail: string, newEmail: string): Promise<boolean> {
    try {
        const oldSheetName = generateUserSheetName(oldEmail);
        const newSheetName = generateUserSheetName(newEmail);

        console.log(`📝 [Google Sheets] Renaming user sheet: ${oldSheetName} -> ${newSheetName}`);

        const sheets = await getSheetsAPI();

        // Get spreadsheet to find the sheet ID
        const spreadsheet = await sheets.spreadsheets.get({
            spreadsheetId: ACCOUNT_DATA_SHEET_ID,
        });

        const existingSheet = spreadsheet.data.sheets?.find(
            (sheet: any) => sheet.properties?.title === oldSheetName
        );

        if (!existingSheet || !existingSheet.properties?.sheetId) {
            console.log(`⚠️ [Google Sheets] User sheet not found: ${oldSheetName}`);
            return false;
        }

        const sheetId = existingSheet.properties.sheetId;

        // Batch update: rename sheet AND update email in data row
        await sheets.spreadsheets.batchUpdate({
            spreadsheetId: ACCOUNT_DATA_SHEET_ID,
            requestBody: {
                requests: [
                    // Request 1: Rename the sheet
                    {
                        updateSheetProperties: {
                            properties: {
                                sheetId: sheetId,
                                title: newSheetName,
                            },
                            fields: 'title',
                        },
                    },
                ],
            },
        });

        // Update email in row 2 column C (UserEmail)
        await sheets.spreadsheets.values.update({
            spreadsheetId: ACCOUNT_DATA_SHEET_ID,
            range: `${newSheetName}!C2`,
            valueInputOption: 'RAW',
            requestBody: {
                values: [[newEmail.toUpperCase()]],
            },
        });

        console.log(`✅ [Google Sheets] User sheet renamed successfully: ${oldSheetName} -> ${newSheetName}`);

        // Clear cache for both old and new email
        clearUserCache(oldEmail);
        clearUserCache(newEmail);

        return true;
    } catch (error) {
        console.error('❌ [Google Sheets] Error renaming user sheet:', error);
        throw error;
    }
}
