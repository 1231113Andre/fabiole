// src/lib/email/EmailService.ts
// Main email service - handles sending emails via Resend

import { getResendClient, EMAIL_CONFIG } from './ResendClient';
import { renderVerificationCodeEmail } from './templates/VerificationCodeEmail';
import {
  SendEmailOptions,
  SendEmailResult,
  VERIFICATION_CODE_EXPIRY_MINUTES,
} from './types';

/**
 * Email Service
 * Handles all email sending operations
 */
export class EmailService {
  /**
   * Send a generic email
   */
  static async send(options: SendEmailOptions): Promise<SendEmailResult> {
    try {
      const resend = getResendClient();

      const fromAddress = options.from
        ? `${options.from.name || ''} <${options.from.email}>`.trim()
        : `${EMAIL_CONFIG.defaultFrom.name} <${EMAIL_CONFIG.defaultFrom.email}>`;

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
        console.error('❌ [EmailService] Resend error:', result.error);
        return {
          success: false,
          error: result.error.message || 'Failed to send email',
        };
      }

      console.log(`✅ [EmailService] Email sent successfully. ID: ${result.data?.id}`);
      return {
        success: true,
        messageId: result.data?.id,
      };
    } catch (error) {
      console.error('❌ [EmailService] Error sending email:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to send email',
      };
    }
  }

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
      to: { email },
      subject: `${code} is your Fabiole verification code`,
      html,
      text: `Your Fabiole verification code is: ${code}\n\nThis code expires in ${VERIFICATION_CODE_EXPIRY_MINUTES} minutes.\n\nIf you didn't request this code, you can safely ignore this email.`,
    });

    if (result.success) {
      console.log(`✅ [EmailService] Verification code sent to: ${email}`);
    } else {
      console.error(`❌ [EmailService] Failed to send verification code to: ${email}`);
    }

    return result;
  }

  /**
   * Send welcome email after successful registration
   */
  static async sendWelcomeEmail(options: {
    email: string;
    firstName: string;
  }): Promise<SendEmailResult> {
    const { email, firstName } = options;

    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif; background-color: #0a0a0a; color: #ffffff;">
  <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
    <tr>
      <td style="background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); border-radius: 16px; padding: 40px;">
        <div style="text-align: center; margin-bottom: 32px;">
          <h1 style="margin: 0; font-size: 32px; font-weight: 700; color: #667eea;">
            Fabiole
          </h1>
        </div>
        <div style="background: rgba(255, 255, 255, 0.05); border-radius: 12px; padding: 32px; border: 1px solid rgba(255, 255, 255, 0.1);">
          <h2 style="margin: 0 0 16px 0; font-size: 24px; font-weight: 600; text-align: center; color: #ffffff;">
            Welcome to Fabiole! 🎉
          </h2>
          <p style="margin: 0 0 16px 0; font-size: 16px; color: #e0e0e0; text-align: center;">
            Hey ${firstName}!
          </p>
          <p style="margin: 0 0 24px 0; font-size: 14px; color: #a0a0a0; text-align: center;">
            Your account has been created successfully. You're now ready to start your fitness journey with personalized coaching.
          </p>
          <div style="text-align: center;">
            <a href="https://fabiole.com/" style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 16px;">
              Go to Dashboard
            </a>
          </div>
        </div>
        <div style="margin-top: 32px; text-align: center;">
          <p style="margin: 0; font-size: 12px; color: #6b7280;">
            © 2024 Fabiole. All rights reserved.
          </p>
        </div>
      </td>
    </tr>
  </table>
</body>
</html>
    `.trim();

    return this.send({
      to: { email },
      subject: `Welcome to Fabiole, ${firstName}! 🎉`,
      html,
      text: `Welcome to Fabiole, ${firstName}!\n\nYour account has been created successfully. You're now ready to start your fitness journey with personalized coaching.\n\nVisit your dashboard: https://fabiole.pt/dashboard`,
    });
  }

  /**
   * Send email when an account is manually created by admin
   */
  static async sendManualAccountCreatedEmail(options: {
    email: string;
    password: string;
    firstName: string;
    role?: string;
  }): Promise<SendEmailResult> {
    const { email, password, firstName, role = 'USER' } = options;

    const isAdmin = role === 'ADMINISTRATOR';

    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif; background-color: #0a0a0a; color: #ffffff;">
  <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
    <tr>
      <td style="background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); border-radius: 16px; padding: 40px;">
        <div style="text-align: center; margin-bottom: 32px;">
          <h1 style="margin: 0; font-size: 32px; font-weight: 700; color: #667eea;">
            Fabiole
          </h1>
        </div>
        <div style="background: rgba(255, 255, 255, 0.05); border-radius: 12px; padding: 32px; border: 1px solid rgba(255, 255, 255, 0.1);">
          <h2 style="margin: 0 0 16px 0; font-size: 24px; font-weight: 600; text-align: center; color: #ffffff;">
            Conta Criada com Sucesso! 🎉
          </h2>
          <p style="margin: 0 0 16px 0; font-size: 16px; color: #e0e0e0; text-align: center;">
            Olá ${firstName}!
          </p>
          <p style="margin: 0 0 24px 0; font-size: 14px; color: #a0a0a0; text-align: center; line-height: 1.6;">
            A sua conta foi criada manualmente pela administração (fabiole@fabiole.com).<br>
            ${isAdmin ? '<br><strong style="color: #ef4444;">ESTA É UMA CONTA DE ADMINISTRADOR.</strong><br>Você tem acesso total à gestão de utilizadores e configurações do sistema.<br>' : ''}
            Abaixo estão as suas credenciais de acesso:
          </p>
          
          <div style="background: rgba(0, 0, 0, 0.2); border-radius: 8px; padding: 20px; margin-bottom: 24px; text-align: left;">
            <p style="margin: 0 0 8px 0; font-size: 14px; color: #a0a0a0;">
              <strong>Email:</strong> <span style="color: #ffffff;">${email}</span>
            </p>
            <p style="margin: 0; font-size: 14px; color: #a0a0a0;">
              <strong>Password:</strong> <span style="color: #ffffff; font-family: monospace; background: rgba(255,255,255,0.1); padding: 2px 6px; border-radius: 4px;">${password}</span>
            </p>
          </div>

          <p style="margin: 0 0 24px 0; font-size: 13px; color: #fbbf24; text-align: center; background: rgba(251, 191, 36, 0.1); padding: 12px; border-radius: 8px; border: 1px solid rgba(251, 191, 36, 0.2);">
            ⚠️ <strong>Importante:</strong> Por favor, altere a sua password no primeiro acesso através da aba "Definições".
          </p>

          <div style="text-align: center;">
            <a href="https://fabiole.com/" style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 16px;">
              Aceder à Plataforma
            </a>
          </div>
        </div>
        <div style="margin-top: 32px; text-align: center;">
          <p style="margin: 0; font-size: 12px; color: #6b7280;">
            © ${new Date().getFullYear()} Fabiole. Todos os direitos reservados.
          </p>
        </div>
      </td>
    </tr>
  </table>
</body>
</html>
    `.trim();

    return this.send({
      to: { email },
      subject: `Bem-vindo(a) à Fabiole - As suas credenciais de acesso`,
      html,
      text: `Bem-vindo(a) à Fabiole, ${firstName}!\n\nA sua conta foi criada manualmente pela administração.\n\nCredenciais:\nEmail: ${email}\nPassword: ${password}\n\nImportante: Por favor, altere a sua password no primeiro acesso na aba "Definições".\n\nAceda em: https://fabiole.com/`,
    });
  }
}
