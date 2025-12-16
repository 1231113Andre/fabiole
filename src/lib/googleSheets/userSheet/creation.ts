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
    (userData.name || '').toUpperCase(),        // UserName
    (userData.surname || '').toUpperCase(),     // UserSurname
    (userData.email || '').toUpperCase(),       // UserEmail
    '',                                         // UserPhone (empty)
    (userData.birth || '').toUpperCase(),       // UserBirth
    '',                                         // TrainingCredit (empty)
    '',                                         // TreiningsScheduled (empty)
    '',                                         // DebtValue (empty)
    '',                                         // Paid? (empty)
    '',                                         // Q1 (empty)
    '',                                         // Q2 (empty)
    '',                                         // Q3 (empty)
    '',                                         // Q4 (empty)
    ''                                          // Notas (empty)
  ];
  
  await sheets.spreadsheets.values.update({
    spreadsheetId: ACCOUNT_DATA_SHEET_ID,
    range: `${userSheetName}!A2:N2`,
    valueInputOption: 'RAW',
    requestBody: {
      values: [dataValues],
    },
  });
  console.log(`✅ [Google Sheets] User data inserted successfully to row 2: ${userSheetName}`);
}


