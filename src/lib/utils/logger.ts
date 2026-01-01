/**
 * @fileoverview High-fidelity logging utility
 * @description Standardized format: [DD.MM.YYYY - HH:MM:SS] | [Category] => Message
 */

export class Logger {
    private static formatMessage(category: string, message: string): string {
        const now = new Date();

        // Format: [DD.MM.YYYY - HH:MM:SS]
        const formatter = new Intl.DateTimeFormat('pt-PT', {
            timeZone: 'Europe/Lisbon',
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false
        });

        const parts = formatter.formatToParts(now);
        const getPart = (type: Intl.DateTimeFormatPartTypes) => parts.find(p => p.type === type)?.value || '';

        const timestamp = `${getPart('day')}.${getPart('month')}.${getPart('year')} - ${getPart('hour')}:${getPart('minute')}:${getPart('second')}`;

        // Ensure message ends with a period
        const finalMessage = message.trim().endsWith('.') ? message.trim() : `${message.trim()}.`;

        return `[${timestamp}] | [${category}] => ${finalMessage}`;
    }

    static info(category: string, message: string) {
        console.log(this.formatMessage(category, message));
    }

    static success(category: string, message: string) {
        console.log(this.formatMessage(category, message));
    }

    static warn(category: string, message: string) {
        console.warn(this.formatMessage(category, message));
    }

    static error(category: string, message: string, error?: any) {
        let fullMessage = message;
        if (error) {
            fullMessage += ` | Error Details: ${error.message || error}`;
        }
        console.error(this.formatMessage(category, fullMessage));
        if (error?.stack) {
            const stackLines = error.stack.split('\n').slice(0, 3).map((line: string) => `    ${line.trim()}`).join('\n');
            console.error(stackLines);
        }
    }
}
