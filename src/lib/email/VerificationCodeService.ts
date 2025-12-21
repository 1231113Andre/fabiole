// src/lib/email/VerificationCodeService.ts
// Service for generating, storing, and validating verification codes

import {
    VerificationCode,
    VerificationResult,
    VERIFICATION_CODE_EXPIRY_MINUTES,
    MAX_VERIFICATION_ATTEMPTS,
} from './types';
import { EmailService } from './EmailService';

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
        console.log(`✅ [VerificationCodeService] Code stored for: ${normalizedEmail} (total codes in store: ${verificationCodes.size})`);

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
            console.log(`❌ [VerificationCodeService] No code found for: ${normalizedEmail}`);
            return { valid: false, error: 'NOT_FOUND' };
        }

        // Check if expired
        if (new Date() > stored.expiresAt) {
            console.log(`❌ [VerificationCodeService] Code expired for: ${normalizedEmail}`);
            verificationCodes.delete(normalizedEmail);
            return { valid: false, error: 'EXPIRED' };
        }

        // Check attempts
        if (stored.attempts >= MAX_VERIFICATION_ATTEMPTS) {
            console.log(`❌ [VerificationCodeService] Too many attempts for: ${normalizedEmail}`);
            verificationCodes.delete(normalizedEmail);
            return { valid: false, error: 'TOO_MANY_ATTEMPTS' };
        }

        // Increment attempts
        stored.attempts++;

        // Check code
        if (stored.code !== submittedCode) {
            console.log(`❌ [VerificationCodeService] Invalid code for: ${normalizedEmail} (attempt ${stored.attempts})`);
            return { valid: false, error: 'INVALID' };
        }

        // Success! Remove the code
        verificationCodes.delete(normalizedEmail);
        console.log(`✅ [VerificationCodeService] Code verified for: ${normalizedEmail}`);

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
                    console.log(`⚠️ [VerificationCodeService] Rate limited for: ${normalizedEmail}`);
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
            const result = await EmailService.sendVerificationCode({
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
            console.error('❌ [VerificationCodeService] Error:', error);
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
        console.log('🧹 [VerificationCodeService] All codes cleared');
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
