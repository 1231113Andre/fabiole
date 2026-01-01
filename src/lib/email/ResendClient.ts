import { Resend } from 'resend';
import { Logger } from '../utils/logger';

class ResendClientSingleton {
    private static instance: Resend | null = null;

    static getInstance(): Resend {
        if (!ResendClientSingleton.instance) {
            const apiKey = process.env.RESEND_API_KEY;

            if (!apiKey) {
                Logger.error('Email', 'Initialization Failure: RESEND_API_KEY is missing from environment configuration. Dispatch services are disabled.');
                throw new Error(
                    '[ResendClient] RESEND_API_KEY is not configured. ' +
                    'Please add it to your .env.local file.'
                );
            }

            ResendClientSingleton.instance = new Resend(apiKey);
            Logger.success('Email', 'Subsystem Initialized: Resend API client is provisioned and ready for outbound message dispatch.');
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
