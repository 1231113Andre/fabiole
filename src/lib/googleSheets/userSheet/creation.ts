/**
 * @fileoverview User sheet data population module
 * @author Personal Trainer Platform Team
 * @description This module handles populating user sheets with data from infoData.
 *              Note: Sheet structure and formatting come from TEMPLATE_USER sheet copy.
 * @since 1.0.0
 */

import { InfoDataRow } from '@/types/user';
import { ACCOUNT_DATA_SHEET_ID } from '../config';


/**
 * Populate user sheet data row (row 2)
 * @description Fills row 2 with user data from infoData
 * 
 * @param {any} sheets - Google Sheets API instance
 * @param {string} userSheetName - Name of the user sheet
 * @param {InfoDataRow} userData - User data from infoData
 * @returns {Promise<void>} Resolves when data is populated
 * 
 * @author Personal Trainer Platform Team
 * @since 1.0.0
 */
export async function populateUserSheetData(
  sheets: any,
  userSheetName: string,
  userData: InfoDataRow
): Promise<void> {
  console.log(`📝 [Google Sheets] Inserting user data from infoData to row 2...`);
  console.log(`   - Name: ${userData.name || '(empty)'}`);
  console.log(`   - Surname: ${userData.surname || '(empty)'}`);
  console.log(`   - Email: ${userData.email || '(empty)'}`);
  console.log(`   - Birth: ${userData.birth || '(empty)'}`);

  const dataValues = [
    (userData.name || '').toUpperCase(),        // A: UserName
    (userData.surname || '').toUpperCase(),     // B: UserSurname
    (userData.email || '').toUpperCase(),       // C: UserEmail
    '',                                         // D: UserPhone (empty)
    (userData.birth || '').toUpperCase(),       // E: UserBirth
    '',                                         // F: TrainingCredit (empty)
    '',                                         // G: TrainingsScheduled (empty)
    '',                                         // H: DebtValue (empty)
    '',                                         // I: Paid? (empty)
    '',                                         // J: Q1 (empty)
    '',                                         // K: Q2 (empty)
    '',                                         // L: Q3 (empty)
    '',                                         // M: Q4 (empty)
    '',                                         // N: OBJETIVO 📝 (empty)
    '',                                         // O: NOTES 📝 (empty)
    userData.age || '',                         // P: IDADE/ALTURA
  ];

  await sheets.spreadsheets.values.update({
    spreadsheetId: ACCOUNT_DATA_SHEET_ID,
    range: `${userSheetName}!A2:P2`,
    valueInputOption: 'RAW',
    requestBody: {
      values: [dataValues],
    },
  });
  console.log(`✅ [Google Sheets] User data inserted successfully to row 2: ${userSheetName}`);
}


