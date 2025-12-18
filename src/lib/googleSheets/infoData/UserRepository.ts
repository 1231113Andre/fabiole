import { InfoDataRow } from '@/types/user';
import { getSheetsAPI } from '../auth';
import { ACCOUNT_DATA_SHEET_ID, INFO_DATA_SHEET_NAME } from '../config';
import { UserCache } from './UserCache';
import { UserMapper } from './UserMapper';

/**
 * Service class for interacting with the 'infoData' Google Sheet.
 * Handles data persistence, retrieval, and finding users.
 */
export class UserRepository {

    /**
     * Initializes the infoData sheet.
     * Ensures headers exist including Age column.
     * NOTE: Always checks headers to ensure Age column is present (bypasses cache for header check)
     */
    async initialize(): Promise<void> {
        // Always check headers to ensure Age column exists
        // (don't skip based on cache - we need to add Age to existing sheets)

        try {
            console.log(`🔧 [Google Sheets] Initializing infoData sheet: ${ACCOUNT_DATA_SHEET_ID}, tab: ${INFO_DATA_SHEET_NAME}`);
            const sheets = await getSheetsAPI();

            const response = await sheets.spreadsheets.values.get({
                spreadsheetId: ACCOUNT_DATA_SHEET_ID,
                range: `${INFO_DATA_SHEET_NAME}!A1:F1`,
            });

            const headers = response.data.values?.[0] || [];
            const expectedHeaders = ['Name', 'Surname', 'Email', 'Password', 'Birth', 'Age'];

            if (headers.length === 0) {
                // No headers - create all
                console.log('📝 [Google Sheets] Headers do not exist, adding...');
                await sheets.spreadsheets.values.update({
                    spreadsheetId: ACCOUNT_DATA_SHEET_ID,
                    range: `${INFO_DATA_SHEET_NAME}!A1:F1`,
                    valueInputOption: 'RAW',
                    requestBody: {
                        values: [expectedHeaders],
                    },
                });
                console.log('✅ [Google Sheets] Headers added successfully');
            } else if (headers.length < 6 || headers[5] !== 'Age') {
                // Age column missing - add it
                console.log('📝 [Google Sheets] Age header missing, adding...');
                await sheets.spreadsheets.values.update({
                    spreadsheetId: ACCOUNT_DATA_SHEET_ID,
                    range: `${INFO_DATA_SHEET_NAME}!F1`,
                    valueInputOption: 'RAW',
                    requestBody: {
                        values: [['Age']],
                    },
                });
                console.log('✅ [Google Sheets] Age header added');
            } else {
                console.log(`✅ [Google Sheets] Headers: ${headers.join(' | ')}`);
            }

            UserCache.setInitialized();
        } catch (error) {
            console.error('❌ [Google Sheets] Error initializing infoData sheet:', error);
        }
    }

    /**
     * Retrieves all valid users from the sheet.
     */
    async getAll(): Promise<InfoDataRow[]> {
        const cached = UserCache.getUsers();
        if (cached) {
            console.log(`⚡ [Google Sheets] Using cached users list (${cached.length} users)`);
            return cached;
        }

        try {
            console.log(`📖 [Google Sheets] Reading users from infoData...`);
            const sheets = await getSheetsAPI();
            const response = await sheets.spreadsheets.values.get({
                spreadsheetId: ACCOUNT_DATA_SHEET_ID,
                range: `${INFO_DATA_SHEET_NAME}!A:F`,
            });

            console.log('✅ [Google Sheets] API response received');
            const rows = response.data.values;
            if (!rows || rows.length <= 1) {
                console.log('ℹ️ [Google Sheets] No user data found');
                UserCache.setUsers([]);
                return [];
            }

            // Skip header (row 0), map remainder
            const users = rows.slice(1)
                .map(UserMapper.toDomain)
                .filter((u): u is InfoDataRow => u !== null);

            console.log(`📊 [Google Sheets] Found ${users.length} valid users`);
            UserCache.setUsers(users);

            return users;
        } catch (error) {
            console.error('❌ [Google Sheets] Error reading from infoData:', error);
            throw error;
        }
    }

    /**
     * Finds a user with matching email and password.
     */
    async findByCredentials(email: string, password: string): Promise<InfoDataRow | null> {
        try {
            console.log(`🔍 [Google Sheets] Searching for user: ${email}`);
            const users = await this.getAll();
            const user = users.find(u => u.email.toLowerCase() === email.toLowerCase()) || null;

            if (!user) {
                console.log(`ℹ️ [Google Sheets] User not found: ${email}`);
                return null;
            }

            // Lazy load password utility
            const { comparePassword } = await import('@/lib/security/password');

            // Check hash
            const isHashed = user.password.startsWith('$2a$') ||
                user.password.startsWith('$2b$') ||
                user.password.startsWith('$2y$');

            let matches = false;
            if (isHashed) {
                matches = await comparePassword(password, user.password);
            } else {
                matches = user.password === password;
                if (matches) console.log(`⚠️ [Google Sheets] Using legacy plain text auth for: ${email}`);
            }

            if (matches) {
                console.log(`✅ [Google Sheets] User authenticated: ${user.email}`);
                return user;
            } else {
                console.log(`ℹ️ [Google Sheets] Invalid password for: ${email}`);
                return null;
            }
        } catch (error) {
            console.error('❌ [Google Sheets] Error during authentication:', error);
            throw error;
        }
    }

    /**
     * Checks if an email is already registered.
     */
    async exists(email: string): Promise<boolean> {
        const cached = UserCache.getUserExistence(email);
        if (cached !== null) {
            console.log(`⚡ [Google Sheets] Cache hit for user exists: ${email}`);
            return cached;
        }

        try {
            const users = await this.getAll();
            const exists = users.some(u => u.email.toLowerCase() === email.toLowerCase());

            UserCache.setUserExistence(email, exists);
            return exists;
        } catch (error) {
            console.error('❌ [Google Sheets] Error checking user existence:', error);
            throw error;
        }
    }

    /**
     * adds a new user to the sheet (if not attempting to duplicate email).
     */
    async add(userData: InfoDataRow): Promise<InfoDataRow> {
        try {
            console.log(`➕ [Google Sheets] Attempting to add user: ${userData.email}`);
            const alreadyExists = await this.exists(userData.email);
            if (alreadyExists) {
                throw new Error('User with this email already exists');
            }

            const normalizedUser = {
                ...userData,
                email: userData.email.toLowerCase()
            };

            const row = UserMapper.toRow(normalizedUser);
            const sheets = await getSheetsAPI();

            await sheets.spreadsheets.values.append({
                spreadsheetId: ACCOUNT_DATA_SHEET_ID,
                range: `${INFO_DATA_SHEET_NAME}!A:E`,
                valueInputOption: 'RAW',
                requestBody: { values: [row] },
            });

            console.log(`✅ [Google Sheets] User added: ${normalizedUser.email}`);

            // Invalidate caches
            UserCache.invalidateUsers();
            UserCache.invalidateUserExistence(normalizedUser.email);

            return normalizedUser;
        } catch (error) {
            console.error('❌ [Google Sheets] Error adding user:', error);
            throw error;
        }
    }
}

// Export singleton instance for convenience
export const userRepository = new UserRepository();
