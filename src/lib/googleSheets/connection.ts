/**
 * @fileoverview Connection testing module for Google Sheets
 * @author Personal Trainer Platform Team
 * @description This module provides functionality to test and verify the connection
 *              to Google Sheets API, including authentication, spreadsheet access,
 *              and data reading capabilities.
 * @since 1.0.0
 */

import { getAuthClient, getSheetsAPI } from './auth';
import { ACCOUNT_DATA_SHEET_ID, INFO_DATA_SHEET_NAME } from './config';
import { ConnectionTestResult } from './types';

/**
 * Test connection to Google Sheets
 * @description Performs a comprehensive connection test to verify:
 *              - Authentication is working
 *              - Spreadsheet is accessible
 *              - Data can be read from infoData sheet
 *              - Service account credentials are valid
 * 
 * @returns {Promise<ConnectionTestResult>} Test result with success status and details
 * 
 * @example
 * const result = await testConnection();
 * if (result.success) {
 *   console.log(`Connected to: ${result.details?.spreadsheetTitle}`);
 *   console.log(`Users found: ${result.details?.userCount}`);
 * } else {
 *   console.error(`Connection failed: ${result.error}`);
 * }
 * 
 * @author Personal Trainer Platform Team
 * @since 1.0.0
 */
export async function testConnection(): Promise<ConnectionTestResult> {
  try {
    console.log('🧪 [Google Sheets] Starting connection test...');
    
    // Test authentication
    const auth = await getAuthClient();
    const client = await auth.getClient();
    
    console.log('✅ [Google Sheets] Authentication successful');
    
    // Test API access
    const sheets = await getSheetsAPI();
    console.log(`📊 [Google Sheets] Testing access to spreadsheet: ${ACCOUNT_DATA_SHEET_ID}`);
    
    // Try to get spreadsheet metadata
    const spreadsheetInfo = await sheets.spreadsheets.get({
      spreadsheetId: ACCOUNT_DATA_SHEET_ID,
    });
    
    console.log('✅ [Google Sheets] Spreadsheet access confirmed');
    const spreadsheetTitle = spreadsheetInfo.data.properties?.title || 'Unknown';
    console.log(`   - Spreadsheet title: ${spreadsheetTitle}`);
    
    // Try to read infoData headers
    let headers: string[] = [];
    let userCount = 0;
    try {
      const headersResponse = await sheets.spreadsheets.values.get({
        spreadsheetId: ACCOUNT_DATA_SHEET_ID,
        range: `${INFO_DATA_SHEET_NAME}!A1:E1`,
      });
      
      if (headersResponse.data.values && headersResponse.data.values.length > 0) {
        headers = headersResponse.data.values[0] as string[];
        console.log(`✅ [Google Sheets] Headers read: ${headers.join(', ')}`);
      }
      
      // Try to count users (only valid rows with email containing @)
      const usersResponse = await sheets.spreadsheets.values.get({
        spreadsheetId: ACCOUNT_DATA_SHEET_ID,
        range: `${INFO_DATA_SHEET_NAME}!A:E`,
      });
      
      if (usersResponse.data.values && usersResponse.data.values.length > 1) {
        // Count only rows that have a valid email (contains @)
        const validUsers = usersResponse.data.values.slice(1).filter(
          (row: any[]) => row[2] && typeof row[2] === 'string' && row[2].trim() !== '' && row[2].includes('@')
        );
        userCount = validUsers.length;
        console.log(`📊 [Google Sheets] User count: ${userCount} (valid users with email)`);
      }
    } catch (readError) {
      console.warn('⚠️ [Google Sheets] Could not read data from sheet:', readError);
    }
    
    // Get service account email from credentials
    const fs = await import('fs/promises');
    const credentialsPath = process.env.GOOGLE_SERVICE_ACCOUNT_KEY_PATH;
    let serviceAccountEmail: string | undefined;
    let projectId: string | undefined;
    
    if (credentialsPath) {
      try {
        const fileContent = await fs.readFile(credentialsPath, 'utf-8');
        const creds = JSON.parse(fileContent);
        serviceAccountEmail = creds.client_email;
        projectId = creds.project_id;
      } catch (error) {
        console.warn('⚠️ [Google Sheets] Could not read service account email');
      }
    }
    
    console.log('✅ [Google Sheets] Connection test completed successfully');
    
    return {
      success: true,
      message: 'Connection to Google Sheets is working correctly',
      details: {
        sheetId: ACCOUNT_DATA_SHEET_ID,
        sheetName: INFO_DATA_SHEET_NAME,
        serviceAccountEmail,
        projectId,
        userCount,
        spreadsheetTitle,
        headers,
      },
    };
  } catch (error) {
    console.error('❌ [Google Sheets] Connection test failed:', error);
    return {
      success: false,
      message: 'Error connecting to Google Sheets',
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

