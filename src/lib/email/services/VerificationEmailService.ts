import { BaseEmailService } from './BaseEmailService';
import { renderVerificationCodeEmail } from '../templates/VerificationCodeEmail';
import { SendEmailResult, VERIFICATION_CODE_EXPIRY_MINUTES } from '../types';
import { Logger } from '../../utils/logger';

export class VerificationEmailService extends BaseEmailService {
    /**
     * Send verification code email
     */
    static async sendVerificationCode(options: {
        email: string;
        code: string;
        firstName?: string;
    }): Promise<SendEmailResult> {
        const { email, code, firstName } = options;

        const html = renderVerificationCodeEmail({
            code,
            firstName: firstName || 'there',
            expiryMinutes: VERIFICATION_CODE_EXPIRY_MINUTES,
        });

        const result = await this.send({
            from: this.createDefaultSender('Fabiole | Verification Code'),
            to: { email },
            subject: `${code} is your Fabiole verification code`,
            html,
            text: `Your Fabiole verification code is: ${code}\n\nThis code expires in ${VERIFICATION_CODE_EXPIRY_MINUTES} minutes.\n\nIf you didn't request this code, you can safely ignore this email.`,
        });

        if (result.success) {
            Logger.success('Email', `Dispatch Successful: One-time verification code securely transmitted to ${email}.`);
        } else {
            Logger.error('Email', `Dispatch Failure: Could not transmit verification code to ${email}.`, result.error);
        }

        return result;
    }
}
