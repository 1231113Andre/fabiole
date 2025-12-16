/**
 * @fileoverview Google Sheets API authentication module
 * @author Personal Trainer Platform Team
 * @description This module handles Google Sheets API authentication using
 *              service account credentials. Supports both file path and
 *              environment variable credential sources.
 * @since 1.0.0
 */

import { google, type Auth } from 'googleapis';
import { GOOGLE_SHEETS_SCOPES } from './config';

// Singleton instances for performance optimization
let authClientInstance: Auth.GoogleAuth | null = null;
let sheetsAPIInstance: ReturnType<typeof google.sheets> | null = null;

/**
 * Initialize Google Authorization Client (Singleton)
 * @description Creates and returns a cached Google Auth client using service account credentials.
 *              Supports two credential sources:
 *              1. File path (GOOGLE_SERVICE_ACCOUNT_KEY_PATH) - preferred for production
 *              2. Environment variable (GOOGLE_SERVICE_ACCOUNT_CREDENTIALS) - JSON string
 * 
 *              Uses singleton pattern to avoid recreating auth client on every request.
 * 
 * @returns {Promise<Auth.GoogleAuth>} Authenticated Google Auth client (cached)
 * @throws {Error} If credentials cannot be loaded or are invalid
 * 
 * @example
 * const auth = await getAuthClient();
 * const client = await auth.getClient();
 * 
 * @author Personal Trainer Platform Team
 * @since 1.0.0
 */
export async function getAuthClient(): Promise<Auth.GoogleAuth> {
  // Return cached instance if available
  if (authClientInstance) {
    return authClientInstance;
  }
  console.log('🔐 [Google Sheets] Initializing authorization client...');
  const credentialsPath = process.env.GOOGLE_SERVICE_ACCOUNT_KEY_PATH;
  const credentialsString = process.env.GOOGLE_SERVICE_ACCOUNT_CREDENTIALS;
  
  console.log('📋 [Google Sheets] Environment variables:');
  console.log(`   - GOOGLE_SHEET_ID: ${process.env.GOOGLE_SHEET_ID ? '✅ Set' : '❌ Missing'}`);
  console.log(`   - GOOGLE_SHEET_NAME: ${process.env.GOOGLE_SHEET_NAME ? '✅ Set' : '❌ Missing'}`);
  console.log(`   - GOOGLE_SERVICE_ACCOUNT_KEY_PATH: ${credentialsPath ? `✅ ${credentialsPath}` : '❌ Missing'}`);
  console.log(`   - GOOGLE_SERVICE_ACCOUNT_CREDENTIALS: ${credentialsString ? '✅ Set (string)' : 'ℹ️ Not set (using file path instead)'}`);
  
  let credentialsObj: any;

  // Try to read from file path first (more secure for production)
  if (credentialsPath) {
    try {
      console.log(`📁 [Google Sheets] Attempting to read file: ${credentialsPath}`);
      const fs = await import('fs/promises');
      const fileContent = await fs.readFile(credentialsPath, 'utf-8');
      credentialsObj = JSON.parse(fileContent);
      console.log('✅ [Google Sheets] Credentials file read successfully');
      console.log(`   - Service account email: ${credentialsObj.client_email || 'Not found'}`);
      console.log(`   - Project ID: ${credentialsObj.project_id || 'Not found'}`);
    } catch (error) {
      console.error('❌ [Google Sheets] Error reading credentials file:', error);
      throw new Error(`Failed to read credentials file at ${credentialsPath}: ${error}`);
    }
  } 
  // Otherwise, try to parse from environment variable
  else if (credentialsString) {
    try {
      console.log('📝 [Google Sheets] Attempting to parse JSON from environment variable');
      credentialsObj = JSON.parse(credentialsString);
      console.log('✅ [Google Sheets] JSON credentials parsed successfully');
      console.log(`   - Service account email: ${credentialsObj.client_email || 'Not found'}`);
    } catch (error) {
      console.error('❌ [Google Sheets] Error parsing JSON:', error);
      throw new Error('Invalid GOOGLE_SERVICE_ACCOUNT_CREDENTIALS JSON format');
    }
  } 
  else {
    console.error('❌ [Google Sheets] No service account key configuration found');
    throw new Error('Either GOOGLE_SERVICE_ACCOUNT_KEY_PATH or GOOGLE_SERVICE_ACCOUNT_CREDENTIALS must be set');
  }

  console.log('🔑 [Google Sheets] Creating Google authorization client...');
  authClientInstance = new google.auth.GoogleAuth({
    credentials: credentialsObj,
    scopes: GOOGLE_SHEETS_SCOPES,
  });

  console.log('✅ [Google Sheets] Authorization client created successfully (cached)');
  return authClientInstance;
}

/**
 * Get Google Sheets API instance (Singleton)
 * @description Initializes and returns a cached Google Sheets API client.
 *              This is the main entry point for all Google Sheets operations.
 *              Uses singleton pattern for better performance.
 * 
 * @returns {Promise<ReturnType<typeof google.sheets>>} Configured Google Sheets API client (cached)
 * @throws {Error} If authentication fails
 * 
 * @example
 * const sheets = await getSheetsAPI();
 * const response = await sheets.spreadsheets.values.get({
 *   spreadsheetId: '...',
 *   range: 'Sheet1!A1:B2'
 * });
 * 
 * @author Personal Trainer Platform Team
 * @since 1.0.0
 */
export async function getSheetsAPI(): Promise<ReturnType<typeof google.sheets>> {
  // Return cached instance if available
  if (sheetsAPIInstance) {
    return sheetsAPIInstance;
  }

  console.log('📊 [Google Sheets] Initializing Google Sheets API...');
  const auth = await getAuthClient();
  sheetsAPIInstance = google.sheets({ version: 'v4', auth });
  console.log('✅ [Google Sheets] Google Sheets API initialized (cached)');
  return sheetsAPIInstance;
}

