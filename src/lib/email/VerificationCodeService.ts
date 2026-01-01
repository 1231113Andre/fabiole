// src/lib/email/VerificationCodeService.ts
// Service for generating, storing, and validating verification codes

import {
    VerificationCode,
    VerificationResult,
    VERIFICATION_CODE_EXPIRY_MINUTES,
    MAX_VERIFICATION_ATTEMPTS,
} from './types';
import { VerificationEmailService } from './services/VerificationEmailService';
import { Logger } from '../utils/logger';

/**
 * In-memory store for verification codes
 * Using globalThis to survive HMR (Hot Module Reload) in development
 */
declare global {
    // eslint-disable-next-line no-var
    var verificationCodesStore: Map<string, VerificationCode> | undefined;
}

const verificationCodes = globalThis.verificationCodesStore ?? new Map<string, VerificationCode>();
globalThis.verificationCodesStore = verificationCodes;

/**
 * Verification Code Service
 * Handles generation, storage, and validation of verification codes
 */
export class VerificationCodeService {
    /**
     * Generate a random 6-digit verification code
     */
    static generateCode(): string {
        return Math.floor(100000 + Math.random() * 900000).toString();
    }

    /**
     * Store a verification code for an email
     */
    static storeCode(email: string, code: string): VerificationCode {
        const normalizedEmail = email.toLowerCase().trim();

        const verificationCode: VerificationCode = {
            code,
            email: normalizedEmail,
            createdAt: new Date(),
            expiresAt: new Date(Date.now() + VERIFICATION_CODE_EXPIRY_MINUTES * 60 * 1000),
            attempts: 0,
        };

        verificationCodes.set(normalizedEmail, verificationCode);
        Logger.info('Security', `Authentication Tracking: One-time verification code generated and stored for identity: ${normalizedEmail}. Current active verification session count: ${verificationCodes.size}.`);

        return verificationCode;
    }

    /**
     * Get stored verification code for an email
     */
    static getCode(email: string): VerificationCode | undefined {
        const normalizedEmail = email.toLowerCase().trim();
        return verificationCodes.get(normalizedEmail);
    }

    /**
     * Verify a code submitted by the user
     */
    static verifyCode(email: string, submittedCode: string): VerificationResult {
        const normalizedEmail = email.toLowerCase().trim();
        const stored = verificationCodes.get(normalizedEmail);

        if (!stored) {
            Logger.warn('Security', `Verification Rejected: No active session found for identifier ${normalizedEmail}. Possible session timeout or manual clear.`);
            return { valid: false, error: 'NOT_FOUND' };
        }

        // Check if expired
        if (new Date() > stored.expiresAt) {
            Logger.warn('Security', `Verification Expired: Authentication token for ${normalizedEmail} has surpassed the validity window. Clearing session.`);
            verificationCodes.delete(normalizedEmail);
            return { valid: false, error: 'EXPIRED' };
        }

        // Check attempts
        if (stored.attempts >= MAX_VERIFICATION_ATTEMPTS) {
            Logger.warn('Security', `Brute-force Prevention: Maximum verification attempts reached for ${normalizedEmail}. Restricting access and purging session.`);
            verificationCodes.delete(normalizedEmail);
            return { valid: false, error: 'TOO_MANY_ATTEMPTS' };
        }

        // Increment attempts
        stored.attempts++;

        // Check code
        if (stored.code !== submittedCode) {
            Logger.warn('Security', `Verification Failure: Invalid code submitted for ${normalizedEmail}. Attempt ${stored.attempts} of ${MAX_VERIFICATION_ATTEMPTS}.`);
            return { valid: false, error: 'INVALID' };
        }

        // Success! Remove the code
        verificationCodes.delete(normalizedEmail);
        Logger.success('Security', `Authentication Success: Multi-factor verification completed for identity: ${normalizedEmail}.`);

        return { valid: true };
    }

    /**
     * Send a verification code to an email address
     * Generates code, stores it, and sends email
     */
    static async sendVerificationCode(
        email: string,
        firstName?: string
    ): Promise<{ success: boolean; error?: string }> {
        try {
            const normalizedEmail = email.toLowerCase().trim();

            // Check if there's an existing unexpired code
            const existing = verificationCodes.get(normalizedEmail);
            if (existing && new Date() < existing.expiresAt) {
                // Rate limit: don't send another code if one was sent recently (within 1 minute)
                const oneMinuteAgo = new Date(Date.now() - 60 * 1000);
                if (existing.createdAt > oneMinuteAgo) {
                    Logger.warn('Security', `Rate Limiting: Suppressing redundant verification request for ${normalizedEmail} to prevent spam/abuse.`);
                    return {
                        success: false,
                        error: 'Please wait before requesting another code',
                    };
                }
            }

            // Generate and store new code
            const code = this.generateCode();
            this.storeCode(normalizedEmail, code);

            // Send email
            const result = await VerificationEmailService.sendVerificationCode({
                email: normalizedEmail,
                code,
                firstName,
            });

            if (!result.success) {
                // Remove stored code if email failed
                verificationCodes.delete(normalizedEmail);
                return { success: false, error: result.error };
            }

            return { success: true };
        } catch (error) {
            Logger.error('Security', 'Dispatch Failure: Critical exception encountered during the verification code issuance workflow.', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to send verification code',
            };
        }
    }

    /**
     * Clear all stored codes (useful for testing)
     */
    static clearAllCodes(): void {
        verificationCodes.clear();
        Logger.info('Security', 'Maintenance Action: All active verification sessions have been manually purged from memory.');
    }

    /**
     * Get stats about stored codes (for debugging)
     */
    static getStats(): { total: number; expired: number } {
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
}
