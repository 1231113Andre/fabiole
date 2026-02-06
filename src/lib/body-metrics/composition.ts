import { BodyFatClassification, Gender, AutoCalculatedMetrics, CalculateAllMetricsInput } from "./types";
import { BADGE_STYLES } from "./constants";
import { calculateBMI, classifyBMI } from "./bmi";

/**
 * Calculate Lean Body Mass (LBM) / Fat-Free Mass (FFM)
 * 
 * Formula: LBM = Body Weight × (1 - Body Fat % / 100)
 * 
 * LBM includes: muscles, bones, organs, blood, skin, connective tissue - everything except fat mass
 * 
 * Note: This is the standard formula for calculating lean body mass from body weight and body fat percentage.
 * Bones are part of LBM by definition and should NOT be subtracted separately.
 * 
 * References:
 * - Heymsfield, S.B., et al. (2005). "Human Body Composition". Human Kinetics.
 * - Wang, Z., et al. (1992). "The five-level model: a new approach to organizing body-composition research". 
 *   American Journal of Clinical Nutrition, 56(1), 19-28.
 * 
 * @param peso - Body weight in kilograms
 * @param percentualMG - Body fat percentage (e.g., 15 for 15%)
 * @returns Lean body mass in kg, rounded to 2 decimal places, or null if invalid input
 */
export function calculateMM(
    peso: number | null,
    percentualMG: number | null
): number | null {
    if (!peso || peso <= 0) return null;
    if (percentualMG == null || percentualMG < 0 || percentualMG > 100) return null;

    // Standard LBM formula: weight × (1 - body fat %)
    const lbm = peso * (1 - percentualMG / 100);

    // Only return if the result is positive and makes sense
    return lbm > 0 ? parseFloat(lbm.toFixed(2)) : null;
}

/**
 * Calculate Total Body Water (TBW) using Watson Formula
 * 
 * The Watson formula is one of the most accurate methods for estimating total body water.
 * It uses anthropometric measurements and has been validated in clinical settings.
 * 
 * Formulas:
 * Males:   TBW (L) = 2.447 - (0.09156 × age) + (0.1074 × height_cm) + (0.3362 × weight_kg)
 * Females: TBW (L) = -2.097 + (0.1069 × height_cm) + (0.2466 × weight_kg)
 * 
 * Note: TBW in liters is approximately equal to TBW in kg (density ≈ 1 kg/L)
 * 
 * Normal TBW ranges:
 * - Adult males: 50-65% of body weight
 * - Adult females: 45-60% of body weight
 * - Decreases with age and increases with lean body mass
 * 
 * References:
 * - Watson, P.E., et al. (1980). "Total body water volumes for adult males and females estimated from 
 *   simple anthropometric measurements". American Journal of Clinical Nutrition, 33(1), 27-39.
 * - Roubenoff, R., et al. (1993). "Application of bioelectrical impedance analysis to elderly populations". 
 *   Journal of Gerontology, 48(3), M129-M135.
 * 
 * @param peso - Body weight in kilograms
 * @param height - Height in centimeters
 * @param age - Age in years (required for males, optional for females)
 * @param gender - Gender ('M'/'Masculino' or 'F'/'Feminino')
 * @returns Total body water as percentage of body weight, or null if invalid input
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
        // Watson formula for females (age-independent)
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
 * Body Fat Percentage Classification Thresholds
 * 
 * These thresholds are based on established scientific literature and clinical guidelines.
 * Body fat percentage varies by age and gender due to physiological differences.
 * 
 * Classifications:
 * - Gordura Vital (Essential Fat): Below athlete minimum - necessary for basic physiological functions
 * - Excelente (Atleta): Athletic/Excellent range - typical for competitive athletes
 * - Bom (Saudável): Healthy/Fitness range - optimal for general health
 * - Médio (Aceitável): Average/Acceptable range - within normal limits
 * - Risco/Obesidade: Risk/Obesity - associated with increased health risks
 * 
 * Essential fat requirements:
 * - Males: 2-5% (for basic physiological functions)
 * - Females: 10-13% (includes sex-specific fat for reproductive functions)
 * 
 * References:
 * - American Council on Exercise (ACE). "ACE Body Fat Percentage Norms for Men and Women" (2009)
 * - Gallagher, D., et al. (2000). "Healthy percentage body fat ranges: an approach for developing 
 *   guidelines based on body mass index". American Journal of Clinical Nutrition, 72(3), 694-701.
 * - Jackson, A.S., & Pollock, M.L. (1985). "Practical Assessment of Body Composition". 
 *   The Physician and Sportsmedicine, 13(5), 76-90.
 * - Lohman, T.G. (1992). "Advances in Body Composition Assessment". Human Kinetics Publishers.
 * 
 * Age bands: 18-29, 30-39, 40-49, 50-59, 60+
 */
type AgeBand = 0 | 1 | 2 | 3 | 4;
interface FatBand { atletaMin: number; atletaMax: number; bomMax: number; medioMax: number; }

const BODY_FAT_MALE: Record<AgeBand, FatBand> = {
    0: { atletaMin: 6, atletaMax: 13, bomMax: 17, medioMax: 24 },   // 18-29: Athlete 6-13%, Fitness 14-17%, Average 18-24%, >24% Risk
    1: { atletaMin: 11, atletaMax: 15, bomMax: 19, medioMax: 25 },  // 30-39: Athlete 11-15%, Fitness 16-19%, Average 20-25%, >25% Risk
    2: { atletaMin: 13, atletaMax: 17, bomMax: 21, medioMax: 26 },  // 40-49: Athlete 13-17%, Fitness 18-21%, Average 22-26%, >26% Risk
    3: { atletaMin: 14, atletaMax: 19, bomMax: 23, medioMax: 27 },  // 50-59: Athlete 14-19%, Fitness 20-23%, Average 24-27%, >27% Risk
    4: { atletaMin: 15, atletaMax: 20, bomMax: 24, medioMax: 28 }   // 60+: Athlete 15-20%, Fitness 21-24%, Average 25-28%, >28% Risk
};

const BODY_FAT_FEMALE: Record<AgeBand, FatBand> = {
    0: { atletaMin: 14, atletaMax: 20, bomMax: 24, medioMax: 31 },  // 18-29: Athlete 14-20%, Fitness 21-24%, Average 25-31%, >31% Risk
    1: { atletaMin: 15, atletaMax: 21, bomMax: 25, medioMax: 32 },  // 30-39: Athlete 15-21%, Fitness 22-25%, Average 26-32%, >32% Risk
    2: { atletaMin: 16, atletaMax: 23, bomMax: 27, medioMax: 33 },  // 40-49: Athlete 16-23%, Fitness 24-27%, Average 28-33%, >33% Risk
    3: { atletaMin: 17, atletaMax: 25, bomMax: 29, medioMax: 35 },  // 50-59: Athlete 17-25%, Fitness 26-29%, Average 30-35%, >35% Risk
    4: { atletaMin: 18, atletaMax: 26, bomMax: 30, medioMax: 36 }   // 60+: Athlete 18-26%, Fitness 27-30%, Average 31-36%, >36% Risk
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
 * Classify Body Fat Percentage by gender and age
 * 
 * Returns classification based on scientifically validated thresholds that account
 * for age-related changes in body composition and gender differences.
 * 
 * Classifications:
 * - Gordura Vital: Below athlete minimum (essential fat only)
 * - Excelente (Atleta): Athletic range - typical for competitive athletes
 * - Bom (Saudável): Fitness/Healthy range - optimal for general health
 * - Médio (Aceitável): Average/Acceptable range - within normal limits
 * - Risco/Obesidade: Risk/Obesity - associated with increased health risks
 * 
 * @param percentage - Body fat percentage (e.g., 15 for 15% or 0.15 for 15%)
 * @param gender - Gender ('M'/'Masculino' or 'F'/'Feminino')
 * @param age - Age in years (optional, defaults to 18-29 age band if not provided)
 * @returns Classification string or empty string if invalid
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

    // Handle both decimal (0.15) and percentage (15) formats
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
