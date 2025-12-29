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

export function sanitizeInt(value: unknown): number | null {
    if (value === null || value === undefined || value === '') {
        return null;
    }
    const val = sanitizeValue(value);
    return val !== null ? Math.round(val) : null;
}

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
