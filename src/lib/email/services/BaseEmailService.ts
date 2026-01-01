import { getResendClient, EMAIL_CONFIG } from '../ResendClient';
import { SendEmailOptions, SendEmailResult } from '../types';

/**
 * Base Email Service
 * Handles core email sending operations via Resend
 */
export class BaseEmailService {
    /**
     * Send a generic email
     */
    static async send(options: SendEmailOptions): Promise<SendEmailResult> {
        try {
            const resend = getResendClient();

            // Handle 'from' field primarily as an object to match the corrected interface
            let fromAddress = `${EMAIL_CONFIG.defaultFrom.name} <${EMAIL_CONFIG.defaultFrom.email}>`;

            if (options.from) {
                if (typeof options.from === 'string') {
                    // Fallback if string is passed (though types say object now)
                    fromAddress = options.from;
                } else if (options.from.email) {
                    fromAddress = `${options.from.name || ''} <${options.from.email}>`.trim();
                }
            }

            const toAddresses = Array.isArray(options.to)
                ? options.to.map((r) => r.email)
                : [options.to.email];

            const emailOptions: {
                from: string;
                to: string[];
                subject: string;
                html?: string;
                text?: string;
                replyTo?: string;
            } = {
                from: fromAddress,
                to: toAddresses,
                subject: options.subject,
            };

            if (options.html) emailOptions.html = options.html;
            if (options.text) emailOptions.text = options.text;
            if (options.replyTo?.email) emailOptions.replyTo = options.replyTo.email;

            const result = await resend.emails.send(emailOptions as Parameters<typeof resend.emails.send>[0]);

            if (result.error) {
                console.error('❌ [BaseEmailService] Resend error:', result.error);
                return {
                    success: false,
                    error: result.error.message || 'Failed to send email',
                };
            }

            console.log(`✅ [BaseEmailService] Email sent successfully. ID: ${result.data?.id}`);
            return {
                success: true,
                messageId: result.data?.id,
            };
        } catch (error) {
            console.error('❌ [BaseEmailService] Error sending email:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to send email',
            };
        }
    }

    /**
     * Helper to create a sender object with the default email but custom name
     */
    protected static createDefaultSender(name: string) {
        return {
            name,
            email: EMAIL_CONFIG.defaultFrom.email
        };
    }
}
