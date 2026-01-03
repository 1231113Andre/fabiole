import { BaseEmailService } from './BaseEmailService';
import { renderVerificationCodeEmail } from '../templates/VerificationCodeEmail';
import { SendEmailResult, VERIFICATION_CODE_EXPIRY_MINUTES } from '../types';
import { Logger } from '../../utils/logger';

export type VerificationPurpose = 'registration' | 'password-reset' | 'email-change';

export class VerificationEmailService extends BaseEmailService {
    /**
     * Send verification code email
     */
    static async sendVerificationCode(options: {
        email: string;
        code: string;
        firstName?: string;
        purpose?: VerificationPurpose;
    }): Promise<SendEmailResult> {
        const { email, code, firstName, purpose = 'registration' } = options;

        // Different subject and text based on purpose
        const subjects: Record<VerificationPurpose, string> = {
            'registration': `${code} is your Fabiole verification code`,
            'password-reset': `${code} - Reset your Fabiole password`,
            'email-change': `${code} - Confirm your new email`,
        };

        const html = renderVerificationCodeEmail({
            code,
            firstName: firstName || 'there',
            expiryMinutes: VERIFICATION_CODE_EXPIRY_MINUTES,
            purpose,
        });

        const textMessages: Record<VerificationPurpose, string> = {
            'registration': `Your Fabiole verification code is: ${code}\n\nThis code expires in ${VERIFICATION_CODE_EXPIRY_MINUTES} minutes.\n\nIf you didn't request this code, you can safely ignore this email.`,
            'password-reset': `Your password reset code is: ${code}\n\nUse this code to reset your password.\n\nThis code expires in ${VERIFICATION_CODE_EXPIRY_MINUTES} minutes.\n\nIf you didn't request a password reset, you can safely ignore this email.`,
            'email-change': `Your email change verification code is: ${code}\n\nThis code expires in ${VERIFICATION_CODE_EXPIRY_MINUTES} minutes.\n\nIf you didn't request this change, you can safely ignore this email.`,
        };

        const result = await this.send({
            from: this.createDefaultSender('Fabiole | Verification Code'),
            to: { email },
            subject: subjects[purpose],
            html,
            text: textMessages[purpose],
        });

        if (result.success) {
            Logger.success('Email', `Dispatch Successful: ${purpose} verification code securely transmitted to ${email}.`);
        } else {
            Logger.error('Email', `Dispatch Failure: Could not transmit ${purpose} verification code to ${email}.`, result.error);
        }

        return result;
    }
}
