// src/lib/email/ResendClient.ts
// Singleton Resend client with configuration

import { Resend } from 'resend';

class ResendClientSingleton {
    private static instance: Resend | null = null;

    static getInstance(): Resend {
        if (!ResendClientSingleton.instance) {
            const apiKey = process.env.RESEND_API_KEY;

            if (!apiKey) {
                throw new Error(
                    '[ResendClient] RESEND_API_KEY is not configured. ' +
                    'Please add it to your .env.local file.'
                );
            }

            ResendClientSingleton.instance = new Resend(apiKey);
            console.log('✅ [ResendClient] Initialized successfully');
        }

        return ResendClientSingleton.instance;
    }

    /**
     * Reset the client instance (useful for testing)
     */
    static resetInstance(): void {
        ResendClientSingleton.instance = null;
    }
}

/**
 * Get the Resend client instance
 */
export function getResendClient(): Resend {
    return ResendClientSingleton.getInstance();
}

/**
 * Email sender configuration
 */
export const EMAIL_CONFIG = {
    defaultFrom: {
        email: process.env.EMAIL_FROM_ADDRESS || 'noreply@no-reply.fabiole.com',
        name: process.env.EMAIL_FROM_NAME || 'Fabiole',
    },
    supportEmail: process.env.EMAIL_SUPPORT || 'support@fabiole.com',
} as const;
