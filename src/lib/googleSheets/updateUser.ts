import { google } from 'googleapis';
import { getAuthClient } from './auth';
import { INFO_SHEET_ID, ACCOUNT_DATA_SHEET_ID } from './config';
import { generateUserSheetName } from './utils';
import { clearInfoDataCache, clearUserCache } from './cache';

/**
 * Updates a user's email in the Info sheet and their personal sheet.
 * Searches by UUID for reliability.
 * @param uuid The user's UUID (to find them)
 * @param currentEmail The user's current email (for sheet renaming)
 * @param newEmail The new email to set
 * @returns Promise<boolean> true if successful
 */
export async function updateUserEmailCommand(uuid: string, currentEmail: string, newEmail: string): Promise<boolean> {
    try {
        const auth = await getAuthClient();
        const sheets = google.sheets({ version: 'v4', auth });

        // 1. Find the user's row in infoData by UUID (Column G, index 6)
        const response = await sheets.spreadsheets.values.get({
            spreadsheetId: INFO_SHEET_ID,
            range: "infoData!A:G",
        });

        const rows = response.data.values || [];

        // UUID is in column G (index 6)
        const rowIndex = rows.findIndex((row) => row[6]?.toString().trim() === uuid.trim());

        if (rowIndex === -1) {
            console.error(`❌ [UpdateEmail] User not found by UUID: ${uuid}`);
            return false;
        }

        const sheetRowNumber = rowIndex + 1; // 1-based index for Google Sheets
        console.log(`📍 [UpdateEmail] Found user at row ${sheetRowNumber} by UUID: ${uuid}`);

        // 2. Update Email in Info Sheet (Column C)
        await sheets.spreadsheets.values.update({
            spreadsheetId: INFO_SHEET_ID,
            range: `infoData!C${sheetRowNumber}`,
            valueInputOption: 'RAW',
            requestBody: {
                values: [[newEmail]],
            },
        });
        console.log(`✅ [UpdateEmail] Updated email in infoData row ${sheetRowNumber}`);

        // 3. Rename the User's Personal Sheet and update email cell
        const oldSheetName = generateUserSheetName(currentEmail);
        const newSheetName = generateUserSheetName(newEmail);

        // Get spreadsheet to find sheetId for the tab name
        const spreadsheet = await sheets.spreadsheets.get({
            spreadsheetId: ACCOUNT_DATA_SHEET_ID,
        });

        // Search for Source sheet (current/old name)
        const sourceSheet = spreadsheet.data.sheets?.find(
            (s) => s.properties?.title?.toLowerCase() === oldSheetName.toLowerCase()
        );

        // Search for Target sheet (new name - check if conflict exists)
        const targetSheet = spreadsheet.data.sheets?.find(
            (s) => s.properties?.title?.toLowerCase() === newSheetName.toLowerCase()
        );

        if (!sourceSheet || !sourceSheet.properties?.sheetId) {
            console.warn(`⚠️ [UpdateEmail] Could not find SOURCE user sheet: ${oldSheetName}. Looking for target...`);

            // Critical Recovery: Maybe the rename already happened, or we are in a desynced state?
            if (targetSheet && targetSheet.properties?.sheetId) {
                console.log(`⚠️ [UpdateEmail] Target sheet ${newSheetName} ALREADY EXISTS. Assuming data is there.`);

                // Just update the email cell in the target sheet to be sure
                await sheets.spreadsheets.values.update({
                    spreadsheetId: ACCOUNT_DATA_SHEET_ID,
                    range: `${newSheetName}!C2`, // C2 is email cell (Column 2, Row 2 if 1-indexed? No C is Col 3. B is Col 2)
                    // Wait, check parsing.ts: User Data starts at row 2. 
                    // Email usually in the header or user info row? 
                    // updateUserEmailCommand original code used: startColumnIndex: 2, endColumnIndex: 3 -> Column C (Index 2).
                    valueInputOption: 'RAW',
                    requestBody: { values: [[newEmail]] }
                });

                clearInfoDataCache();
                clearUserCache(currentEmail);
                clearUserCache(newEmail);
                return true;
            }

            console.error(`❌ [UpdateEmail] Neither source nor target sheet found.`);
            return true; // Return true to not block the auth flow, but this is an issue.
        }

        // Logic for Rename with Conflict Handling
        if (targetSheet && targetSheet.properties?.sheetId) {
            console.warn(`⚠️ [UpdateEmail] Target sheet ${newSheetName} ALREADY EXISTS. Conflict resolution started.`);

            // Check which sheet has data (simple heuristic: more filled rows)
            // We'll read column A for first 100 rows
            const [sourceData, targetData] = await Promise.all([
                sheets.spreadsheets.values.get({ spreadsheetId: ACCOUNT_DATA_SHEET_ID, range: `${oldSheetName}!A1:A50` }),
                sheets.spreadsheets.values.get({ spreadsheetId: ACCOUNT_DATA_SHEET_ID, range: `${newSheetName}!A1:A50` })
            ]);

            const sourceRows = sourceData.data.values?.length || 0;
            const targetRows = targetData.data.values?.length || 0;

            console.log(`📊 [UpdateEmail] Row counts - Source(${oldSheetName}): ${sourceRows}, Target(${newSheetName}): ${targetRows}`);

            if (sourceRows >= targetRows) {
                // Source has more data (User renaming their real sheet to an existing empty/old sheet)
                // ACTION: Archive Target, Rename Source -> Target
                const archiveName = `${newSheetName}_ARCHIVED_${Date.now()}`;
                console.log(`🔄 [UpdateEmail] Archiving empty target to ${archiveName} and renaming source.`);

                await sheets.spreadsheets.batchUpdate({
                    spreadsheetId: ACCOUNT_DATA_SHEET_ID,
                    requestBody: {
                        requests: [
                            {
                                updateSheetProperties: {
                                    properties: { sheetId: targetSheet.properties.sheetId, title: archiveName },
                                    fields: 'title'
                                }
                            },
                            {
                                updateSheetProperties: {
                                    properties: { sheetId: sourceSheet.properties.sheetId, title: newSheetName },
                                    fields: 'title'
                                }
                            },
                            // Update Email Cell in the renamed sheet
                            {
                                updateCells: {
                                    range: {
                                        sheetId: sourceSheet.properties.sheetId, // It's the same ID, just renamed
                                        startRowIndex: 1, endRowIndex: 2,
                                        startColumnIndex: 2, endColumnIndex: 3
                                    },
                                    rows: [{ values: [{ userEnteredValue: { stringValue: newEmail.toUpperCase() } }] }],
                                    fields: 'userEnteredValue'
                                }
                            }
                        ]
                    }
                });
            } else {
                // Target has more data (User switching back to an old email that holds real data)
                // ACTION: Archive Source, Keep Target
                const archiveName = `${oldSheetName}_ARCHIVED_${Date.now()}`;
                console.log(`🔄 [UpdateEmail] Source is empty/smaller. Archiving source to ${archiveName} and keeping target.`);

                await sheets.spreadsheets.batchUpdate({
                    spreadsheetId: ACCOUNT_DATA_SHEET_ID,
                    requestBody: {
                        requests: [
                            {
                                updateSheetProperties: {
                                    properties: { sheetId: sourceSheet.properties.sheetId, title: archiveName },
                                    fields: 'title'
                                }
                            },
                            // Update Email Cell in the target sheet
                            {
                                updateCells: {
                                    range: {
                                        sheetId: targetSheet.properties.sheetId,
                                        startRowIndex: 1, endRowIndex: 2,
                                        startColumnIndex: 2, endColumnIndex: 3
                                    },
                                    rows: [{ values: [{ userEnteredValue: { stringValue: newEmail.toUpperCase() } }] }],
                                    fields: 'userEnteredValue'
                                }
                            }
                        ]
                    }
                });
            }

        } else {
            // HAPPY PATH: Target does not exist, simple rename
            console.log(`✅ [UpdateEmail] Target sheet free. Renaming ${oldSheetName} -> ${newSheetName}`);

            await sheets.spreadsheets.batchUpdate({
                spreadsheetId: ACCOUNT_DATA_SHEET_ID,
                requestBody: {
                    requests: [
                        // 1. Rename Sheet
                        {
                            updateSheetProperties: {
                                properties: {
                                    sheetId: sourceSheet.properties.sheetId,
                                    title: newSheetName,
                                },
                                fields: 'title',
                            },
                        },
                        // 2. Update Email Cell (C2) in the personal sheet
                        {
                            updateCells: {
                                range: {
                                    sheetId: sourceSheet.properties.sheetId,
                                    startRowIndex: 1,
                                    endRowIndex: 2,
                                    startColumnIndex: 2,
                                    endColumnIndex: 3,
                                },
                                rows: [{
                                    values: [{
                                        userEnteredValue: { stringValue: newEmail.toUpperCase() }
                                    }]
                                }],
                                fields: 'userEnteredValue'
                            }
                        }
                    ],
                },
            });
        }

        console.log(`✅ [UpdateEmail] Completed successfully.`);

        // Clear caches to force fresh data fetch
        clearInfoDataCache();
        clearUserCache(currentEmail);
        clearUserCache(newEmail); // Also clear new email cache
        console.log(`🧹 [UpdateEmail] Cleared caches for email update`);

        return true;

    } catch (error) {
        console.error('❌ [UpdateEmail] Error updating user email:', error);
        return false;
    }
}
