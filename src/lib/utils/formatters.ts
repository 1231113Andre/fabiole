/**
 * @fileoverview Formatters - Currency and Date formatting utilities
 * @description Centralized formatting functions for consistent display across the app
 */

// =============================================================================
// CURRENCY FORMATTING
// =============================================================================

/**
 * Format a number as EUR currency (Portuguese locale)
 * @example formatCurrency(49.99) => "49,99 €"
 */
export function formatCurrency(value: number): string {
    return new Intl.NumberFormat('pt-PT', {
        style: 'currency',
        currency: 'EUR'
    }).format(value);
}

// =============================================================================
// DATE FORMATTING
// =============================================================================

/**
 * Format a date in short pt-PT format (DD/MM/YYYY)
 * @example formatDate('2024-01-15') => "15/01/2024"
 */
export function formatDate(date: Date | string | null): string {
    if (!date) return '-';
    const d = date instanceof Date ? date : new Date(date);
    if (isNaN(d.getTime())) return '-';
    return d.toLocaleDateString('pt-PT');
}

/**
 * Format a date in long pt-PT format (e.g., "15 de janeiro de 2024")
 * @example formatDateLong('2024-01-15') => "15 de janeiro de 2024"
 */
export function formatDateLong(date: Date | string | null): string {
    if (!date) return '-';
    const d = date instanceof Date ? date : new Date(date);
    if (isNaN(d.getTime())) return '-';
    return d.toLocaleDateString('pt-PT', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    });
}

/**
 * Format a date for API/forms (YYYY-MM-DD)
 * @example formatDateISO(new Date()) => "2024-01-15"
 */
export function formatDateISO(date: Date | string | null): string {
    if (!date) return '';
    const d = date instanceof Date ? date : new Date(date);
    if (isNaN(d.getTime())) return '';
    return d.toISOString().split('T')[0];
}
