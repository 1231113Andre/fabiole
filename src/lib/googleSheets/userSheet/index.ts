/**
 * @fileoverview Main user sheet operations module
 * @author Personal Trainer Platform Team
 * @description This module serves as the main entry point for all user sheet operations.
 *              It coordinates creation, formatting, and data reading operations.
 * @since 1.0.0
 */

import { InfoDataRow } from '@/types/user';
import { getSheetsAPI } from '../auth';
import { ACCOUNT_DATA_SHEET_ID } from '../config';
import { generateUserSheetName } from '../utils';
import { copyTemplateSheet } from './templateCopy';
import { getUserSheetData } from './read';
import { clearUserCache } from '../cache';

/**
 * Get or create user sheet
 * @description Ensures a user's dedicated sheet exists and is properly initialized.
 *              STRICT RULES:
 *              - Never overwrite existing user sheets
 *              - Only create and populate if sheet doesn't exist
 *              - If sheet exists but data row is empty, fill it with infoData
 *              - If sheet exists with data, do nothing (never overwrite)
 * 
 * Sheet structure:
 * - Row 1: Headers (UserName, UserSurname, UserEmail, UserPhone, UserBirth, etc.)
 * - Row 2: User data from infoData
 * - Row 3: Empty
 * - Row 4: Section headers (Pesagens, Perímetros, Avaliação)
 * - Row 5: Column headers for each section
 * - Row 6+: Data rows (manually filled by trainer)
 * 
 * @param {string} email - User's email address
 * @param {InfoDataRow} userData - User data from infoData to populate sheet
 * @returns {Promise<void>} Resolves when sheet is ready
 * @throws {Error} If sheet cannot be created or written to
 * 
 * @example
 * await getOrCreateUserSheet('user@example.com', {
 *   name: 'John',
 *   surname: 'Doe',
 *   email: 'user@example.com',
 *   password: 'pass',
 *   birth: '01/01/1990'
 * });
 * 
 * @author Personal Trainer Platform Team
 * @since 1.0.0
 */
export async function getOrCreateUserSheet(email: string, userData: InfoDataRow): Promise<void> {
  try {
    const userSheetName = generateUserSheetName(email);
    console.log(`📋 [Google Sheets] Getting or creating user sheet: ${userSheetName}`);

    const sheets = await getSheetsAPI();

    // Check if sheet exists
    let sheetExists = false;
    try {
      const spreadsheet = await sheets.spreadsheets.get({
        spreadsheetId: ACCOUNT_DATA_SHEET_ID,
      });

      const existingSheet = spreadsheet.data.sheets?.find(
        (sheet: any) => sheet.properties?.title === userSheetName
      );

      if (existingSheet) {
        sheetExists = true;
        console.log(`✅ [Google Sheets] User sheet already exists: ${userSheetName}`);

        // Check if data row (row 2) is empty - if so, fill it with infoData
        try {
          const dataCheck = await sheets.spreadsheets.values.get({
            spreadsheetId: ACCOUNT_DATA_SHEET_ID,
            range: `${userSheetName}!A2:N2`,
          });

          const hasData = dataCheck.data.values &&
            dataCheck.data.values.length > 0 &&
            dataCheck.data.values[0] &&
            dataCheck.data.values[0].some((cell: any) => cell && cell.toString().trim() !== '');

          if (!hasData) {
            console.log(`📝 [Google Sheets] Sheet exists but data row is empty - filling with infoData...`);
            // Fill empty row with data from infoData
            await sheets.spreadsheets.values.update({
              spreadsheetId: ACCOUNT_DATA_SHEET_ID,
              range: `${userSheetName}!A2:N2`,
              valueInputOption: 'RAW',
              requestBody: {
                values: [[
                  (userData.name || '').toUpperCase(),        // A2: UserName
                  (userData.surname || '').toUpperCase(),     // B2: UserSurname
                  (userData.email || '').toUpperCase(),       // C2: UserEmail
                  '',                                         // D2: UserPhone (empty)
                  (userData.birth || '').toUpperCase(),       // E2: UserBirth
                  userData.uuid || '',                        // F2: UUID (AUTO) 🔒
                  '',                                         // G2: TrainingCredit (empty)
                  '',                                         // H2: TreiningsScheduled (empty)
                  '',                                         // H2: TreiningsScheduled (empty)
                  '-',                                        // I2: DebtValue (default: -)
                  '-',                                        // J2: Paid? (default: -)
                  '',                                         // K2: Q1 (empty)
                  '',                                         // L2: Q2 (empty)
                  '',                                         // M2: Q3 (empty)
                  ''                                          // N2: Notas (empty)
                ]],
              },
            });
            console.log(`✅ [Google Sheets] Empty data row filled with infoData (including UUID)`);

            // Clear cache for this user since we just updated their sheet
            clearUserCache(email);
          } else {
            console.log(`ℹ️ [Google Sheets] Sheet has existing data - skipping (never overwrite)`);
          }
        } catch (error) {
          console.warn(`⚠️ [Google Sheets] Could not check data row, assuming it has data:`, error);
        }

        return; // Sheet exists, done
      }
    } catch (error) {
      console.log(`ℹ️ [Google Sheets] Error checking if sheet exists, will create new one`);
    }

    // Sheet doesn't exist - copy from TEMPLATE_USER sheet
    // This copies the entire sheet with 100% formatting, styles, formulas within same spreadsheet
    // Simple, fast, and reliable - no Drive API or XLSX needed!
    if (!sheetExists) {
      console.log(`📝 [Google Sheets] Creating new user sheet from template: ${userSheetName}`);

      // Prepare data values for row 2 (A2:N2)
      const dataValues = [
        (userData.name || '').toUpperCase(),        // A2: UserName
        (userData.surname || '').toUpperCase(),     // B2: UserSurname
        (userData.email || '').toUpperCase(),       // C2: UserEmail
        '',                                         // D2: UserPhone (empty)
        (userData.birth || '').toUpperCase(),       // E2: UserBirth
        userData.uuid || '',                        // F2: UUID (AUTO) 🔒
        '',                                         // G2: TrainingCredit (empty)
        '',                                         // H2: TreiningsScheduled (empty)
        '',                                         // H2: TreiningsScheduled (empty)
        '-',                                        // I2: DebtValue (default: -)
        '-',                                        // J2: Paid? (default: -)
        '',                                         // K2: Q1 (empty)
        '',                                         // L2: Q2 (empty)
        '',                                         // M2: Q3 (empty)
        ''                                          // N2: Notas (empty)
      ];

      // Copy template sheet - this preserves 100% of formatting, styles, formulas, etc.
      const sheetId = await copyTemplateSheet(userSheetName);

      // Combine rename + data population in single batchUpdate for maximum performance
      // This reduces API calls from 2 to 1, significantly improving speed
      await sheets.spreadsheets.batchUpdate({
        spreadsheetId: ACCOUNT_DATA_SHEET_ID,
        requestBody: {
          requests: [
            // Request 1: Rename sheet
            {
              updateSheetProperties: {
                properties: {
                  sheetId: sheetId,
                  title: userSheetName,
                },
                fields: 'title',
              },
            },
            // Request 2: Populate row 2 with user data
            {
              updateCells: {
                range: {
                  sheetId: sheetId,
                  startRowIndex: 1, // Row 2 (0-indexed)
                  endRowIndex: 2,
                  startColumnIndex: 0, // Column A
                  endColumnIndex: dataValues.length,
                },
                rows: [{
                  values: dataValues.map(value => ({
                    userEnteredValue: { stringValue: value || '' },
                  })),
                }],
                fields: 'userEnteredValue',
              },
            },
          ],
        },
      });

      console.log(`✅ [Google Sheets] User sheet created, renamed, and populated: ${userSheetName}`);

      console.log(`✅ [Google Sheets] User data inserted successfully to row 2: ${userSheetName}`);
      clearUserCache(email);
    }
  } catch (error) {
    console.error('❌ [Google Sheets] Error getting or creating user sheet:', error);
    throw error;
  }
}

// Re-export read function
export { getUserSheetData } from './read';

