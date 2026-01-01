/**
 * @fileoverview Sanitization utilities for data processing
 * @description Shared sanitizers for form data, imports, and API updates
 */

/**
 * Sanitize value to number - returns null for empty/invalid values (for bulk create)
 */
export function sanitizeValue(value: unknown): number | null {
    if (value === null || value === undefined || value === '') {
        return null;
    }
    if (typeof value === 'string' && value.trim() === '') {
        return null;
    }
    // Handle spreadsheet errors or invalid strings
    if (typeof value === 'string' && (value.startsWith('#') || value === '-')) {
        return null;
    }

    // Parse as number
    if (typeof value === 'string') {
        const parsed = parseFloat(value.replace(',', '.')); // Handle comma decimals
        return !isNaN(parsed) ? parsed : null;
    }

    if (typeof value === 'number') {
        return isNaN(value) ? null : value;
    }

    return null;
}

/**
 * Sanitize value for updates - returns undefined to skip field, null to clear it
 */
export function sanitizeValueForUpdate(value: unknown): number | null | undefined {
    if (value === undefined) return undefined; // Don't update field
    if (value === null || value === '') return null; // Set to null
    if (typeof value === 'string' && value.trim() === '') return null;
    const parsed = typeof value === 'string' ? parseFloat(value.replace(',', '.')) : Number(value);
    return isNaN(parsed) ? null : parsed;
}

/**
 * Sanitize integer value - returns null for empty/invalid values
 */
export function sanitizeInt(value: unknown): number | null {
    if (value === null || value === undefined || value === '') {
        return null;
    }
    const val = sanitizeValue(value);
    return val !== null ? Math.round(val) : null;
}

/**
 * Sanitize integer for updates - returns undefined to skip field
 */
export function sanitizeIntForUpdate(value: unknown): number | null | undefined {
    if (value === undefined) return undefined;
    if (value === null || value === '') return null;
    const parsed = parseInt(String(value), 10);
    return isNaN(parsed) ? null : parsed;
}

/**
 * Sanitize string value - returns null for empty/invalid values
 */
export function sanitizeStringValue(value: unknown): string | null {
    if (value === null || value === undefined || value === '') {
        return null;
    }
    const strValue = String(value).trim();
    // Filter out spreadsheet errors
    if (strValue.startsWith('#') || strValue === '') {
        return null;
    }
    return strValue;
}

/**
 * Sanitize string for updates - returns undefined to skip field
 */
export function sanitizeStringForUpdate(value: unknown): string | null | undefined {
    if (value === undefined) return undefined;
    if (value === null || value === '') return null;
    const strValue = String(value).trim();
    return strValue === '' ? null : strValue;
}

/**
 * Type guard for error objects with message property
 */
export function isErrorWithMessage(error: unknown): error is { message: string } {
    return (
        typeof error === 'object' &&
        error !== null &&
        'message' in error &&
        typeof (error as { message: unknown }).message === 'string'
    );
}

/**
 * Get error message safely from unknown error
 */
export function getErrorMessage(error: unknown): string {
    if (isErrorWithMessage(error)) {
        return error.message;
    }
    return String(error);
}

/**
 * Convert Prisma Decimal to number or null
 * Used for formatting Prisma Decimal fields in API responses
 */
export function toNumber(value: unknown): number | null {
    if (value === null || value === undefined) return null;
    const num = Number(value);
    return isNaN(num) ? null : num;
}

/**
 * Format date to ISO string or null
 */
export function toISOStringOrNull(value: Date | null | undefined): string | null {
    if (!value) return null;
    return value.toISOString();
}
