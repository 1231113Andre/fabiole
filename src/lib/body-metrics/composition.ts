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
 * Body fat thresholds by gender and age band (%)
 * Aligned with Referências table: massa_gorda.json (Atleta/Excelente, Bom/Saudável, Médio, Risco/Obesidade = mau)
 * Below Atleta min = Gordura Vital; above medioMax = Elevado (Risco).
 */
type AgeBand = 0 | 1 | 2 | 3 | 4; // 18-29, 30-39, 40-49, 50-59, 60+
interface FatBand { atletaMin: number; atletaMax: number; bomMax: number; medioMax: number; }

const BODY_FAT_MALE: Record<AgeBand, FatBand> = {
    0: { atletaMin: 8, atletaMax: 11, bomMax: 15, medioMax: 24 },   // 18-29: medio 16-20%, mau >24%
    1: { atletaMin: 11, atletaMax: 15, bomMax: 19, medioMax: 26 },   // 30-39: medio 20-23%, mau >26%
    2: { atletaMin: 13, atletaMax: 17, bomMax: 21, medioMax: 28 },   // 40-49: medio 22-24%, mau >28%
    3: { atletaMin: 15, atletaMax: 19, bomMax: 23, medioMax: 30 },   // 50-59: medio 24-26%, mau >30%
    4: { atletaMin: 17, atletaMax: 21, bomMax: 25, medioMax: 31 }    // 60+: medio 26-28%, mau >31%
};

const BODY_FAT_FEMALE: Record<AgeBand, FatBand> = {
    0: { atletaMin: 14, atletaMax: 17, bomMax: 21, medioMax: 32 },  // 18-29: medio 22-25%, mau >32%
    1: { atletaMin: 15, atletaMax: 19, bomMax: 23, medioMax: 34 },  // 30-39: medio 24-27%, mau >34%
    2: { atletaMin: 18, atletaMax: 22, bomMax: 26, medioMax: 36 },  // 40-49: medio 27-30%, mau >36%
    3: { atletaMin: 20, atletaMax: 24, bomMax: 29, medioMax: 38 },  // 50-59: medio 30-33%, mau >38%
    4: { atletaMin: 21, atletaMax: 26, bomMax: 31, medioMax: 39 }   // 60+: medio 32-35%, mau >39%
};

function getAgeBand(age: number | null | undefined): AgeBand {
    if (age === null || age === undefined || age < 18) return 0;
    if (age < 30) return 0;
    if (age < 40) return 1;
    if (age < 50) return 2;
    if (age < 60) return 3;
    return 4;
}

/**
 * Classify Body Fat Percentage (%MG) by gender and age – aligned with reference table
 */
export function classifyBodyFat(
    percentage: number | null | undefined,
    gender: Gender = 'Masculino',
    age?: number | null
): BodyFatClassification | '' {
    if (percentage === null || percentage === undefined || isNaN(percentage)) {
        return '';
    }

    const genderLower = gender.toString().toLowerCase();
    const isMale = genderLower === 'masculino' || genderLower === 'm' || genderLower === 'male';
    const isFemale = genderLower === 'feminino' || genderLower === 'f' || genderLower === 'female';

    if (!isMale && !isFemale) {
        return 'Verifique o Género';
    }

    const pct = percentage < 1 ? percentage * 100 : percentage;
    const band = getAgeBand(age ?? null);
    const thresholds = isMale ? BODY_FAT_MALE[band] : BODY_FAT_FEMALE[band];

    if (pct < thresholds.atletaMin) return 'Gordura Vital';
    if (pct <= thresholds.atletaMax) return 'Excelente (Atleta)';
    if (pct <= thresholds.bomMax) return 'Bom (Saudável)';
    if (pct <= thresholds.medioMax) return 'Médio (Aceitável)';
    return 'Risco/Obesidade';
}

/**
 * Get CSS class for body fat classification badge
 */
export function getFatClassColor(fatClass: string): string {
    const f = fatClass.toLowerCase();
    if (f.includes('saudável') || f.includes('excelente') || f.includes('atleta')) {
        return BADGE_STYLES.GREEN;
    }
    if (f.includes('vital')) return BADGE_STYLES.BLUE;
    if (f.includes('médio') || f.includes('aceitável')) return BADGE_STYLES.YELLOW;
    if (f.includes('risco') || f.includes('obesidade') || f.includes('elevado')) return BADGE_STYLES.RED;
    return BADGE_STYLES.GRAY;
}

/**
 * Get Icon for Body Fat classification
 */
export function getFatIcon(fatClass: string): string {
    const f = fatClass.toLowerCase();
    if (f.includes('saudável') || f.includes('excelente') || f.includes('atleta')) return 'fa-check';
    if (f.includes('vital')) return 'fa-heart-pulse';
    if (f.includes('médio') || f.includes('aceitável')) return 'fa-square-exclamation';
    if (f.includes('risco') || f.includes('obesidade')) return 'fa-triangle-exclamation';
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

    // Body fat classification (by gender and age – same thresholds as reference table)
    const resultadoPercentMG = manualOverrides.resultadoPercentMG !== undefined && manualOverrides.resultadoPercentMG !== null
        ? manualOverrides.resultadoPercentMG
        : classifyBodyFat(percentualMG, gender, age ?? null) || '';

    return {
        imc,
        mm,
        h2o,
        resultadoIMC,
        resultadoPercentMG
    };
}
