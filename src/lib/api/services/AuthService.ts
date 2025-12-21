import {
  findUserInInfoData,
  addUserToInfoData,
  getOrCreateUserSheet,
  initializeInfoDataSheet,
  userExistsInInfoData,
} from '@/lib/googleSheets';
import { LoginInput } from '../validators/auth.validator';
import { RegisterInput } from '../validators/auth.validator';
import { hashPassword } from '@/lib/security/password';
import { signSession } from '@/lib/security/session';
import { randomUUID } from 'crypto';

export interface UserResponse {
  name: string;
  surname: string;
  email: string;
  birth: string;
  uuid?: string;
}

/**
 * Authentication service
 * Handles login, registration, and session management
 */
export class AuthService {
  /**
   * Login user
   */
  static async login(email: string, password: string): Promise<UserResponse> {
    // Initialize infoData sheet headers if needed
    await initializeInfoDataSheet();

    // Find user in infoData by email and password
    const user = await findUserInInfoData(email, password);

    if (!user) {
      throw new Error('Invalid email or password');
    }

    // Auto-generate UUID if missing (for manually added users)
    let userUUID = user.uuid;
    if (!userUUID) {
      userUUID = randomUUID();
      console.log(`🔧 [AuthService] Auto-generating missing UUID for: ${email}`);

      // Import dynamically to avoid circular dependency
      const { updateUserUUID } = await import('@/lib/googleSheets/updateUserUUID');
      const updated = await updateUserUUID(email, userUUID);
      if (updated) {
        console.log(`✅ [AuthService] UUID auto-generated for: ${email}`);
      }
    }

    // Don't send password back in response
    const { password: _, ...userResponse } = user;
    userResponse.uuid = userUUID;

    // Create user sheet if it doesn't exist (non-blocking)
    try {
      await getOrCreateUserSheet(email, { ...user, uuid: userUUID });
      console.log(`✅ [AuthService] User sheet ready for: ${email}`);
    } catch (err) {
      console.error('⚠️ [AuthService] Sheet creation/check failed (non-blocking):', err);
      // Don't block login - sheet will be created on next login or when user accesses dashboard
    }

    return userResponse;
  }

  /**
   * Register new user
   */
  static async register(userData: RegisterInput): Promise<UserResponse> {
    // Initialize infoData sheet headers if needed
    await initializeInfoDataSheet();

    // Check if user already exists
    const exists = await userExistsInInfoData(userData.email);
    if (exists) {
      throw new Error('User with this email already exists');
    }

    // Hash password before storing
    const hashedPassword = await hashPassword(userData.password);

    // Generate unique UUID for this user
    const userUUID = randomUUID();

    // Add new user to infoData with hashed password and UUID
    const newUser = await addUserToInfoData({
      name: userData.name,
      surname: userData.surname,
      email: userData.email,
      password: hashedPassword,
      birth: userData.birth,
      uuid: userUUID,
    });

    // Don't send password back in response
    const { password: _, ...userResponse } = newUser;

    // Create user sheet and fill with data (non-blocking)
    try {
      await getOrCreateUserSheet(userData.email, newUser);
      console.log(`✅ [AuthService] User sheet ready for: ${userData.email}`);
    } catch (err) {
      console.error('⚠️ [AuthService] Sheet creation/check failed (non-blocking):', err);
      // Don't block registration - sheet will be created on next login or when user accesses dashboard
    }

    return userResponse;
  }

  /**
   * Set session cookie with signed JWT
   */
  static async createSessionCookie(user: UserResponse): Promise<Array<{
    name: string;
    value: string;
    options: {
      httpOnly: boolean;
      secure: boolean;
      sameSite: 'strict';
      maxAge: number;
      path: string;
    };
  }>> {
    const maxAge = 60 * 60 * 24 * 7; // 7 days

    // Sign session with JWT
    const token = await signSession(
      {
        email: user.email,
        name: user.name,
        surname: user.surname,
        birth: user.birth,
        uuid: user.uuid,
      },
      maxAge
    );

    return [
      // 1. Secure Session Cookie (HttpOnly) - for server-side auth
      {
        name: 'auth_session',
        value: token,
        options: {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'strict',
          maxAge,
          path: '/',
        },
      },
      // 2. Session Indicator Cookie (Not HttpOnly) - for client-side check
      // This allows the client to know if a session exists without making a request
      {
        name: 'has_session',
        value: '1',
        options: {
          httpOnly: false, // Accessible by JS
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'strict',
          maxAge,
          path: '/',
        },
      },
    ];
  }
}
