import { Gender } from "./types";
import { MILE_REFERENCES, ABDOMINAIS_REFERENCES, SMI_REFERENCES } from "./references";

/**
 * Classify Mile Test Result (TESTE DA MILHA – aligned with referências table)
 * Returns: Excelente, Bom, Médio, Fraco
 * @param timeStr Time in "mm:ss" string format
 * @param age User age
 * @param gender User gender
 */
export function classifyMileResult(
    timeStr: string | null | undefined,
    age: number | null | undefined,
    gender: Gender = 'Masculino'
): string {
    if (!timeStr || !age || age < 10) return '';

    const genderLower = gender.toString().toLowerCase();
    const isMale = genderLower === 'masculino' || genderLower === 'm' || genderLower === 'male';
    const table = isMale ? MILE_REFERENCES.MALE : MILE_REFERENCES.FEMALE;

    // Age bands: 20-29, 30-39, 40-49, 50-59, 60-69
    let ageKey: keyof typeof table = "20-29";
    if (age < 20) ageKey = "20-29";
    else if (age >= 20 && age <= 29) ageKey = "20-29";
    else if (age >= 30 && age <= 39) ageKey = "30-39";
    else if (age >= 40 && age <= 49) ageKey = "40-49";
    else if (age >= 50 && age <= 59) ageKey = "50-59";
    else ageKey = "60-69";

    const ref = table[ageKey];
    if (!ref || !('excelente' in ref)) return '';

    const excelente = (ref as { excelente: string }).excelente;
    const bom = (ref as { bom: string }).bom;
    const medio = (ref as { medio: string }).medio;
    const fraco = (ref as { fraco: string }).fraco;

    // Parse time "mm:ss" to seconds
    const [min, sec] = timeStr.split(':').map(Number);
    if (isNaN(min) || isNaN(sec)) return '';
    const totalSeconds = min * 60 + sec;

    const parseThreshold = (t: string): number => {
        const clean = t.replace(/[<>]/g, '').trim();
        const part = clean.split('-')[0].trim();
        const [m, s] = part.split(':').map(Number);
        return (m ?? 0) * 60 + (s ?? 0);
    };

    const parseRange = (rangeStr: string): [number, number] => {
        const limits = rangeStr.split('-').map(s => {
            const [m, sc] = s.trim().split(':').map(Number);
            return (m ?? 0) * 60 + (sc ?? 0);
        });
        return [limits[0], limits[1]];
    };

    // Excelente (< X)
    if (excelente && excelente.startsWith('<') && totalSeconds < parseThreshold(excelente)) return 'Excelente';

    // Bom (range)
    if (bom && bom.includes('-')) {
        const [bomStart, bomEnd] = parseRange(bom);
        if (totalSeconds >= bomStart && totalSeconds <= bomEnd) return 'Bom';
    }

    // Médio (range)
    if (medio && medio.includes('-')) {
        const [medStart, medEnd] = parseRange(medio);
        if (totalSeconds >= medStart && totalSeconds <= medEnd) return 'Médio';
    }

    // Fraco (> X)
    if (fraco && fraco.startsWith('>') && totalSeconds > parseThreshold(fraco)) return 'Fraco';

    return 'Fraco';
}

/**
 * Calculate VO2 Max using Rockport Walking Test Formula
 * Formula: 132.853 - (0.0769 × weight_lbs) - (0.3877 × age) + (6.315 × gender_factor) - (3.2649 × time_min) - (0.1565 × heart_rate)
 * Gender Factor: 1 for male, 0 for female
 * @param timeStr Time in "mm:ss"
 * @param heartRate Heart Rate in bpm
 * @param weightKg Weight in kg
 * @param age Age in years
 * @param gender Gender
 */
export function calculateVO2MaxRockport(
    timeStr: string | null | undefined,
    heartRate: number | null | undefined,
    weightKg: number | null | undefined,
    age: number | null | undefined,
    gender: Gender = 'Masculino'
): number | null {
    if (!timeStr || !heartRate || !weightKg || !age) return null;

    // Parse time
    const [min, sec] = timeStr.split(':').map(Number);
    if (isNaN(min) || isNaN(sec)) return null;
    const timeInMinutes = min + (sec / 60);

    // Convert weight to lbs
    const weightLbs = weightKg * 2.20462;

    // Gender factor
    const genderLower = gender.toString().toLowerCase();
    const isMale = genderLower === 'masculino' || genderLower === 'm' || genderLower === 'male';
    const genderFactor = isMale ? 1 : 0;

    // Calculate VO2 Max
    const vo2Validation = 132.853
        - (0.0769 * weightLbs)
        - (0.3877 * age)
        + (6.315 * genderFactor)
        - (3.2649 * timeInMinutes)
        - (0.1565 * heartRate);

    return Math.round(vo2Validation * 10) / 10; // Round to 1 decimal place
}

/**
 * Classify Sit-ups (Abdominais 1') Result – aligned with referências table (Homens/Mulheres)
 * Returns: Excelente, Bom, Médio, Abaixo da Média
 * Age bands from table: 20-29, 30-39, 40-49, 50-59, 60+
 */
export function classifySitUps(
    count: number | null | undefined,
    age: number | null | undefined,
    gender: Gender = 'Masculino'
): string {
    if (count === null || count === undefined || !age || age < 10) return '';

    const genderLower = gender.toString().toLowerCase();
    const isMale = genderLower === 'masculino' || genderLower === 'm' || genderLower === 'male';
    const table = isMale ? ABDOMINAIS_REFERENCES.MALE : ABDOMINAIS_REFERENCES.FEMALE;

    // Age bands: 20-29, 30-39, 40-49, 50-59, 60+
    let ageKey: keyof typeof table = "20-29";
    if (age < 30) ageKey = "20-29";
    else if (age < 40) ageKey = "30-39";
    else if (age < 50) ageKey = "40-49";
    else if (age < 60) ageKey = "50-59";
    else ageKey = "60+";

    const ref = table[ageKey];
    if (!ref || !('excelente' in ref)) return '';

    const excelente = (ref as { excelente: string }).excelente;
    const bom = (ref as { bom: string }).bom;
    const medio = (ref as { medio: string }).medio;
    const abaixoMedia = (ref as { abaixoMedia: string }).abaixoMedia;

    // Excelente: "44+" -> count >= 44
    if (excelente && excelente.includes('+')) {
        const min = parseInt(excelente.replace('+', '').trim(), 10);
        if (!isNaN(min) && count >= min) return 'Excelente';
    }

    // Bom: "39-43"
    if (bom && bom.includes('-')) {
        const parts = bom.split('-').map((s) => parseInt(s.trim(), 10));
        if (parts.length === 2 && !parts.some(isNaN) && count >= parts[0] && count <= parts[1]) return 'Bom';
    }

    // Médio: "35-38"
    if (medio && medio.includes('-')) {
        const parts = medio.split('-').map((s) => parseInt(s.trim(), 10));
        if (parts.length === 2 && !parts.some(isNaN) && count >= parts[0] && count <= parts[1]) return 'Médio';
    }

    // Abaixo da Média: "< 35" -> count < 35
    if (abaixoMedia && abaixoMedia.startsWith('<')) {
        const maxExclusive = parseInt(abaixoMedia.replace('<', '').trim(), 10);
        if (!isNaN(maxExclusive) && count < maxExclusive) return 'Abaixo da Média';
    }

    return 'Abaixo da Média';
}

/**
 * Calculate SMI (Skeletal Muscle Index): SMI = Massa Muscular (kg) / Altura (m)²
 * @param muscleMassKg Muscle mass in kg (MM / LBM)
 * @param heightCm Height in cm
 */
export function calculateSMI(
    muscleMassKg: number | null | undefined,
    heightCm: number | null | undefined
): number | null {
    if (muscleMassKg == null || heightCm == null || heightCm <= 0) return null;
    const heightM = heightCm / 100;
    const smi = muscleMassKg / (heightM * heightM);
    return Math.round(smi * 100) / 100;
}

/**
 * Classify SMI result – Excelente (Atleta), Bom (Saudável), Médio (Normal), Baixo (Risco), Crítico
 * Uses SMI_REFERENCES by gender (no age).
 */
export function classifySMI(
    smiValue: number | null | undefined,
    gender: Gender
): string {
    if (smiValue == null || !Number.isFinite(smiValue)) return '';

    const genderLower = String(gender).toLowerCase();
    const isMale = genderLower === 'masculino' || genderLower === 'm' || genderLower === 'male';
    const ref = isMale ? SMI_REFERENCES.MALE : SMI_REFERENCES.FEMALE;

    if (ref.excelente.max == null && smiValue > ref.excelente.min!) return 'Excelente (Atleta)';
    if (ref.bom.min != null && ref.bom.max != null && smiValue >= ref.bom.min && smiValue <= ref.bom.max) return 'Bom (Saudável)';
    if (ref.medio.min != null && ref.medio.max != null && smiValue >= ref.medio.min && smiValue <= ref.medio.max) return 'Médio (Normal)';
    if (ref.baixo.min != null && ref.baixo.max != null && smiValue >= ref.baixo.min && smiValue <= ref.baixo.max) return 'Baixo (Risco)';
    if (ref.critico.max != null && smiValue < ref.critico.max) return 'Crítico';

    return '';
}
