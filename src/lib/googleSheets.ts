import { google } from 'googleapis';
import { User, RegisterData } from '@/types/user';

const SHEET_ID = process.env.GOOGLE_SHEET_ID || '1xO9PkY4dV5PLndq5I686hL5rY4TftVtN1LvO-8Ay0YM';
const SHEET_NAME = process.env.GOOGLE_SHEET_NAME || 'Users';

// Initialize Google Sheets API client
async function getAuthClient() {
  const credentialsPath = process.env.GOOGLE_SERVICE_ACCOUNT_KEY_PATH;
  const credentialsString = process.env.GOOGLE_SERVICE_ACCOUNT_CREDENTIALS;
  
  let credentialsObj;

  // Try to read from file path first (more secure for production)
  if (credentialsPath) {
    try {
      const fs = await import('fs/promises');
      const fileContent = await fs.readFile(credentialsPath, 'utf-8');
      credentialsObj = JSON.parse(fileContent);
    } catch (error) {
      throw new Error(`Failed to read credentials file at ${credentialsPath}: ${error}`);
    }
  } 
  // Otherwise, try to parse from environment variable
  else if (credentialsString) {
    try {
      credentialsObj = JSON.parse(credentialsString);
    } catch (error) {
      throw new Error('Invalid GOOGLE_SERVICE_ACCOUNT_CREDENTIALS JSON format');
    }
  } 
  else {
    throw new Error('Either GOOGLE_SERVICE_ACCOUNT_KEY_PATH or GOOGLE_SERVICE_ACCOUNT_CREDENTIALS must be set');
  }

  const auth = new google.auth.GoogleAuth({
    credentials: credentialsObj,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });

  return auth;
}

// Get Google Sheets API instance
async function getSheetsAPI() {
  const auth = await getAuthClient();
  const sheets = google.sheets({ version: 'v4', auth });
  return sheets;
}

// Read all users from the sheet
export async function getAllUsers(): Promise<User[]> {
  try {
    const sheets = await getSheetsAPI();
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: `${SHEET_NAME}!A:G`, // Assuming columns: ID, Email, Password, Name, Phone, CreatedAt, UpdatedAt
    });

    const rows = response.data.values;
    if (!rows || rows.length <= 1) {
      return []; // No data or only headers
    }

    // Skip header row and map to User objects
    return rows.slice(1).map((row) => ({
      id: row[0] || '',
      email: row[1] || '',
      password: row[2] || '',
      name: row[3] || '',
      phone: row[4] || '',
      createdAt: row[5] || '',
      updatedAt: row[6] || '',
    }));
  } catch (error) {
    console.error('Error reading from Google Sheets:', error);
    throw error;
  }
}

// Find user by email
export async function getUserByEmail(email: string): Promise<User | null> {
  try {
    const users = await getAllUsers();
    return users.find((user) => user.email.toLowerCase() === email.toLowerCase()) || null;
  } catch (error) {
    console.error('Error finding user by email:', error);
    throw error;
  }
}

// Add a new user to the sheet
export async function createUser(userData: RegisterData): Promise<User> {
  try {
    const sheets = await getSheetsAPI();
    
    // Check if user already exists
    const existingUser = await getUserByEmail(userData.email);
    if (existingUser) {
      throw new Error('User with this email already exists');
    }

    // Generate ID (you could use UUID or timestamp-based ID)
    const id = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const now = new Date().toISOString();

    // Hash password (in production, use bcrypt or similar)
    // For now, we'll store it as-is but you should hash it
    const hashedPassword = userData.password; // TODO: Implement password hashing

    const newRow = [
      id,
      userData.email.toLowerCase(),
      hashedPassword,
      userData.name,
      userData.phone || '',
      now,
      now,
    ];

    // Append the new row
    await sheets.spreadsheets.values.append({
      spreadsheetId: SHEET_ID,
      range: `${SHEET_NAME}!A:G`,
      valueInputOption: 'RAW',
      requestBody: {
        values: [newRow],
      },
    });

    return {
      id,
      email: userData.email.toLowerCase(),
      password: hashedPassword,
      name: userData.name,
      phone: userData.phone,
      createdAt: now,
      updatedAt: now,
    };
  } catch (error) {
    console.error('Error creating user in Google Sheets:', error);
    throw error;
  }
}

// Initialize the sheet with headers if it doesn't exist
export async function initializeSheet(): Promise<void> {
  try {
    const sheets = await getSheetsAPI();
    
    // Check if headers exist
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: `${SHEET_NAME}!A1:G1`,
    });

    if (!response.data.values || response.data.values.length === 0) {
      // Add headers
      await sheets.spreadsheets.values.update({
        spreadsheetId: SHEET_ID,
        range: `${SHEET_NAME}!A1:G1`,
        valueInputOption: 'RAW',
        requestBody: {
          values: [['ID', 'Email', 'Password', 'Name', 'Phone', 'CreatedAt', 'UpdatedAt']],
        },
      });
    }
  } catch (error) {
    console.error('Error initializing sheet:', error);
    // Don't throw - it's okay if headers already exist
  }
}

