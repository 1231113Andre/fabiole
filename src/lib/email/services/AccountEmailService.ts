import { BaseEmailService } from './BaseEmailService';
import { renderWelcomeEmail } from '../templates/WelcomeEmail';
import { renderManualAccountEmail } from '../templates/ManualAccountEmail';
import { renderAccountStatusChangeEmail } from '../templates/AccountStatusChangeEmail';
import { SendEmailResult } from '../types';

export class AccountEmailService extends BaseEmailService {
    /**
     * Send welcome email after successful registration
     */
    static async sendWelcomeEmail(options: {
        email: string;
        firstName: string;
    }): Promise<SendEmailResult> {
        const { email, firstName } = options;

        const html = renderWelcomeEmail(firstName);

        return this.send({
            to: { email },
            subject: `Welcome to Fabiole, ${firstName}! 🎉`,
            html,
            text: `Welcome to Fabiole, ${firstName}!\n\nYour account has been created successfully. You're now ready to start your fitness journey with personalized coaching.\n\nVisit your dashboard: https://fabiole.com/dashboard`,
        });
    }

    /**
     * Send email when an account is manually created by admin.
     * Does NOT include password - user receives a separate verification code to set password via "Recuperar Password".
     */
    static async sendManualAccountCreatedEmail(options: {
        email: string;
        firstName: string;
        role?: string;
    }): Promise<SendEmailResult> {
        const { email, firstName, role = 'USER' } = options;

        const isAdmin = role === 'ADMINISTRATOR';
        const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://fabiole.com';

        const html = renderManualAccountEmail({
            firstName,
            email,
            isAdmin,
            resetUrl: `${siteUrl}/`,
        });

        const senderName = isAdmin ? 'Fabiole | Administrator Account Created' : 'Fabiole | User Account created';

        return this.send({
            from: this.createDefaultSender(senderName),
            to: { email },
            subject: `Bem-vindo(a) à Fabiole - Definir a sua password`,
            html,
            text: `Bem-vindo(a) à Fabiole, ${firstName}!\n\nA sua conta foi criada manualmente pela administração.\n\nReceberá em breve um email separado com um código de verificação para definir a sua password.\n\nPara definir a sua password:\n1. Aceda a ${siteUrl}\n2. Clique em "Iniciar sessão" e depois "Recuperar Password"\n3. Introduza o seu email e o código que recebeu\n4. Defina a sua nova password\n\nAceda em: ${siteUrl}/`,
        });
    }

    /**
     * Send email when account status is changed to SUSPENDED or BANNED
     */
    static async sendAccountStatusChangeEmail(options: {
        email: string;
        firstName: string;
        newStatus: 'ACTIVE' | 'SUSPENDED' | 'BANNED';
        adminEmail: string;
        changedAt: Date;
        reason?: string;
    }): Promise<SendEmailResult> {
        const { email, firstName, newStatus, adminEmail, changedAt, reason } = options;

        const formattedDate = changedAt.toLocaleDateString('pt-PT', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            timeZone: 'Europe/Lisbon'
        });

        const html = renderAccountStatusChangeEmail({
            firstName,
            userEmail: email,
            newStatus,
            adminEmail,
            changedAt: formattedDate,
            reason
        });

        let statusLabel = '';
        let subjectAction = '';

        if (newStatus === 'ACTIVE') {
            statusLabel = 'Ativa';
            subjectAction = 'reativada';
        } else if (newStatus === 'SUSPENDED') {
            statusLabel = 'Suspensa';
            subjectAction = 'suspensa';
        } else {
            statusLabel = 'Banida';
            subjectAction = 'banida';
        }

        const senderName = `Fabiole | Conta ${statusLabel}`;

        let textBody = `Olá ${firstName},\n\nA sua conta (${email}) foi ${subjectAction} por ${adminEmail} em ${formattedDate}.`;

        if (newStatus === 'BANNED' && reason) {
            textBody += `\n\nMotivo do Bloqueio: ${reason}`;
        }

        textBody += `\n\nSe acredita que esta ação foi tomada por engano, contacte a administração.`;

        return this.send({
            from: this.createDefaultSender(senderName),
            to: { email },
            subject: `Fabiole - A sua conta foi ${subjectAction}`,
            html,
            text: textBody,
        });
    }
}
