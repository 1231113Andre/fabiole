# Google Sheets Setup Instructions

## Overview
This project uses Google Sheets as the database for user registration and login. The Sheet ID is: `1xO9PkY4dV5PLndq5I686hL5rY4TftVtN1LvO-8Ay0YM`

## Setup Steps

### 1. Create Google Cloud Project and Service Account

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project (or select an existing one)
3. Enable the **Google Sheets API**:
   - Navigate to "APIs & Services" > "Library"
   - Search for "Google Sheets API"
   - Click "Enable"

### 2. Create Service Account

1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "Service Account"
3. Fill in the service account details:
   - Name: `fabiole-sheets-access`
   - Click "Create and Continue"
   - Skip role assignment (optional)
   - Click "Done"

### 3. Generate Service Account Key

1. Click on the created service account
2. Go to the "Keys" tab
3. Click "Add Key" > "Create new key"
4. Choose "JSON" format
5. Download the JSON key file (keep it secure!)

### 4. Share Google Sheet with Service Account

1. Open your Google Sheet: https://docs.google.com/spreadsheets/d/1xO9PkY4dV5PLndq5I686hL5rY4TftVtN1LvO-8Ay0YM/edit
2. Click "Share" button (top right)
3. Copy the service account email from the downloaded JSON file (look for `client_email` field)
4. Paste the email in the "Share with people and groups" field
5. Give it "Editor" permissions
6. Click "Send"

### 5. Configure Environment Variables

Create a `.env.local` file in the project root with the following variables:

**Option 1: Using File Path (Recommended for local development)**
```env
GOOGLE_SHEET_ID=1xO9PkY4dV5PLndq5I686hL5rY4TftVtN1LvO-8Ay0YM
GOOGLE_SHEET_NAME=Users
GOOGLE_SERVICE_ACCOUNT_KEY_PATH=./path/to/your/service-account-key.json
```

**Option 2: Using JSON String (For deployment platforms like Vercel)**
```env
GOOGLE_SHEET_ID=1xO9PkY4dV5PLndq5I686hL5rY4TftVtN1LvO-8Ay0YM
GOOGLE_SHEET_NAME=Users
GOOGLE_SERVICE_ACCOUNT_CREDENTIALS={"type":"service_account","project_id":"...","private_key_id":"...","private_key":"...","client_email":"...","client_id":"...","auth_uri":"...","token_uri":"...","auth_provider_x509_cert_url":"...","client_x509_cert_url":"..."}
```

**Note:** 
- `.env.local` is already in `.gitignore` and won't be committed
- For Vercel/deployment, add these as environment variables in your platform settings
- Never commit your service account credentials to git!

## Sheet Structure

The sheet will automatically create headers in the "Users" tab with the following columns:
- **ID** - Unique user identifier
- **Email** - User email address
- **Password** - User password (should be hashed in production)
- **Name** - User full name
- **Phone** - User phone number (optional)
- **CreatedAt** - Account creation timestamp
- **UpdatedAt** - Last update timestamp

## API Endpoints

### POST `/api/auth/register`
Register a new user.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "name": "John Doe",
  "phone": "+351912345678" // optional
}
```

**Response (201):**
```json
{
  "message": "User registered successfully",
  "user": {
    "id": "user_1234567890_abc123",
    "email": "user@example.com",
    "name": "John Doe",
    "phone": "+351912345678",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

### POST `/api/auth/login`
Login with email and password.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response (200):**
```json
{
  "message": "Login successful",
  "user": {
    "id": "user_1234567890_abc123",
    "email": "user@example.com",
    "name": "John Doe",
    "phone": "+351912345678",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

## Security Notes

⚠️ **Important:** 
- Currently, passwords are stored as plain text. You should implement password hashing (bcrypt) before production use.
- The code includes TODO comments where password hashing should be added.
- Always use HTTPS in production.
- Keep your service account credentials secure and never expose them publicly.

## Troubleshooting

- **Error: "GOOGLE_SERVICE_ACCOUNT_CREDENTIALS environment variable is not set"**
  - Make sure you've created `.env.local` with the required variables

- **Error: "The caller does not have permission"**
  - Make sure you've shared the Google Sheet with the service account email

- **Error: "API has not been used"**
  - Make sure Google Sheets API is enabled in your Google Cloud project

