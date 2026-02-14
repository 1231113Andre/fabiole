import { BADGE_STYLES } from "./constants";

/**
 * Calculate age from birth date
 */
export function calculateAge(birthDate: Date | string | null | undefined): number | null {
    if (!birthDate) return null;

    let birth: Date;

    if (birthDate instanceof Date) {
        birth = birthDate;
    } else {
        // Try standard parsing first
        birth = new Date(birthDate);

        // If invalid or it looks like DD/MM/YYYY, try manual parsing
        if (isNaN(birth.getTime()) && typeof birthDate === 'string') {
            const parts = birthDate.split(/[./-]/);
            // Check for DD/MM/YYYY or DD.MM.YYYY or DD-MM-YYYY
            if (parts.length === 3) {
                // Assuming DD/MM/YYYY if year is last
                if (parts[2].length === 4) {
                    birth = new Date(`${parts[2]}-${parts[1]}-${parts[0]}`);
                }
            }
        }
    }

    if (isNaN(birth.getTime())) return null;

    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
        age--;
    }

    return age > 0 ? age : null;
}

/**
 * Get CSS class for delta peso display
 */
export function getDeltaPesoColor(delta: number | null | string | undefined): string {
    if (delta === null || delta === undefined) return 'text-gray-400';
    if (typeof delta === 'string') {
        if (delta.startsWith('+')) return 'text-red-500';
        if (delta.startsWith('-')) return 'text-emerald-500';
        return 'text-gray-400';
    }
    if (delta > 0) return 'text-red-500';
    if (delta < 0) return 'text-emerald-500';
    return 'text-gray-400';
}

/**
 * Format delta peso for display
 */
export function formatDeltaPeso(delta: number | null): string {
    if (delta === null) return '-';
    const sign = delta > 0 ? '+' : '';
    return `${sign}${delta.toFixed(1)} kg`;
}

/**
 * Get CSS class for Mile / Push-ups / Abdominais result badge
 * Handles: Excelente, Bom, Médio, Fraco (MILHA); Acima da Média, Média, Fraco (PUSH UPS); Abaixo da Média (ABDOMINAIS)
 */
export function getMileResultStyle(result: string): string {
    if (!result) return BADGE_STYLES.GRAY;
    const r = result.toLowerCase();

    if (r.includes('excelente') || r.includes('bom') || r.includes('apto') || r.includes('acima')) {
        return BADGE_STYLES.GREEN;
    }
    if (r.includes('médio') || r.includes('média') || r.includes('atenção')) {
        return BADGE_STYLES.YELLOW;
    }
    if (r.includes('fraco') || r.includes('risco') || r.includes('mau') || r.includes('baixo') || r.includes('crítico') || r.includes('abaixo')) {
        return BADGE_STYLES.RED;
    }

    return BADGE_STYLES.GRAY;
}

/**
 * Safely parse a number from string input (handles comma and dot)
 * @example parseNumber("80,5") => 80.5
 */
export function parseNumber(value: unknown): number | null {
    if (typeof value === 'number') return value;
    if (typeof value === 'string') {
        if (!value.trim()) return null;
        // Replace comma with dot and parse
        const normalized = value.replace(',', '.');
        const parsed = parseFloat(normalized);
        return isNaN(parsed) ? null : parsed;
    }
    return null;
}
