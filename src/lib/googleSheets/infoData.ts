/**
 * @fileoverview InfoData sheet operations module
 * @author Personal Trainer Platform Team
 * @description This module handles all operations related to the main admin sheet "infoData",
 *              which contains user account information (Name, Surname, Email, Password, Birth, Age).
 *              This sheet is manually editable by the trainer (admin) and serves as the
 *              source for account provisioning.
 * @since 1.0.0
 */

import { InfoDataRow } from '@/types/user';
import { getSheetsAPI } from './auth';
import { ACCOUNT_DATA_SHEET_ID, INFO_DATA_SHEET_NAME } from './config';
import { apiCache, CacheKeys, clearInfoDataCache } from './cache';
import { comparePassword } from '@/lib/security/password';

// Debug mode - can be disabled in production
const DEBUG = process.env.NODE_ENV === 'development';

/**
 * Initialize infoData sheet with headers
 * @description Ensures the infoData sheet exists and has the correct headers.
 *              Headers: Name | Surname | Email | Password | Birth | Age
 *              This function is idempotent - safe to call multiple times.
 * 
 * @returns {Promise<void>} Resolves when headers are initialized
 * @throws {Error} If sheet cannot be accessed or headers cannot be written
 * 
 * @example
 * await initializeInfoDataSheet();
 * // Sheet now has headers: Name, Surname, Email, Password, Birth, Age
 * 
 * @author Personal Trainer Platform Team
 * @since 1.0.0
 */
export async function initializeInfoDataSheet(): Promise<void> {
  try {
    // Check cache first - if already initialized, skip API call
    const cacheKey = CacheKeys.infoDataInitialized();
    if (apiCache.get<boolean>(cacheKey)) {
      console.log(`⚡ [Google Sheets] infoData sheet already initialized (cached)`);
      return;
    }

    console.log(`🔧 [Google Sheets] Initializing infoData sheet: ${ACCOUNT_DATA_SHEET_ID}, tab: ${INFO_DATA_SHEET_NAME}`);
    const sheets = await getSheetsAPI();

    // Check if headers exist
    console.log('🔍 [Google Sheets] Checking if headers exist...');
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: ACCOUNT_DATA_SHEET_ID,
      range: `${INFO_DATA_SHEET_NAME}!A10:F10`,
    });

    if (!response.data.values || response.data.values.length === 0) {
      console.log('📝 [Google Sheets] Headers do not exist, adding...');
      // Add headers: Name, Surname, Email, Password, Birth, Age
      await sheets.spreadsheets.values.update({
        spreadsheetId: ACCOUNT_DATA_SHEET_ID,
        range: `${INFO_DATA_SHEET_NAME}!A10:F10`,
        valueInputOption: 'RAW',
        requestBody: {
          values: [['Name', 'Surname', 'Email', 'Password', 'Birth', 'Age']],
        },
      });
      console.log('✅ [Google Sheets] Headers added successfully');
    } else {
      console.log('✅ [Google Sheets] Headers already exist');
    }

    // Cache initialization status with 1 hour TTL (headers don't change)
    apiCache.set(cacheKey, true, 60 * 60 * 1000);
  } catch (error) {
    console.error('❌ [Google Sheets] Error initializing infoData sheet:', error);
    // Don't throw - it's okay if headers already exist
  }
}

/**
 * Read all users from infoData sheet
 * @description Retrieves all user records from the infoData sheet.
 *              Filters out empty rows (rows without a valid email).
 * 
 * @returns {Promise<InfoDataRow[]>} Array of user records
 * @throws {Error} If sheet cannot be read
 * 
 * @example
 * const users = await getAllInfoDataUsers();
 * console.log(`Found ${users.length} users`);
 * 
 * @author Personal Trainer Platform Team
 * @since 1.0.0
 */
export async function getAllInfoDataUsers(): Promise<InfoDataRow[]> {
  try {
    // Check cache first
    const cacheKey = CacheKeys.infoDataUsers();
    const cached = apiCache.get<InfoDataRow[]>(cacheKey);
    if (cached) {
      console.log(`⚡ [Google Sheets] Using cached users list (${cached.length} users)`);
      return cached;
    }

    console.log(`📖 [Google Sheets] Reading users from infoData: ${ACCOUNT_DATA_SHEET_ID}, tab: ${INFO_DATA_SHEET_NAME}`);
    const sheets = await getSheetsAPI();
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: ACCOUNT_DATA_SHEET_ID,
      range: `${INFO_DATA_SHEET_NAME}!A10:F`, // Headers in row 10: Name, Surname, Email, Password, Birth, Age
    });

    console.log('✅ [Google Sheets] API response received');
    const rows = response.data.values;
    if (!rows || rows.length <= 1) {
      console.log('ℹ️ [Google Sheets] No user data found (only headers or empty sheet)');
      const emptyUsers: InfoDataRow[] = [];
      // Cache empty result too (shorter TTL)
      apiCache.set(cacheKey, emptyUsers, 30 * 1000); // 30 seconds for empty results
      return emptyUsers; // No data or only headers
    }

    // Skip header row and filter out empty rows (rows without at least email)
    // A valid user row must have at least an email (column C, index 2)
    const users = rows.slice(1)
      .map((row: any[]) => ({
        name: (row[0] || '').trim(),
        surname: (row[1] || '').trim(),
        email: (row[2] || '').trim(),
        password: (row[3] || '').trim(),
        birth: (row[4] || '').trim(),
        age: (row[5] || '').trim(),
      }))
      .filter((user: InfoDataRow) => user.email.trim() !== ''); // Only count rows with email

    console.log(`📊 [Google Sheets] Found ${users.length} valid users (excluding empty rows)`);
    console.log('✅ [Google Sheets] Users mapped successfully');

    // Cache with 2 minutes TTL
    apiCache.set(cacheKey, users, 2 * 60 * 1000);

    return users;
  } catch (error) {
    console.error('❌ [Google Sheets] Error reading from infoData:', error);
    throw error;
  }
}

/**
 * Find user by email and password in infoData
 * @description Searches the infoData sheet for a user matching email and password.
 *              Email comparison is case-insensitive.
 *              Password comparison supports both plain text (legacy) and hashed passwords.
 * 
 * @param {string} email - User's email address
 * @param {string} password - User's password (plain text)
 * @returns {Promise<InfoDataRow | null>} User record if found, null otherwise
 * @throws {Error} If sheet cannot be read
 * 
 * @example
 * const user = await findUserInInfoData('user@example.com', 'password123');
 * if (user) {
 *   console.log(`Found user: ${user.name} ${user.surname}`);
 * }
 * 
 * @author Personal Trainer Platform Team
 * @since 1.0.0
 */
export async function findUserInInfoData(email: string, password: string): Promise<InfoDataRow | null> {
  try {
    console.log(`🔍 [Google Sheets] Searching for user in infoData: ${email}`);
    const users = await getAllInfoDataUsers();
    const user = users.find(
      (user) => user.email.toLowerCase() === email.toLowerCase()
    ) || null;

    if (!user) {
      console.log(`ℹ️ [Google Sheets] User not found: ${email}`);
      return null;
    }

    // Check if password is hashed (bcrypt hashes start with $2a$, $2b$, or $2y$)
    const isHashed = user.password.startsWith('$2a$') ||
      user.password.startsWith('$2b$') ||
      user.password.startsWith('$2y$');

    let passwordMatches = false;

    if (isHashed) {
      // Compare with hashed password (using module-level import)
      passwordMatches = await comparePassword(password, user.password);
    } else {
      // Legacy: compare plain text (for backward compatibility during migration)
      passwordMatches = user.password === password;
      if (passwordMatches) {
        console.log(`⚠️ [Google Sheets] Using plain text password comparison (legacy) for: ${email}`);
      }
    }

    if (passwordMatches) {
      console.log(`✅ [Google Sheets] User found: ${user.name} ${user.surname} (${user.email})`);
      return user;
    } else {
      console.log(`ℹ️ [Google Sheets] Password incorrect for user: ${email}`);
      return null;
    }
  } catch (error) {
    console.error('❌ [Google Sheets] Error searching for user in infoData:', error);
    throw error;
  }
}

/**
 * Check if user exists in infoData by email
 * @description Checks if a user with the given email already exists in infoData.
 *              Email comparison is case-insensitive.
 * 
 * @param {string} email - User's email address to check
 * @returns {Promise<boolean>} True if user exists, false otherwise
 * @throws {Error} If sheet cannot be read
 * 
 * @example
 * const exists = await userExistsInInfoData('user@example.com');
 * if (exists) {
 *   console.log('User already registered');
 * }
 * 
 * @author Personal Trainer Platform Team
 * @since 1.0.0
 */
export async function userExistsInInfoData(email: string): Promise<boolean> {
  try {
    // Check cache first
    const cacheKey = CacheKeys.userExists(email);
    const cached = apiCache.get<boolean>(cacheKey);
    if (cached !== null) {
      console.log(`⚡ [Google Sheets] Using cached user exists check: ${email} = ${cached}`);
      return cached;
    }

    console.log(`🔍 [Google Sheets] Checking if user exists in infoData: ${email}`);
    const users = await getAllInfoDataUsers();
    const exists = users.some((user) => user.email.toLowerCase() === email.toLowerCase());
    console.log(`${exists ? '✅' : 'ℹ️'} [Google Sheets] User ${exists ? 'exists' : 'does not exist'}: ${email}`);

    // Cache result with 30 seconds TTL
    apiCache.set(cacheKey, exists, 30 * 1000);

    return exists;
  } catch (error) {
    console.error('❌ [Google Sheets] Error checking if user exists:', error);
    throw error;
  }
}

/**
 * Add a new user to infoData sheet
 * @description Appends a new user record to the infoData sheet.
 *              Validates that the user doesn't already exist before adding.
 *              Email is automatically converted to lowercase.
 * 
 * @param {InfoDataRow} userData - User data to add (Name, Surname, Email, Password, Birth, Age)
 * @returns {Promise<InfoDataRow>} The added user record (with normalized email)
 * @throws {Error} If user already exists or sheet cannot be written to
 * 
 * @example
 * const newUser = await addUserToInfoData({
 *   name: 'John',
 *   surname: 'Doe',
 *   email: 'john@example.com',
 *   password: 'secure123',
 *   birth: '01/01/1990'
 * });
 * 
 * @author Personal Trainer Platform Team
 * @since 1.0.0
 */
export async function addUserToInfoData(userData: InfoDataRow): Promise<InfoDataRow> {
  try {
    console.log(`➕ [Google Sheets] Adding new user to infoData: ${userData.email}`);
    const sheets = await getSheetsAPI();

    // Check if user already exists
    const exists = await userExistsInInfoData(userData.email);
    if (exists) {
      console.log(`⚠️ [Google Sheets] User already exists in infoData: ${userData.email}`);
      throw new Error('User with this email already exists');
    }

    const newRow = [
      userData.name,
      userData.surname,
      userData.email.toLowerCase(),
      userData.password,
      userData.birth,
      userData.age || '',
    ];

    console.log(`📝 [Google Sheets] Adding row to infoData...`);
    // Append the new row
    await sheets.spreadsheets.values.append({
      spreadsheetId: ACCOUNT_DATA_SHEET_ID,
      range: `${INFO_DATA_SHEET_NAME}!A:F`,
      valueInputOption: 'RAW',
      requestBody: {
        values: [newRow],
      },
    });

    console.log(`✅ [Google Sheets] User added to infoData successfully: ${userData.name} ${userData.surname} (${userData.email})`);

    // Clear cache since we added a new user
    clearInfoDataCache();
    // Also clear userExists cache for this specific email
    apiCache.delete(CacheKeys.userExists(userData.email.toLowerCase()));

    return {
      name: userData.name,
      surname: userData.surname,
      email: userData.email.toLowerCase(),
      password: userData.password,
      birth: userData.birth,
    };
  } catch (error) {
    console.error('❌ [Google Sheets] Error adding user to infoData:', error);
    throw error;
  }
}

