/**
 * @fileoverview Template sheet copying module
 * @author Personal Trainer Platform Team
 * @description This module handles copying the TEMPLATE_USER sheet to create new user sheets.
 *              Uses Google Sheets API copyTo method which preserves 100% of formatting, styles,
 *              formulas, and structure within the same spreadsheet. Simple and reliable!
 * @since 1.0.0
 */

import { google } from 'googleapis';
import { getAuthClient } from '../auth';
import { ACCOUNT_DATA_SHEET_ID, TEMPLATE_USER_SHEET_NAME } from '../config';

// Cache template sheet ID to avoid repeated API calls
let cachedTemplateSheetId: number | null = null;

/**
 * Get template sheet ID (cached for performance)
 * @description Retrieves the template sheet ID, using cache if available.
 *              This avoids repeated spreadsheet.get calls which improve performance significantly.
 * 
 * @returns Promise resolving to template sheet ID
 * @throws {Error} If template sheet doesn't exist
 */
async function getTemplateSheetId(sheets: any): Promise<number> {
  // Return cached ID if available
  if (cachedTemplateSheetId !== null) {
    return cachedTemplateSheetId;
  }

  // Fetch template sheet ID from spreadsheet
  const spreadsheet = await sheets.spreadsheets.get({
    spreadsheetId: ACCOUNT_DATA_SHEET_ID,
  });

  const templateSheet = spreadsheet.data.sheets?.find(
    (sheet: any) => sheet.properties?.title === TEMPLATE_USER_SHEET_NAME
  );

  if (!templateSheet?.properties?.sheetId) {
    throw new Error(
      `Template sheet "${TEMPLATE_USER_SHEET_NAME}" not found in spreadsheet. ` +
      `Please create a sheet named "${TEMPLATE_USER_SHEET_NAME}" with the desired formatting and structure.`
    );
  }

  const templateSheetId = templateSheet.properties.sheetId;
  // Cache the ID for future use
  cachedTemplateSheetId = templateSheetId;
  console.log(`✅ [Google Sheets] Template sheet found and cached (ID: ${templateSheetId})`);
  
  return templateSheetId;
}

/**
 * Copy template sheet to create new user sheet
 * @description Creates a new sheet by copying TEMPLATE_USER sheet within the same spreadsheet.
 *              This preserves 100% of formatting, styles, formulas, borders, colors, etc.
 *              Works entirely within the same spreadsheet - no Drive API or XLSX needed!
 *              Optimized with caching and batch operations for maximum performance.
 * 
 * @param targetSheetName - Name for the new user sheet (typically normalized email)
 * @returns Promise resolving to the created sheet ID
 * @throws {Error} If template sheet doesn't exist or copy fails
 * 
 * @example
 * const sheetId = await copyTemplateSheet('user_adnresilva_at_gmail_com');
 * 
 * @author Personal Trainer Platform Team
 * @since 1.0.0
 */
export async function copyTemplateSheet(targetSheetName: string): Promise<number> {
  console.log(`📋 [Google Sheets] Copying template sheet "${TEMPLATE_USER_SHEET_NAME}" to create: ${targetSheetName}`);

  const auth = await getAuthClient();
  const sheets = google.sheets({ version: 'v4', auth });

  // Get template sheet ID (cached for performance)
  const templateSheetId = await getTemplateSheetId(sheets);

  // Copy template sheet to create new user sheet
  // This copies EVERYTHING: values, formatting, dimensions, frozen rows/columns, formulas, etc.
  console.log(`🔄 [Google Sheets] Copying template sheet (preserving 100% formatting)...`);
  const copyResponse = await sheets.spreadsheets.sheets.copyTo({
    spreadsheetId: ACCOUNT_DATA_SHEET_ID,
    sheetId: templateSheetId,
    requestBody: {
      destinationSpreadsheetId: ACCOUNT_DATA_SHEET_ID, // Same spreadsheet!
    },
  });

  const newSheetId = copyResponse.data.sheetId;
  if (!newSheetId || typeof newSheetId !== 'number') {
    throw new Error('Failed to copy template sheet - invalid sheet ID returned');
  }

  console.log(`✅ [Google Sheets] Template sheet copied (new sheet ID: ${newSheetId})`);
  // Note: Rename is handled by caller in batchUpdate for better performance (combined with data population)
  return newSheetId;
}

