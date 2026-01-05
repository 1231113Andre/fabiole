// src/lib/email/VerificationCodeService.ts
// Service for generating, storing, and validating verification codes
// Uses Redis for persistence and multi-instance support

import { randomInt } from 'crypto';
import {
    VerificationCode,
    VerificationResult,
    VERIFICATION_CODE_EXPIRY_MINUTES,
    MAX_VERIFICATION_ATTEMPTS,
} from './types';
import { VerificationEmailService } from './services/VerificationEmailService';
import { Logger } from '../utils/logger';
import { getRedisClient, isRedisEnabled } from '../cache/redis';
import { scanKeys } from '../cache/redisCache';
import type Redis from 'ioredis';

const VERIFICATION_CODE_PREFIX = 'fabiole:verification:';
const VERIFICATION_TTL_SECONDS = VERIFICATION_CODE_EXPIRY_MINUTES * 60;

/**
 * In-memory fallback store for verification codes (when Redis unavailable)
 */
declare global {
    // eslint-disable-next-line no-var
    var verificationCodesStore: Map<string, VerificationCode> | undefined;
}

const verificationCodes = globalThis.verificationCodesStore ?? new Map<string, VerificationCode>();
globalThis.verificationCodesStore = verificationCodes;

/**
 * Get Redis client if available and ready
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
 * Verification Code Service
 * Handles generation, storage, and validation of verification codes
 * Uses Redis for persistence with in-memory fallback
 */
export class VerificationCodeService {
    /**
     * Generate a cryptographically secure random 6-digit verification code
     */
    static generateCode(): string {
        return randomInt(100000, 1000000).toString();
    }

    /**
     * Store a verification code for an email
     */
    static async storeCode(email: string, code: string): Promise<VerificationCode> {
        const normalizedEmail = email.toLowerCase().trim();

        const verificationCode: VerificationCode = {
            code,
            email: normalizedEmail,
            createdAt: new Date(),
            expiresAt: new Date(Date.now() + VERIFICATION_CODE_EXPIRY_MINUTES * 60 * 1000),
            attempts: 0,
        };

        const redis = getReadyRedis();

        if (redis) {
            try {
                await redis.set(
                    `${VERIFICATION_CODE_PREFIX}${normalizedEmail}`,
                    JSON.stringify({
                        code: verificationCode.code,
                        email: verificationCode.email,
                        createdAt: verificationCode.createdAt.toISOString(),
                        expiresAt: verificationCode.expiresAt.toISOString(),
                        attempts: verificationCode.attempts,
                    }),
                    'EX',
                    VERIFICATION_TTL_SECONDS
                );
                Logger.info('Security', `Verification code stored in Redis for: ${normalizedEmail}.`);
            } catch (error) {
                Logger.error('Security', 'Failed to store verification code in Redis, using memory.', error);
                verificationCodes.set(normalizedEmail, verificationCode);
            }
        } else {
            verificationCodes.set(normalizedEmail, verificationCode);
            Logger.info('Security', `Verification code stored in memory for: ${normalizedEmail}. Sessions: ${verificationCodes.size}.`);
        }

        return verificationCode;
    }

    /**
     * Get stored verification code for an email
     */
    static async getCode(email: string): Promise<VerificationCode | undefined> {
        const normalizedEmail = email.toLowerCase().trim();
        const redis = getReadyRedis();

        if (redis) {
            try {
                const data = await redis.get(`${VERIFICATION_CODE_PREFIX}${normalizedEmail}`);
                if (!data) return undefined;

                const parsed = JSON.parse(data);
                return {
                    code: parsed.code,
                    email: parsed.email,
                    createdAt: new Date(parsed.createdAt),
                    expiresAt: new Date(parsed.expiresAt),
                    attempts: parsed.attempts,
                };
            } catch (error) {
                Logger.error('Security', 'Failed to get verification code from Redis.', error);
            }
        }

        // Fallback to memory
        const stored = verificationCodes.get(normalizedEmail);

        // Lazy cleanup: remove expired code if found
        if (stored && new Date() > stored.expiresAt) {
            verificationCodes.delete(normalizedEmail);
            return undefined;
        }

        return stored;
    }

    /**
     * Update attempts count for a verification code
     */
    static async updateAttempts(email: string, attempts: number): Promise<void> {
        const normalizedEmail = email.toLowerCase().trim();
        const redis = getReadyRedis();

        if (redis) {
            try {
                const data = await redis.get(`${VERIFICATION_CODE_PREFIX}${normalizedEmail}`);
                if (data) {
                    const parsed = JSON.parse(data);
                    parsed.attempts = attempts;

                    // Get remaining TTL
                    const ttl = await redis.ttl(`${VERIFICATION_CODE_PREFIX}${normalizedEmail}`);

                    await redis.set(
                        `${VERIFICATION_CODE_PREFIX}${normalizedEmail}`,
                        JSON.stringify(parsed),
                        'EX',
                        ttl > 0 ? ttl : VERIFICATION_TTL_SECONDS
                    );
                }
            } catch (error) {
                Logger.error('Security', 'Failed to update verification attempts in Redis.', error);
            }
        } else {
            const stored = verificationCodes.get(normalizedEmail);
            if (stored) {
                stored.attempts = attempts;
            }
        }
    }

    /**
     * Delete a verification code for an email
     */
    static async deleteCode(email: string): Promise<boolean> {
        const normalizedEmail = email.toLowerCase().trim();
        const redis = getReadyRedis();

        if (redis) {
            try {
                const deleted = await redis.del(`${VERIFICATION_CODE_PREFIX}${normalizedEmail}`);
                return deleted > 0;
            } catch (error) {
                Logger.error('Security', 'Failed to delete verification code from Redis.', error);
            }
        }

        return verificationCodes.delete(normalizedEmail);
    }

    /**
     * Verify a code submitted by the user
     */
    static async verifyCode(email: string, submittedCode: string): Promise<VerificationResult> {
        const normalizedEmail = email.toLowerCase().trim();
        const stored = await this.getCode(normalizedEmail);

        if (!stored) {
            Logger.warn('Security', `Verification Rejected: No active session found for ${normalizedEmail}.`);
            return { valid: false, error: 'NOT_FOUND' };
        }

        // Check if expired
        if (new Date() > stored.expiresAt) {
            Logger.warn('Security', `Verification Expired: Token for ${normalizedEmail} has expired.`);
            await this.deleteCode(normalizedEmail);
            return { valid: false, error: 'EXPIRED' };
        }

        // Check attempts
        if (stored.attempts >= MAX_VERIFICATION_ATTEMPTS) {
            Logger.warn('Security', `Brute-force Prevention: Max attempts reached for ${normalizedEmail}.`);
            await this.deleteCode(normalizedEmail);
            return { valid: false, error: 'TOO_MANY_ATTEMPTS' };
        }

        // Increment attempts
        const newAttempts = stored.attempts + 1;
        await this.updateAttempts(normalizedEmail, newAttempts);

        // Check code
        if (stored.code !== submittedCode) {
            Logger.warn('Security', `Verification Failure: Invalid code for ${normalizedEmail}. Attempt ${newAttempts}/${MAX_VERIFICATION_ATTEMPTS}.`);
            return { valid: false, error: 'INVALID' };
        }

        // Success! Remove the code
        await this.deleteCode(normalizedEmail);
        Logger.success('Security', `Verification Success: Code verified for ${normalizedEmail}.`);

        return { valid: true };
    }

    /**
     * Send a verification code to an email address
     */
    static async sendVerificationCode(
        email: string,
        firstName?: string,
        purpose: 'registration' | 'password-reset' | 'email-change' = 'registration'
    ): Promise<{ success: boolean; error?: string }> {
        try {
            const normalizedEmail = email.toLowerCase().trim();

            // Check if there's an existing unexpired code
            const existing = await this.getCode(normalizedEmail);
            if (existing && new Date() < existing.expiresAt) {
                // Rate limit: don't send another code if one was sent recently (within 1 minute)
                const oneMinuteAgo = new Date(Date.now() - 60 * 1000);
                if (existing.createdAt > oneMinuteAgo) {
                    Logger.warn('Security', `Rate Limiting: Suppressing request for ${normalizedEmail}.`);
                    return {
                        success: false,
                        error: 'Por favor, aguarda antes de solicitar outro código.',
                    };
                }
            }

            // Generate and store new code
            const code = this.generateCode();
            await this.storeCode(normalizedEmail, code);

            // Send email
            const result = await VerificationEmailService.sendVerificationCode({
                email: normalizedEmail,
                code,
                firstName,
                purpose,
            });

            if (!result.success) {
                // Remove stored code if email failed
                await this.deleteCode(normalizedEmail);
                return { success: false, error: result.error };
            }

            return { success: true };
        } catch (error) {
            Logger.error('Security', 'Failed to send verification code.', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to send verification code',
            };
        }
    }

    /**
     * Clear all stored codes (useful for testing)
     * Uses SCAN instead of KEYS to avoid blocking Redis
     */
    static async clearAllCodes(): Promise<void> {
        const redis = getReadyRedis();

        if (redis) {
            try {
                // Use SCAN instead of KEYS to avoid blocking Redis
                const keys = await scanKeys(redis, `${VERIFICATION_CODE_PREFIX}*`);
                if (keys.length > 0) {
                    // Delete in batches to avoid too many arguments
                    const batchSize = 100;
                    for (let i = 0; i < keys.length; i += batchSize) {
                        const batch = keys.slice(i, i + batchSize);
                        await redis.del(...batch);
                    }
                }
            } catch (error) {
                Logger.error('Security', 'Failed to clear verification codes from Redis.', error);
            }
        }

        verificationCodes.clear();
        Logger.info('Security', 'All verification sessions purged.');
    }

    /**
     * Get stats about stored codes (for debugging)
     * Uses SCAN instead of KEYS to avoid blocking Redis
     */
    static async getStats(): Promise<{ total: number; expired: number }> {
        const redis = getReadyRedis();

        if (redis) {
            try {
                // Use SCAN instead of KEYS to avoid blocking Redis
                const keys = await scanKeys(redis, `${VERIFICATION_CODE_PREFIX}*`);
                return { total: keys.length, expired: 0 }; // Redis auto-expires
            } catch (error) {
                Logger.error('Security', 'Failed to get verification stats from Redis.', error);
            }
        }

        const now = new Date();
        let expired = 0;

        verificationCodes.forEach((code) => {
            if (now > code.expiresAt) expired++;
        });

        return {
            total: verificationCodes.size,
            expired,
        };
    }

    /**
     * Clean up expired codes (only needed for in-memory fallback)
     */
    static cleanupExpiredCodes(): number {
        // Redis handles TTL automatically, this is only for memory fallback
        const now = new Date();
        let cleaned = 0;

        verificationCodes.forEach((code, email) => {
            if (now > code.expiresAt) {
                verificationCodes.delete(email);
                cleaned++;
            }
        });

        if (cleaned > 0) {
            Logger.info('Security', `Cleanup: Removed ${cleaned} expired code(s). Active: ${verificationCodes.size}.`);
        }

        return cleaned;
    }
}

// Auto-cleanup for in-memory fallback
let cleanupInterval: NodeJS.Timeout | null = null;
function startAutoCleanup() {
    if (cleanupInterval) return;

    cleanupInterval = setInterval(() => {
        VerificationCodeService.cleanupExpiredCodes();
    }, 5 * 60 * 1000);
}

if (typeof setInterval !== 'undefined') {
    startAutoCleanup();
}
