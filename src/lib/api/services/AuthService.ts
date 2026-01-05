import { RegisterInput } from '@/lib/api/validators/auth.validator';
import { db } from '@/lib/db/client';
import { comparePassword, hashPassword } from '@/lib/security/password';
import { signSession } from '@/lib/security/session';
import { randomUUID } from 'crypto';
import { Logger } from '@/lib/utils/logger';
import { verifyPasswordWithFallback } from '@/lib/auth/helpers';
import { createSession, deleteSession, deleteAllUserSessions } from '@/lib/security/sessionStore';
import { getCachedAuthUser, setCachedAuthUser } from '@/lib/cache/userCache';

export interface UserResponse {
  name: string;
  surname: string;
  email: string;
  birth: string;
  avatarUrl?: string;
  uuid?: string;
}

/**
 * Authentication service
 * Handles login, registration, and session management
 */
export class AuthService {
  /**
   * Login user with Redis caching
   */
  static async login(email: string, password: string): Promise<UserResponse> {
    const normalizedEmail = email.toLowerCase().trim();

    // 1. Try Cache First
    type CachedUser = {
      id: string;
      email: string;
      name: string;
      surname: string;
      password: string;
      birth: Date | string | null;
      avatarUrl: string | null;
      status: string;
      statusChangedBy: string | null;
      statusChangedAt: Date | string | null;
      statusReason: string | null;
    };
    let user = await getCachedAuthUser<CachedUser>(normalizedEmail);

    if (!user) {
      // 2. Fallback to DB
      user = await db.user.findUnique({
        where: { email: normalizedEmail },
      });

      if (user) {
        // Cache the user record (including password hash) for future logins
        // This avoids DB hits on every login
        await setCachedAuthUser(normalizedEmail, user);
      }
    }

    if (!user) {
      throw new Error('Invalid email or password');
    }

    // 2. Verify password (using cached or DB hash)
    const isPasswordValid = await verifyPasswordWithFallback(
      password,
      user.password,
      normalizedEmail
    );

    if (!isPasswordValid) {
      throw new Error('Invalid email or password');
    }

    // 3. Check account status
    if (user.status === 'SUSPENDED') {
      const date = user.statusChangedAt ? new Date(user.statusChangedAt).toISOString() : '';
      const reason = user.statusReason || '';
      throw new Error(`ACCOUNT_SUSPENDED|${user.statusChangedBy || 'administrator'}|${date}|${reason}`);
    }
    if (user.status === 'BANNED') {
      const date = user.statusChangedAt ? new Date(user.statusChangedAt).toISOString() : '';
      const reason = user.statusReason || '';
      throw new Error(`ACCOUNT_BANNED|${user.statusChangedBy || 'administrator'}|${date}|${reason}`);
    }

    // 3. User Response
    const userResponse: UserResponse = {
      name: user.name,
      surname: user.surname,
      email: user.email,
      birth: user.birth instanceof Date ? user.birth.toISOString() : (user.birth || ''), // Handle String/Date/Null from JSON/DB
      avatarUrl: user.avatarUrl || undefined,
      uuid: user.id
    };

    return userResponse;
  }

  /**
   * Register new user
   */
  static async register(userData: RegisterInput): Promise<UserResponse> {
    // Normalize email for consistent lookups
    const normalizedEmail = userData.email.toLowerCase().trim();

    // 1. Check if user exists in DB
    const existing = await db.user.findUnique({ where: { email: normalizedEmail } });
    if (existing) {
      throw new Error('User with this email already exists');
    }

    // 2. Hash password
    const hashedPassword = await hashPassword(userData.password);

    // 3. Create in DB
    const birthDate = new Date(userData.birth);
    if (isNaN(birthDate.getTime())) {
      throw new Error('Invalid birth date');
    }

    const newUser = await db.user.create({
      data: {
        name: userData.name,
        surname: userData.surname,
        email: normalizedEmail,
        password: hashedPassword,
        birth: birthDate,
        gender: userData.gender,
        avatarUrl: '/images/avatars/default.png'
      }
    });

    return {
      name: newUser.name,
      surname: newUser.surname,
      email: newUser.email,
      birth: userData.birth,
      avatarUrl: newUser.avatarUrl || undefined,
      uuid: newUser.id
    };
  }

  /**
   * Set session cookie with signed JWT
   * Supports 'Remember Me' (30 days) vs Session (1 day)
   */
  static async createSessionCookie(
    user: UserResponse,
    userAgent?: string,
    ipAddress?: string,
    rememberMe: boolean = false
  ): Promise<Array<{
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
    // Session duration constants
    const SESSION_DEFAULT = 60 * 60 * 24 * 7;      // 7 days
    const SESSION_REMEMBER_ME = 60 * 60 * 24 * 30; // 30 days

    const maxAge = rememberMe ? SESSION_REMEMBER_ME : SESSION_DEFAULT;

    // Sign session with JWT
    const token = await signSession(
      {
        email: user.email,
        name: user.name,
        surname: user.surname,
        birth: user.birth,
        avatarUrl: user.avatarUrl,
        uuid: user.uuid,
      },
      maxAge
    );

    // Store session in Redis for tracking
    if (user.uuid) {
      createSession(user.uuid, user.email, userAgent, ipAddress).catch((error) => {
        Logger.error('AuthService', 'Failed to store session in Redis.', error);
      });
    }

    return [
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
      {
        name: 'has_session',
        value: '1',
        options: {
          httpOnly: false,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'strict',
          maxAge,
          path: '/',
        },
      },
    ];
  }

  /**
   * Force logout user from all devices
   * Deletes all sessions from Redis
   */
  static async logoutAllDevices(userId: string): Promise<number> {
    const deletedCount = await deleteAllUserSessions(userId);
    Logger.info('AuthService', `Force logout: ${deletedCount} sessions deleted for user ${userId}.`);
    return deletedCount;
  }
}
