/**
 * @fileoverview Redis Session Store
 * @description Stores and manages user login sessions in Redis
 *              Enables: force logout, session listing, multi-device support
 */

import { getRedisClient, isRedisEnabled } from '@/lib/cache/redis';
import { Logger } from '@/lib/utils/logger';
import type Redis from 'ioredis';

const SESSION_STORE_PREFIX = 'fabiole:sessions:';
const USER_SESSIONS_PREFIX = 'fabiole:user_sessions:';

// Session TTL - 7 days (matches JWT expiry)
const SESSION_TTL_SECONDS = 7 * 24 * 60 * 60;

export interface StoredSession {
    sessionId: string;
    userId: string;
    email: string;
    createdAt: number;
    lastAccessedAt: number;
    expiresAt: number;
    userAgent?: string;
    ipAddress?: string;
}

/**
 * Get a ready Redis client or null
 */
function getReadyRedis(): Redis | null {
    if (!isRedisEnabled()) {
        return null;
    }

    const redis = getRedisClient();
    if (!redis || redis.status !== 'ready') {
        return null;
    }

    return redis;
}

/**
 * Generate a unique session ID
 */
function generateSessionId(): string {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 15);
    return `${timestamp}-${random}`;
}

/**
 * Create and store a new session
 * @param userId - User UUID
 * @param email - User email
 * @param userAgent - Browser user agent
 * @param ipAddress - Client IP address
 * @returns Session ID or null if Redis unavailable
 */
export async function createSession(
    userId: string,
    email: string,
    userAgent?: string,
    ipAddress?: string
): Promise<string | null> {
    const redis = getReadyRedis();

    if (!redis) {
        Logger.warn('SessionStore', 'Redis unavailable, session not stored.');
        return null;
    }

    try {
        const sessionId = generateSessionId();
        const now = Date.now();

        const session: StoredSession = {
            sessionId,
            userId,
            email,
            createdAt: now,
            lastAccessedAt: now,
            expiresAt: now + (SESSION_TTL_SECONDS * 1000),
            userAgent,
            ipAddress,
        };

        // Store session data
        await redis.set(
            `${SESSION_STORE_PREFIX}${sessionId}`,
            JSON.stringify(session),
            'EX',
            SESSION_TTL_SECONDS
        );

        // Add session to user's session list (for listing all sessions)
        await redis.sadd(`${USER_SESSIONS_PREFIX}${userId}`, sessionId);
        await redis.expire(`${USER_SESSIONS_PREFIX}${userId}`, SESSION_TTL_SECONDS);

        Logger.success('SessionStore', `Session created for user ${email}.`);
        return sessionId;
    } catch (error) {
        Logger.error('SessionStore', 'Failed to create session.', error);
        return null;
    }
}

/**
 * Get session by ID
 */
export async function getSession(sessionId: string): Promise<StoredSession | null> {
    const redis = getReadyRedis();

    if (!redis) {
        return null;
    }

    try {
        const data = await redis.get(`${SESSION_STORE_PREFIX}${sessionId}`);
        if (!data) return null;

        return JSON.parse(data) as StoredSession;
    } catch (error) {
        Logger.error('SessionStore', 'Failed to get session.', error);
        return null;
    }
}

/**
 * Update session's last accessed time
 */
export async function touchSession(sessionId: string): Promise<void> {
    const redis = getReadyRedis();

    if (!redis) return;

    try {
        const session = await getSession(sessionId);
        if (!session) return;

        session.lastAccessedAt = Date.now();

        await redis.set(
            `${SESSION_STORE_PREFIX}${sessionId}`,
            JSON.stringify(session),
            'EX',
            SESSION_TTL_SECONDS
        );
    } catch (error) {
        Logger.error('SessionStore', 'Failed to touch session.', error);
    }
}

/**
 * Delete a specific session (logout)
 */
export async function deleteSession(sessionId: string): Promise<void> {
    const redis = getReadyRedis();

    if (!redis) return;

    try {
        const session = await getSession(sessionId);

        await redis.del(`${SESSION_STORE_PREFIX}${sessionId}`);

        if (session) {
            await redis.srem(`${USER_SESSIONS_PREFIX}${session.userId}`, sessionId);
            Logger.info('SessionStore', `Session deleted for user ${session.email}.`);
        }
    } catch (error) {
        Logger.error('SessionStore', 'Failed to delete session.', error);
    }
}

/**
 * Get all active sessions for a user
 */
export async function getUserSessions(userId: string): Promise<StoredSession[]> {
    const redis = getReadyRedis();

    if (!redis) {
        return [];
    }

    try {
        const sessionIds = await redis.smembers(`${USER_SESSIONS_PREFIX}${userId}`);
        const sessions: StoredSession[] = [];

        for (const sessionId of sessionIds) {
            const session = await getSession(sessionId);
            if (session) {
                sessions.push(session);
            } else {
                // Clean up expired session from set
                await redis.srem(`${USER_SESSIONS_PREFIX}${userId}`, sessionId);
            }
        }

        return sessions.sort((a, b) => b.lastAccessedAt - a.lastAccessedAt);
    } catch (error) {
        Logger.error('SessionStore', 'Failed to get user sessions.', error);
        return [];
    }
}

/**
 * Delete all sessions for a user (force logout from all devices)
 */
export async function deleteAllUserSessions(userId: string): Promise<number> {
    const redis = getReadyRedis();

    if (!redis) {
        return 0;
    }

    try {
        const sessionIds = await redis.smembers(`${USER_SESSIONS_PREFIX}${userId}`);

        if (sessionIds.length === 0) {
            return 0;
        }

        // Delete all session data
        const sessionKeys = sessionIds.map(id => `${SESSION_STORE_PREFIX}${id}`);
        await redis.del(...sessionKeys);

        // Delete user's session set
        await redis.del(`${USER_SESSIONS_PREFIX}${userId}`);

        Logger.warn('SessionStore', `Force logout: ${sessionIds.length} sessions deleted for user ${userId}.`);
        return sessionIds.length;
    } catch (error) {
        Logger.error('SessionStore', 'Failed to delete all user sessions.', error);
        return 0;
    }
}

/**
 * Check if session is valid (exists and not expired)
 */
export async function isSessionValid(sessionId: string): Promise<boolean> {
    const session = await getSession(sessionId);

    if (!session) {
        return false;
    }

    if (session.expiresAt < Date.now()) {
        // Session expired, clean up
        await deleteSession(sessionId);
        return false;
    }

    return true;
}

/**
 * Get active session count for a user
 */
export async function getUserSessionCount(userId: string): Promise<number> {
    const redis = getReadyRedis();

    if (!redis) {
        return 0;
    }

    try {
        return await redis.scard(`${USER_SESSIONS_PREFIX}${userId}`);
    } catch (error) {
        Logger.error('SessionStore', 'Failed to get session count.', error);
        return 0;
    }
}
