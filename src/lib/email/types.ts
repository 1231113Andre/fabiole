// src/lib/email/types.ts
// Email service type definitions

export interface EmailRecipient {
    email: string;
    name?: string;
}

export interface SendEmailOptions {
    to: EmailRecipient | EmailRecipient[];
    subject: string;
    html?: string;
    react?: React.ReactElement;
    text?: string;
    from?: EmailRecipient;
    replyTo?: EmailRecipient;
}

export interface SendEmailResult {
    success: boolean;
    messageId?: string;
    error?: string;
}

export interface VerificationCode {
    code: string;
    email: string;
    expiresAt: Date;
    createdAt: Date;
    attempts: number;
}

export interface VerificationResult {
    valid: boolean;
    error?: 'EXPIRED' | 'INVALID' | 'NOT_FOUND' | 'TOO_MANY_ATTEMPTS';
}

export interface SendVerificationEmailOptions {
    email: string;
    firstName?: string;
    language?: 'pl' | 'en' | 'pt';
}

export const VERIFICATION_CODE_EXPIRY_MINUTES = 10;
export const MAX_VERIFICATION_ATTEMPTS = 5;
