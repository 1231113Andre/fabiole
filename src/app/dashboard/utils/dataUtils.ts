/**
 * Date parsing utilities for dashboard data
 */

/**
 * Parse date string in DD/MM/YYYY or DD.MM.YYYY format to timestamp
 * @param dateStr - Date string to parse
 * @returns Timestamp in milliseconds, or 0 if invalid
 */
export function parseDate(dateStr: string): number {
    if (!dateStr) return 0;
    const parts = dateStr.split(/[./]/);
    if (parts.length === 3) {
        // DD/MM/YYYY -> YYYY-MM-DD for comparison
        return new Date(`${parts[2]}-${parts[1]}-${parts[0]}`).getTime();
    }
    return new Date(dateStr).getTime();
}

/**
 * Parse numeric value with fallback to 0
 * @param value - Value to parse (string or number)
 * @returns Parsed number or 0
 */
export function parseNumber(value: string | number | undefined): number {
    if (typeof value === 'number') return value;
    return parseFloat(String(value)) || 0;
}

/**
 * Parse integer value with fallback to 0
 * @param value - Value to parse (string or number)
 * @returns Parsed integer or 0
 */
export function parseInt(value: string | number | undefined): number {
    if (typeof value === 'number') return Math.floor(value);
    return Number.parseInt(String(value), 10) || 0;
}

/**
 * Round number to specified decimal places
 * @param value - Number to round
 * @param decimals - Number of decimal places (default: 1)
 * @returns Rounded number
 */
export function round(value: number, decimals: number = 1): number {
    const factor = Math.pow(10, decimals);
    return Math.round(value * factor) / factor;
}

/**
 * Calculate BMI from weight and height
 * @param weightKg - Weight in kilograms
 * @param heightCm - Height in centimeters
 * @returns BMI value rounded to 1 decimal, or 0 if invalid input
 */
export function calculateBMI(weightKg: number, heightCm: number): number {
    if (weightKg <= 0 || heightCm <= 0) return 0;
    const heightM = heightCm / 100;
    return round(weightKg / (heightM * heightM));
}
