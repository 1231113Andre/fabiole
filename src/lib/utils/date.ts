/**
 * Date and time formatting utilities
 */

const DEFAULT_LOCALE = 'pl-PL';
const CET_TIMEZONE = 'Europe/Warsaw';

/**
 * Get the current year
 */
export function getCurrentYear(): number {
    return new Date().getFullYear();
}

/**
 * Format date to string
 * Default format: DD.MM.YYYY (based on pl-PL locale)
 */
export function formatDate(date: Date | number, options?: Intl.DateTimeFormatOptions): string {
    return new Intl.DateTimeFormat(DEFAULT_LOCALE, {
        dateStyle: 'medium',
        ...options
    }).format(date);
}

/**
 * Format time to string
 * Default format: HH:mm:ss
 */
export function formatTime(date: Date | number, options?: Intl.DateTimeFormatOptions): string {
    return new Intl.DateTimeFormat(DEFAULT_LOCALE, {
        timeStyle: 'medium',
        ...options
    }).format(date);
}

/**
 * Format date and time
 */
export function formatDateTime(date: Date | number, options?: Intl.DateTimeFormatOptions): string {
    return new Intl.DateTimeFormat(DEFAULT_LOCALE, {
        dateStyle: 'medium',
        timeStyle: 'medium',
        ...options
    }).format(date);
}

/**
 * Get current timestamp in CET format: YYYY-MM-DD | HH:mm:ss.ms
 * Used for server logs
 */
export function getTimestampCET(): string {
    const now = new Date();
    const cetOptions: Intl.DateTimeFormatOptions = {
        timeZone: CET_TIMEZONE,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
    };

    const formatter = new Intl.DateTimeFormat(DEFAULT_LOCALE, cetOptions);
    const parts = formatter.formatToParts(now);

    const getPart = (type: Intl.DateTimeFormatPartTypes) => parts.find(p => p.type === type)?.value || '';

    const date = `${getPart('year')}-${getPart('month')}-${getPart('day')}`;
    const time = `${getPart('hour')}:${getPart('minute')}:${getPart('second')}`;
    const ms = now.getMilliseconds().toString().padStart(3, '0');

    return `${date} | ${time}.${ms}`;
}
