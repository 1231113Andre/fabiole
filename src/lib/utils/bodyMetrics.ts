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
 * Calculate age from birth date
 */
export function calculateAge(birthDate: Date | string | null | undefined): number | null {
    if (!birthDate) return null;
    const birth = birthDate instanceof Date ? birthDate : new Date(birthDate);
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
    gender: Gender;
    age?: number | null; // For Watson H2O formula
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

// =============================================================================
// REFERENCE TABLES (Hardcoded for robustness)
// =============================================================================

const MILE_REFERENCES = {
    MALE: {
        "20-29": { mau: "> 10:00", medio: "08:01-09:00", bom: "07:01-08:00", excelente: "< 07:00" },
        "30-39": { mau: "> 10:30", medio: "08:31-09:30", bom: "07:31-08:30", excelente: "< 07:30" },
        "40-49": { mau: "> 11:00", medio: "09:01-10:00", bom: "08:01-09:00", excelente: "< 08:00" },
        "50-59": { mau: "> 11:30", medio: "09:31-10:30", bom: "08:31-09:30", excelente: "< 08:30" },
        "60+": { mau: "> 12:00", medio: "10:01-11:00", bom: "09:01-10:00", excelente: "< 09:00" }
    },
    FEMALE: {
        "20-29": { mau: "> 12:00", medio: "09:01-10:00", bom: "08:01-09:00", excelente: "< 08:00" },
        "30-39": { mau: "> 12:30", medio: "09:31-10:30", bom: "08:31-09:30", excelente: "< 08:30" },
        "40-49": { mau: "> 13:00", medio: "10:01-11:00", bom: "09:01-10:00", excelente: "< 09:00" },
        "50-59": { mau: "> 13:30", medio: "10:31-11:30", bom: "09:31-10:30", excelente: "< 09:30" },
        "60+": { mau: "> 14:00", medio: "11:01-12:00", bom: "10:01-11:00", excelente: "< 10:00" }
    }
};

const PUSHUPS_REFERENCES = {
    MALE: {
        "20-29": { mau: "0-9", medio: "20-35", bom: "36-49", excelente: "50+" },
        "30-39": { mau: "0-7", medio: "17-29", bom: "30-44", excelente: "45+" },
        "40-49": { mau: "0-5", medio: "14-25", bom: "26-39", excelente: "40+" },
        "50-59": { mau: "0-4", medio: "11-20", bom: "21-34", excelente: "35+" },
        "60+": { mau: "0-3", medio: "8-16", bom: "17-29", excelente: "30+" }
    },
    FEMALE: {
        "20-29": { mau: "0-5", medio: "13-24", bom: "25-34", excelente: "35+" },
        "30-39": { mau: "0-4", medio: "11-20", bom: "21-29", excelente: "30+" },
        "40-49": { mau: "0-3", medio: "9-17", bom: "18-24", excelente: "25+" },
        "50-59": { mau: "0-2", medio: "7-14", bom: "15-20", excelente: "21+" },
        "60+": { mau: "0-1", medio: "5-11", bom: "12-18", excelente: "19+" }
    }
};

/**
 * Classify Mile Test Result
 * @param timeStr Time in "mm:ss" string format
 * @param age User age
 * @param gender User gender
 */
export function classifyMileResult(
    timeStr: string | null | undefined,
    age: number | null | undefined,
    gender: Gender = 'Masculino'
): string {
    if (!timeStr || !age || age < 10) return ''; // Requres valid time and age

    // Normalize gender
    const genderLower = gender.toString().toLowerCase();
    const isMale = genderLower === 'masculino' || genderLower === 'm' || genderLower === 'male';
    const table = isMale ? MILE_REFERENCES.MALE : MILE_REFERENCES.FEMALE;

    // Determine age group
    let ageKey = "20-29"; // Default to youngest range if in doubt, or handle edge cases
    if (age < 20) ageKey = "20-29"; // Use 20-29 for under 20s as fallback
    else if (age >= 20 && age <= 29) ageKey = "20-29";
    else if (age >= 30 && age <= 39) ageKey = "30-39";
    else if (age >= 40 && age <= 49) ageKey = "40-49";
    else if (age >= 50 && age <= 59) ageKey = "50-59";
    else ageKey = "60+";

    const ref = table[ageKey as keyof typeof table];
    if (!ref) return '';

    // Parse time "mm:ss" to seconds
    const [min, sec] = timeStr.split(':').map(Number);
    if (isNaN(min) || isNaN(sec)) return '';
    const totalSeconds = min * 60 + sec;

    // Helper to parse threshold string like "< 07:00" or "> 10:00" or "08:01-09:00"
    // Actually we can just compare thresholds strictly based on the reference logic.
    // The reference object has keys: mau, medio, bom, excelente.

    // Parse threshold helper
    const parseThreshold = (t: string): number => {
        // Remove <, > characters and spaces
        const clean = t.replace(/[<>]/g, '').trim();
        // If it's a range start-end, take start? No, need to check how ranges work.
        // Usually ranges are inclusive.
        // Let's parse strictly the bounds. 
        // Example "08:01-09:00" -> 481s to 540s.
        // "< 07:00" -> < 420s.
        // "> 10:00" -> > 600s.

        // However, instead of parsing ranges, let's look at the "Excellent" vs "Good" bounds.
        // Excellent: < X
        // Good: X to Y
        // Medium: Y to Z
        // Poor: > Z

        // We can just check "excelente" threshold first.
        const parts = clean.split('-')[0].trim().split(':');
        return parseInt(parts[0]) * 60 + parseInt(parts[1]);
    };

    // Check Excellent (< X)
    const excLimit = parseThreshold(ref.excelente); // e.g. "07:00" -> 420
    if (totalSeconds < excLimit) return 'Excelente';

    // Check Good (Range, usually starts after Excellent)
    // Actually, let's just use the UPPER bound of Good, or check against ranges.
    // "bom": "07:01-08:00"
    // "medio": "08:01-09:00"

    // Check ranges manually or parse them? 
    // Let's implement a robust check against the "Bom" range bounds.

    const parseRange = (rangeStr: string): [number, number] => {
        const limits = rangeStr.split('-').map(s => {
            const [m, sc] = s.trim().split(':').map(Number);
            return m * 60 + sc;
        });
        return [limits[0], limits[1]];
    };

    // Check Bom range
    const [bomStart, bomEnd] = parseRange(ref.bom);
    if (totalSeconds >= bomStart && totalSeconds <= bomEnd) return 'Bom';

    // Check Medio range
    const [medStart, medEnd] = parseRange(ref.medio);
    if (totalSeconds >= medStart && totalSeconds <= medEnd) return 'Médio';

    // Everything else (slower) is Mau/Fraco
    return 'Fraco / Mau';
}

/**
 * Classify Push-ups Result
 * @param count Number of push-ups
 * @param age User age
 * @param gender User gender
 */
export function classifyPushUps(
    count: number | null | undefined,
    age: number | null | undefined,
    gender: Gender = 'Masculino'
): string {
    if (count === null || count === undefined || !age || age < 10) return '';

    // Normalize gender
    const genderLower = gender.toString().toLowerCase();
    const isMale = genderLower === 'masculino' || genderLower === 'm' || genderLower === 'male';
    const table = isMale ? PUSHUPS_REFERENCES.MALE : PUSHUPS_REFERENCES.FEMALE;

    // Determine age group
    let ageKey = "20-29";
    if (age < 20) ageKey = "20-29";
    else if (age >= 20 && age <= 29) ageKey = "20-29";
    else if (age >= 30 && age <= 39) ageKey = "30-39";
    else if (age >= 40 && age <= 49) ageKey = "40-49";
    else if (age >= 50 && age <= 59) ageKey = "50-59";
    else ageKey = "60+";

    const ref = table[ageKey as keyof typeof table];
    if (!ref) return '';

    // Parse helper for range "X-Y" or "X+"
    const checkRange = (threshold: string, val: number): boolean => {
        if (threshold.includes('+')) {
            const min = parseInt(threshold.replace('+', '').trim());
            return val >= min;
        }
        const [min, max] = threshold.split('-').map(Number);
        return val >= min && val <= max;
    };

    // Check Excelente
    if (checkRange(ref.excelente, count)) return 'Excelente';

    // Check Bom (Order matters if ranges overlap or are contiguous)
    if (checkRange(ref.bom, count)) return 'Bom';

    // Check Medio
    if (checkRange(ref.medio, count)) return 'Médio';

    // Check Mau
    // Usually Mau is 0-X.
    if (checkRange(ref.mau, count)) return 'Fraco / Mau';

    // Fallback? If count is say negative (impossible) or somehow outside gaps (unlikely with these ranges)
    return 'Fraco / Mau';
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
