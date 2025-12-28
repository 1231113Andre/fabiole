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
 */
export function calculateMM(
    peso: number | null,
    percentualMG: number | null,
    massaOssea: number | null
): number | null {
    if (!peso) return null;
    const gordura = percentualMG ? (peso * percentualMG / 100) : 0;
    const ossea = massaOssea || 0;
    const mm = peso - gordura - ossea;
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
    if (bmiClass === 'Peso Normal') return 'bg-emerald-100 text-emerald-700';
    if (bmiClass === 'Baixo Peso') return 'bg-sky-100 text-sky-700';
    if (bmiClass === 'Pré-obesidade' || bmiClass.includes('Grau I')) return 'bg-amber-100 text-amber-700';
    if (bmiClass.includes('Grau')) return 'bg-red-100 text-red-700';
    return 'bg-gray-100 text-gray-500';
}

/**
 * Get CSS class for body fat classification badge
 */
export function getFatClassColor(fatClass: string): string {
    if (fatClass === 'Saudável e em Boa Forma' || fatClass.includes('Performance')) {
        return 'bg-emerald-100 text-emerald-700';
    }
    if (fatClass === 'Gordura Vital') return 'bg-sky-100 text-sky-700';
    if (fatClass === 'Nível Médio (Atenção)') return 'bg-amber-100 text-amber-700';
    if (fatClass === 'Elevado (Risco para a Saúde)') return 'bg-red-100 text-red-700';
    return 'bg-gray-100 text-gray-500';
}

/**
 * Get CSS class for delta peso display
 */
export function getDeltaPesoColor(delta: number | null | string): string {
    if (delta === null) return 'text-gray-400';
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
