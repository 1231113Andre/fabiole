import { BodyFatClassification, Gender, AutoCalculatedMetrics, CalculateAllMetricsInput } from "./types";
import { BADGE_STYLES } from "./constants";
import { calculateBMI, classifyBMI } from "./bmi";

/**
 * Calculate Muscle Mass (MM) / Lean Body Mass (LBM)
 * Formula: peso × (1 - %MG / 100)
 * LBM includes: muscles, bones, organs, blood, skin - everything except fat
 * Note: We do NOT subtract bone mass - bones are part of LBM by definition
 */
export function calculateMM(
    peso: number | null,
    percentualMG: number | null
): number | null {
    if (!peso || peso <= 0) return null;
    if (!percentualMG || percentualMG <= 0) return null;

    // Standard LBM formula: weight × (1 - body fat %)
    const lbm = peso * (1 - percentualMG / 100);

    // Only return if the result is positive and makes sense
    return lbm > 0 ? parseFloat(lbm.toFixed(2)) : null;
}

/**
 * Calculate Body Water (H2O) using Watson Formula
 * Watson formula is more accurate than simple percentage estimates
 * 
 * Males:   TBW (L) = 2.447 - (0.09156 × age) + (0.1074 × height_cm) + (0.3362 × peso_kg)
 * Females: TBW (L) = -2.097 + (0.1069 × height_cm) + (0.2466 × peso_kg)
 * 
 * Returns H2O as percentage of body weight (e.g., 55.5 for 55.5%)
 */
export function calculateH2O(
    peso: number | null,
    height: number | null,
    age: number | null,
    gender: Gender
): number | null {
    if (!peso || peso <= 0) return null;
    if (!height || height <= 0) return null;

    const g = gender.toString().toUpperCase();
    const isMale = g === 'MALE' || g === 'MASCULINO' || g === 'M';

    let tbw: number;

    if (isMale) {
        // Watson formula for males (requires age)
        // If no age provided, use a reasonable default of 30
        const ageValue = age && age > 0 ? age : 30;
        tbw = 2.447 - (0.09156 * ageValue) + (0.1074 * height) + (0.3362 * peso);
    } else {
        // Watson formula for females (doesn't use age)
        tbw = -2.097 + (0.1069 * height) + (0.2466 * peso);
    }

    // Convert TBW (liters ≈ kg) to percentage of body weight
    const h2oPercent = (tbw / peso) * 100;

    return h2oPercent > 0 ? parseFloat(h2oPercent.toFixed(1)) : null;
}

/**
 * Calculate Body Water with both percentage and kg values
 * Use this when you need to display tooltip with kg value
 */
export function calculateH2OFull(
    peso: number | null,
    height: number | null,
    age: number | null,
    gender: Gender
): { percent: number | null; kg: number | null } {
    if (!peso || peso <= 0) return { percent: null, kg: null };
    if (!height || height <= 0) return { percent: null, kg: null };

    const g = gender.toString().toUpperCase();
    const isMale = g === 'MALE' || g === 'MASCULINO' || g === 'M';

    let tbw: number;

    if (isMale) {
        const ageValue = age && age > 0 ? age : 30;
        tbw = 2.447 - (0.09156 * ageValue) + (0.1074 * height) + (0.3362 * peso);
    } else {
        tbw = -2.097 + (0.1069 * height) + (0.2466 * peso);
    }

    if (tbw <= 0) return { percent: null, kg: null };

    const h2oPercent = (tbw / peso) * 100;

    return {
        percent: parseFloat(h2oPercent.toFixed(1)),
        kg: parseFloat(tbw.toFixed(1))
    };
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
 * Calculate all auto-calculated metrics at once
 * Respects manual overrides if provided
 */
export function calculateAllMetrics(input: CalculateAllMetricsInput): AutoCalculatedMetrics {
    const { peso, height, percentualMG, gender, age, manualOverrides = {} } = input;

    // BMI calculation or use manual override
    const calculatedBMI = calculateBMI(peso, height);
    const imc = manualOverrides.imc !== undefined ? manualOverrides.imc : calculatedBMI;

    // MM (LBM) calculation or use manual override - no longer needs massaOssea
    const calculatedMM = calculateMM(peso, percentualMG);
    const mm = manualOverrides.mm !== undefined ? manualOverrides.mm : calculatedMM;

    // H2O calculation using Watson formula - needs height and age
    const calculatedH2O = calculateH2O(peso, height, age ?? null, gender);
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
