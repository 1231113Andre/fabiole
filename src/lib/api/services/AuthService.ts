import { RegisterInput } from '@/lib/api/validators/auth.validator';
import { db } from '@/lib/db/client';
import { comparePassword, hashPassword } from '@/lib/security/password';
import { signSession } from '@/lib/security/session';
import { randomUUID } from 'crypto';
import { Logger } from '@/lib/utils/logger';
import { verifyPasswordWithFallback } from '@/lib/auth/helpers';

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
   * Login user
   */
  static async login(email: string, password: string): Promise<UserResponse> {
    // Normalize email (lowercase + trim) for consistent lookups
    const normalizedEmail = email.toLowerCase().trim();
    
    // 1. Find user in Prisma
    const user = await db.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (!user) {
      throw new Error('Invalid email or password');
    }

    // 2. Verify password with fallback for legacy passwords
    const isPasswordValid = await verifyPasswordWithFallback(
      password,
      user.password,
      normalizedEmail
    );

    if (!isPasswordValid) {
      throw new Error('Invalid email or password');
    }

    // 3. User Response
    const userResponse: UserResponse = {
      name: user.name,
      surname: user.surname,
      email: user.email,
      birth: user.birth ? user.birth.toISOString() : '',
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
        avatarUrl: user.avatarUrl,
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
