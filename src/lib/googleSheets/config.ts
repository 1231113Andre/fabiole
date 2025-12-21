/**
 * @fileoverview Configuration module for Google Sheets integration
 * @author Personal Trainer Platform Team
 * @description This module contains all configuration constants and environment variables
 *              used throughout the Google Sheets integration.
 * @since 1.0.0
 */

/**
 * Google Sheets Spreadsheet ID
 * @description The ID of the main Google Spreadsheet containing user data.
 *              Can be overridden via GOOGLE_SHEET_ID environment variable.
 * @constant {string}
 * @default '11Z4m5MKXFxb4TgRdUpO9diZncI1NdOkFwxWkr501H40'
 */
export const ACCOUNT_DATA_SHEET_ID = process.env.GOOGLE_SHEET_ID || '11Z4m5MKXFxb4TgRdUpO9diZncI1NdOkFwxWkr501H40';
export const INFO_SHEET_ID = ACCOUNT_DATA_SHEET_ID;

/**
 * InfoData Sheet Name
 * @description The name of the main admin sheet containing user account information.
 *              Columns: Name | Surname | Email | Password | Birth
 * @constant {string}
 * @default 'infoData'
 */
export const INFO_DATA_SHEET_NAME = process.env.GOOGLE_SHEET_NAME || 'infoData';

/**
 * Template User Sheet Name
 * @description The name of the template sheet that will be copied to create new user sheets.
 *              This sheet should contain the complete formatting, styles, formulas, and structure
 *              for user sheets. New user sheets are created as 1:1 copies of this template.
 *              Can be overridden via TEMPLATE_USER_SHEET_NAME or ACCOUNT_DATA_TEMPLATE environment variable.
 * @constant {string}
 * @default 'account_data_template'
 */
export const TEMPLATE_USER_SHEET_NAME = process.env.TEMPLATE_USER_SHEET_NAME || process.env.ACCOUNT_DATA_TEMPLATE || 'account_data_template';

/**
 * Google Sheets API Scopes
 * @description Required OAuth2 scopes for accessing Google Sheets API
 * @constant {string[]}
 */
export const GOOGLE_SHEETS_SCOPES = [
  'https://www.googleapis.com/auth/spreadsheets',
];

