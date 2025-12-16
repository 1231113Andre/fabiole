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

export interface UserResponse {
  name: string;
  surname: string;
  email: string;
  birth: string;
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

    // Don't send password back in response
    const { password: _, ...userResponse } = user;

    // Create user sheet if it doesn't exist (non-blocking)
    try {
      await getOrCreateUserSheet(email, user);
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

    // Add new user to infoData with hashed password
    const newUser = await addUserToInfoData({
      name: userData.name,
      surname: userData.surname,
      email: userData.email,
      password: hashedPassword,
      birth: userData.birth,
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
  static async createSessionCookie(user: UserResponse): Promise<{
    name: string;
    value: string;
    options: {
      httpOnly: boolean;
      secure: boolean;
      sameSite: 'strict';
      maxAge: number;
      path: string;
    };
  }> {
    // Sign session with JWT
    const token = await signSession({
      email: user.email,
      name: user.name,
      surname: user.surname,
      birth: user.birth,
    });

    return {
      name: 'auth_session',
      value: token,
      options: {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 60 * 60 * 24 * 7, // 7 days
        path: '/',
      },
    };
  }

  /**
   * Delete session cookie
   */
  static createLogoutCookie(): {
    name: string;
    value: string;
    options: {
      httpOnly: boolean;
      secure: boolean;
      sameSite: 'strict';
      maxAge: number;
      path: string;
    };
  } {
    return {
      name: 'auth_session',
      value: '',
      options: {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 0, // Expire immediately
        path: '/',
      },
    };
  }
}

