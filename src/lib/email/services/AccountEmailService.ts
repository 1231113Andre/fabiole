import { BaseEmailService } from './BaseEmailService';
import { renderWelcomeEmail } from '../templates/WelcomeEmail';
import { renderManualAccountEmail } from '../templates/ManualAccountEmail';
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

        const html = renderManualAccountEmail({
            firstName,
            email,
            password,
            isAdmin
        });

        const senderName = isAdmin ? 'Fabiole | Administrator Account Created' : 'Fabiole | User Account created';

        return this.send({
            from: this.createDefaultSender(senderName),
            to: { email },
            subject: `Bem-vindo(a) à Fabiole - As suas credenciais de acesso`,
            html,
            text: `Bem-vindo(a) à Fabiole, ${firstName}!\n\nA sua conta foi criada manualmente pela administração.\n\nCredenciais:\nEmail: ${email}\nPassword: ${password}\n\nImportante: Por favor, altere a sua password no primeiro acesso na aba "Definições".\n\nAceda em: https://fabiole.com/`,
        });
    }
}
