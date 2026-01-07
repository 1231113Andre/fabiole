import { Gender } from "./types";
import { MILE_REFERENCES, PUSHUPS_REFERENCES } from "./references";

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
    const parseThreshold = (t: string): number => {
        const clean = t.replace(/[<>]/g, '').trim();
        const parts = clean.split('-')[0].trim().split(':');
        return parseInt(parts[0]) * 60 + parseInt(parts[1]);
    };

    // Check Excellent (< X)
    const excLimit = parseThreshold(ref.excelente); // e.g. "07:00" -> 420
    if (totalSeconds < excLimit) return 'Excelente';

    // Check Good/Medium using range parser
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
    if (checkRange(ref.mau, count)) return 'Fraco / Mau';

    return 'Fraco / Mau';
}
