/**
 * @fileoverview Body Metrics - BMI, Body Fat, Muscle Mass, H2O calculations
 * @description Centralized body metrics calculations and classifications
 */

// =============================================================================
// TYPES
// =============================================================================

export type BMIClassification =
    | 'Baixo Peso'
    | 'Peso Normal'
    | 'Pré-obesidade'
    | 'Obesidade Grau I'
    | 'Obesidade Grau II'
    | 'Obesidade Grau III';

export type BodyFatClassification =
    | 'Gordura Vital'
    | 'Muito Magro (Foco Performance)'
    | 'Muito Magro/a (Foco Performance)'
    | 'Saudável e em Boa Forma'
    | 'Nível Médio (Atenção)'
    | 'Elevado (Risco para a Saúde)'
    | 'Verifique o Género';

// =============================================================================
// BADGE STYLES
// =============================================================================

export const BADGE_STYLES = {
    GRAY: "inline-flex items-center rounded-md bg-gray-500/15 px-2 py-1 text-xs font-bold text-gray-700 inset-ring inset-ring-gray-500/30",
    RED: "inline-flex items-center rounded-md bg-red-500/15 px-2 py-1 text-xs font-bold text-red-700 inset-ring inset-ring-red-500/30",
    YELLOW: "inline-flex items-center rounded-md bg-yellow-500/15 px-2 py-1 text-xs font-bold text-yellow-700 inset-ring inset-ring-yellow-500/40",
    GREEN: "inline-flex items-center rounded-md bg-emerald-500/15 px-2 py-1 text-xs font-bold text-emerald-700 inset-ring inset-ring-emerald-500/30",
    BLUE: "inline-flex items-center rounded-md bg-blue-500/15 px-2 py-1 text-xs font-bold text-blue-700 inset-ring inset-ring-blue-500/30",
    INDIGO: "inline-flex items-center rounded-md bg-indigo-500/15 px-2 py-1 text-xs font-bold text-indigo-700 inset-ring inset-ring-indigo-500/30",
    PURPLE: "inline-flex items-center rounded-md bg-purple-500/15 px-2 py-1 text-xs font-bold text-purple-700 inset-ring inset-ring-purple-500/30",
    PINK: "inline-flex items-center rounded-md bg-pink-500/15 px-2 py-1 text-xs font-bold text-pink-700 inset-ring inset-ring-pink-500/30",
};

export type Gender = 'M' | 'F' | 'Masculino' | 'Feminino' | string;

// =============================================================================
// CALCULATIONS
// =============================================================================

/**
 * Calculate BMI from weight and height
 * Formula: weight / (height_m)^2
 */
export function calculateBMI(weightKg: number | null, heightCm: number | null): number | null {
    if (!weightKg || !heightCm || weightKg <= 0 || heightCm <= 0) {
        return null;
    }
    const heightM = heightCm / 100;
    const bmi = weightKg / (heightM * heightM);
    return Math.round(bmi * 10) / 10;
}

/**
 * Calculate Muscle Mass (MM)
 * Formula: peso - (peso * %MG / 100) - massaOssea
 * Returns null if peso is missing or result would be negative/zero
 */
export function calculateMM(
    peso: number | null,
    percentualMG: number | null,
    massaOssea: number | null
): number | null {
    if (!peso || peso <= 0) return null;

    const gordura = percentualMG && percentualMG > 0 ? (peso * percentualMG / 100) : 0;
    const ossea = massaOssea && massaOssea > 0 ? massaOssea : 0;
    const mm = peso - gordura - ossea;

    // Only return if the result is positive and makes sense
    return mm > 0 ? parseFloat(mm.toFixed(2)) : null;
}

/**
 * Calculate Body Water (H2O)
 * Formula: peso * factor (male: 60%, female: 50%)
 */
export function calculateH2O(peso: number | null, gender: Gender): number | null {
    if (!peso) return null;
    const g = gender.toString().toUpperCase();
    const isMale = g === 'MALE' || g === 'MASCULINO' || g === 'M';
    const percentage = isMale ? 0.60 : 0.50;
    return parseFloat((peso * percentage).toFixed(2));
}

/**
 * Calculate all auto-calculated metrics at once
 * Respects manual overrides if provided
 */
export interface AutoCalculatedMetrics {
    imc: number | null;
    mm: number | null;
    h2o: number | null;
    resultadoIMC: string;
    resultadoPercentMG: string;
}

export interface CalculateAllMetricsInput {
    peso: number | null;
    height: number | null;
    percentualMG: number | null;
    massaOssea: number | null;
    gender: Gender;
    // Manual overrides - if set, use these instead of calculating
    manualOverrides?: {
        imc?: number | null;
        mm?: number | null;
        h2o?: number | null;
        resultadoIMC?: string | null;
        resultadoPercentMG?: string | null;
    };
}

export function calculateAllMetrics(input: CalculateAllMetricsInput): AutoCalculatedMetrics {
    const { peso, height, percentualMG, massaOssea, gender, manualOverrides = {} } = input;

    // BMI calculation or use manual override
    const calculatedBMI = calculateBMI(peso, height);
    const imc = manualOverrides.imc !== undefined ? manualOverrides.imc : calculatedBMI;

    // MM calculation or use manual override
    const calculatedMM = calculateMM(peso, percentualMG, massaOssea);
    const mm = manualOverrides.mm !== undefined ? manualOverrides.mm : calculatedMM;

    // H2O calculation or use manual override
    const calculatedH2O = calculateH2O(peso, gender);
    const h2o = manualOverrides.h2o !== undefined ? manualOverrides.h2o : calculatedH2O;

    // BMI classification - use IMC value (calculated or from input)
    const resultadoIMC = manualOverrides.resultadoIMC !== undefined && manualOverrides.resultadoIMC !== null
        ? manualOverrides.resultadoIMC
        : classifyBMI(imc) || '';

    // Body fat classification
    const resultadoPercentMG = manualOverrides.resultadoPercentMG !== undefined && manualOverrides.resultadoPercentMG !== null
        ? manualOverrides.resultadoPercentMG
        : classifyBodyFat(percentualMG, gender) || '';

    return {
        imc,
        mm,
        h2o,
        resultadoIMC,
        resultadoPercentMG
    };
}

// =============================================================================
// CLASSIFICATIONS
// =============================================================================

/**
 * Classify BMI value
 */
export function classifyBMI(bmi: number | null | undefined): BMIClassification | '' {
    if (bmi === null || bmi === undefined || isNaN(bmi)) {
        return '';
    }
    if (bmi < 18.5) return 'Baixo Peso';
    if (bmi < 25) return 'Peso Normal';
    if (bmi < 30) return 'Pré-obesidade';
    if (bmi < 35) return 'Obesidade Grau I';
    if (bmi < 40) return 'Obesidade Grau II';
    return 'Obesidade Grau III';
}

/**
 * Classify Body Fat Percentage (%MG)
 */
export function classifyBodyFat(
    percentage: number | null | undefined,
    gender: Gender = 'Masculino'
): BodyFatClassification | '' {
    if (percentage === null || percentage === undefined || isNaN(percentage)) {
        return '';
    }

    const genderLower = gender.toString().toLowerCase();
    const isMale = genderLower === 'masculino' || genderLower === 'm';
    const isFemale = genderLower === 'feminino' || genderLower === 'f';

    if (!isMale && !isFemale) {
        return 'Verifique o Género';
    }

    const pct = percentage < 1 ? percentage * 100 : percentage;

    if (isMale) {
        if (pct < 6) return 'Gordura Vital';
        if (pct < 14) return 'Muito Magro (Foco Performance)';
        if (pct < 18) return 'Saudável e em Boa Forma';
        if (pct < 25) return 'Nível Médio (Atenção)';
        return 'Elevado (Risco para a Saúde)';
    } else {
        if (pct < 14) return 'Gordura Vital';
        if (pct < 21) return 'Muito Magro/a (Foco Performance)';
        if (pct < 25) return 'Saudável e em Boa Forma';
        if (pct < 32) return 'Nível Médio (Atenção)';
        return 'Elevado (Risco para a Saúde)';
    }
}

// =============================================================================
// UI COLOR HELPERS (for badges/displays)
// =============================================================================

/**
 * Get CSS class for BMI classification badge
 */
export function getBmiClassColor(bmiClass: string): string {
    if (bmiClass === 'Peso Normal') return BADGE_STYLES.GREEN;
    if (bmiClass === 'Baixo Peso') return BADGE_STYLES.BLUE;
    if (bmiClass === 'Pré-obesidade' || bmiClass.includes('Grau I')) return BADGE_STYLES.YELLOW;
    if (bmiClass.includes('Grau')) return BADGE_STYLES.RED;
    return BADGE_STYLES.GRAY;
}

/**
 * Get Icon for BMI classification
 */
export function getBmiIcon(bmiClass: string): string {
    if (bmiClass === 'Peso Normal') return 'fa-check';
    if (bmiClass === 'Baixo Peso') return 'fa-arrow-down';
    if (bmiClass === 'Pré-obesidade') return 'fa-circle-exclamation';
    if (bmiClass.includes('Grau')) return 'fa-triangle-exclamation';
    return 'fa-minus';
}

/**
 * Get CSS class for body fat classification badge
 */
export function getFatClassColor(fatClass: string): string {
    if (fatClass === 'Saudável e em Boa Forma' || fatClass.includes('Performance')) {
        return BADGE_STYLES.GREEN;
    }
    if (fatClass === 'Gordura Vital') return BADGE_STYLES.BLUE;
    if (fatClass === 'Nível Médio (Atenção)') return BADGE_STYLES.YELLOW;
    if (fatClass === 'Elevado (Risco para a Saúde)') return BADGE_STYLES.RED;
    return BADGE_STYLES.GRAY;
}

/**
 * Get Icon for Body Fat classification
 */
export function getFatIcon(fatClass: string): string {
    if (fatClass === 'Saudável e em Boa Forma' || fatClass.includes('Performance')) return 'fa-check';
    if (fatClass === 'Gordura Vital') return 'fa-heart-pulse';
    if (fatClass === 'Nível Médio (Atenção)') return 'fa-square-exclamation';
    if (fatClass === 'Elevado (Risco para a Saúde)') return 'fa-triangle-exclamation';
    return 'fa-minus';
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
 * Get CSS class for Mile result badge
 */
export function getMileResultStyle(result: string): string {
    if (!result) return BADGE_STYLES.GRAY;
    const r = result.toLowerCase();

    if (r.includes('excelente') || r.includes('bom') || r.includes('apto')) {
        return BADGE_STYLES.GREEN;
    }
    if (r.includes('médio') || r.includes('atenção')) {
        return BADGE_STYLES.YELLOW;
    }
    if (r.includes('fraco') || r.includes('risco')) {
        return BADGE_STYLES.RED;
    }

    return BADGE_STYLES.GRAY;
}
