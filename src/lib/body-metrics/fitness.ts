import { Gender } from "./types";
import { MILE_THRESHOLDS, ABDOMINAIS_THRESHOLDS, FLEXOES_THRESHOLDS, SMI_REFERENCES } from "./references";
import type { CountThresholds } from "./references";

/** Map age to array index: 0=18-29, 1=30-39, 2=40-49, 3=50-59, 4=60+ */
function ageBandIdx(age: number): number {
    if (age < 30) return 0;
    if (age < 40) return 1;
    if (age < 50) return 2;
    if (age < 60) return 3;
    return 4;
}

function isMaleGender(gender: Gender): boolean {
    const g = gender.toString().toLowerCase();
    return g === 'masculino' || g === 'm' || g === 'male';
}

function classifyByCount(count: number, t: CountThresholds, lowLabel: string): string {
    if (count >= t.excelente) return 'Excelente';
    if (count >= t.bomMin) return 'Bom';
    if (count >= t.medioMin) return 'Médio';
    return lowLabel;
}

/**
 * Classify Push-ups (Flexões 1') Result
 * Age bands: 18-29, 30-39, 40-49, 50-59, 60+
 * Returns: Excelente, Bom, Médio, Mau
 */
export function classifyPushUps(
    count: number | null | undefined,
    age: number | null | undefined,
    gender: Gender = 'Masculino'
): string {
    if (count == null || !age || age < 10) return '';
    const table = isMaleGender(gender) ? FLEXOES_THRESHOLDS.MALE : FLEXOES_THRESHOLDS.FEMALE;
    return classifyByCount(count, table[ageBandIdx(age)], 'Mau');
}


/**
 * Classify Mile Test Result (TESTE DA MILHA)
 * Age bands: 18-29, 30-39, 40-49, 50-59, 60+
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

    const parts = timeStr.split(':');
    if (parts.length !== 2) return '';
    const min = parseInt(parts[0], 10);
    const sec = parseInt(parts[1], 10);
    if (isNaN(min) || isNaN(sec)) return '';
    const totalSec = min * 60 + sec;

    const table = isMaleGender(gender) ? MILE_THRESHOLDS.MALE : MILE_THRESHOLDS.FEMALE;
    const t = table[ageBandIdx(age)];

    if (totalSec < t.excelente) return 'Excelente';
    if (totalSec <= t.bomMax) return 'Bom';
    if (totalSec <= t.medioMax) return 'Médio';
    return 'Fraco';
}

/**
 * Calculate VO2 Max using Rockport Walking Test (1-Mile Walk Test)
 * 
 * The Rockport Walking Test is a submaximal exercise test used to estimate VO2 max
 * (maximal oxygen uptake), which is the gold standard measure of cardiorespiratory fitness.
 * 
 * Formula (Kline et al., 1987):
 * VO2max = 132.853 - (0.0769 × weight_lbs) - (0.3877 × age) + (6.315 × gender) 
 *          - (3.2649 × time_min) - (0.1565 × heart_rate)
 * 
 * Where:
 * - weight_lbs: Body weight in pounds
 * - age: Age in years
 * - gender: 1 for male, 0 for female
 * - time_min: Time to complete 1 mile walk in minutes (decimal)
 * - heart_rate: Heart rate immediately after completing the walk (bpm)
 * 
 * Test protocol:
 * 1. Walk 1 mile (1.6 km) as fast as possible on a flat surface
 * 2. Record time to complete the mile
 * 3. Measure heart rate immediately upon completion
 * 
 * VO2 max interpretation (ml/kg/min):
 * - Excellent: >50 (men), >45 (women)
 * - Good: 43-50 (men), 36-45 (women)
 * - Average: 35-42 (men), 28-35 (women)
 * - Below Average: <35 (men), <28 (women)
 * 
 * References:
 * - Kline, G.M., et al. (1987). "Estimation of VO2max from a one-mile track walk, gender, age, and body weight". 
 *   Medicine and Science in Sports and Exercise, 19(3), 253-259.
 * - ACSM (2018). "ACSM's Guidelines for Exercise Testing and Prescription" (10th ed.). Wolters Kluwer.
 * 
 * @param timeStr - Time to complete 1 mile in "mm:ss" format
 * @param heartRate - Heart rate immediately after walk (bpm)
 * @param weightKg - Body weight in kilograms
 * @param age - Age in years
 * @param gender - Gender ('M'/'Masculino' or 'F'/'Feminino')
 * @returns Estimated VO2 max in ml/kg/min, rounded to 1 decimal place, or null if invalid input
 */
export function calculateVO2MaxRockport(
    timeStr: string | null | undefined,
    heartRate: number | null | undefined,
    weightKg: number | null | undefined,
    age: number | null | undefined,
    gender: Gender = 'Masculino'
): number | null {
    if (!timeStr || !heartRate || !weightKg || !age) return null;

    // Parse time from "mm:ss" format
    const [min, sec] = timeStr.split(':').map(Number);
    if (isNaN(min) || isNaN(sec)) return null;
    const timeInMinutes = min + (sec / 60);

    // Convert weight to pounds (formula requires lbs)
    const weightLbs = weightKg * 2.20462;

    // Gender factor: 1 for male, 0 for female
    const genderFactor = isMaleGender(gender) ? 1 : 0;

    // Calculate VO2 Max using Kline et al. (1987) formula
    const vo2max = 132.853
        - (0.0769 * weightLbs)
        - (0.3877 * age)
        + (6.315 * genderFactor)
        - (3.2649 * timeInMinutes)
        - (0.1565 * heartRate);

    return Math.round(vo2max * 10) / 10; // Round to 1 decimal place
}

/**
 * Classify Sit-ups (Abdominais 1') Result
 * Age bands: 18-29, 30-39, 40-49, 50-59, 60+
 * Returns: Excelente, Bom, Médio, Abaixo da Média
 */
export function classifySitUps(
    count: number | null | undefined,
    age: number | null | undefined,
    gender: Gender = 'Masculino'
): string {
    if (count == null || !age || age < 10) return '';
    const table = isMaleGender(gender) ? ABDOMINAIS_THRESHOLDS.MALE : ABDOMINAIS_THRESHOLDS.FEMALE;
    return classifyByCount(count, table[ageBandIdx(age)], 'Abaixo da Média');
}

/**
 * Calculate SMI (Skeletal Muscle Index)
 * 
 * SMI is used to assess muscle mass relative to height, similar to BMI but for muscle mass.
 * It's particularly useful for identifying sarcopenia (age-related muscle loss) and monitoring
 * muscle mass changes during training or rehabilitation.
 * 
 * Formula: SMI = Skeletal Muscle Mass (kg) / Height (m)²
 * 
 * Note: This uses appendicular skeletal muscle mass (ASM) or total lean body mass (LBM).
 * The formula is analogous to BMI but uses muscle mass instead of total body weight.
 * 
 * Clinical significance:
 * - Low SMI is associated with sarcopenia, frailty, and increased mortality risk
 * - High SMI indicates good muscle mass and physical function
 * - Used in clinical settings to diagnose and monitor muscle-related conditions
 * 
 * References:
 * - Janssen, I., et al. (2002). "Skeletal muscle cutpoints associated with elevated physical disability 
 *   risk in older men and women". American Journal of Epidemiology, 156(2), 110-121.
 * - Baumgartner, R.N., et al. (1998). "Epidemiology of sarcopenia among the elderly in New Mexico". 
 *   American Journal of Epidemiology, 147(8), 755-763.
 * - Cruz-Jentoft, A.J., et al. (2019). "Sarcopenia: revised European consensus on definition and diagnosis". 
 *   Age and Ageing, 48(1), 16-31.
 * 
 * @param muscleMassKg - Skeletal muscle mass or lean body mass in kilograms
 * @param heightCm - Height in centimeters
 * @returns SMI value in kg/m², rounded to 2 decimal places, or null if invalid input
 */
export function calculateSMI(
    muscleMassKg: number | null | undefined,
    heightCm: number | null | undefined
): number | null {
    if (muscleMassKg == null || heightCm == null || heightCm <= 0 || muscleMassKg <= 0) return null;
    const heightM = heightCm / 100;
    const smi = muscleMassKg / (heightM * heightM);
    return Math.round(smi * 100) / 100;
}

/**
 * Classify SMI (Skeletal Muscle Index) result
 * 
 * Classifications based on validated cutoff points for sarcopenia and muscle mass assessment.
 * These thresholds are gender-specific but not age-dependent in this implementation.
 * 
 * Classifications:
 * - Excelente (Atleta): High muscle mass - typical for athletes and highly trained individuals
 * - Bom (Saudável): Good/Healthy muscle mass - optimal for general health
 * - Médio (Normal): Average muscle mass - within normal range
 * - Baixo (Risco): Low muscle mass - at risk for sarcopenia
 * - Crítico: Very low muscle mass - sarcopenia present, requires intervention
 * 
 * Cutoff points based on:
 * - Janssen et al. (2002): SMI < 8.50 kg/m² (men), < 5.75 kg/m² (women) for Class II sarcopenia
 * - Baumgartner et al. (1998): 2 SD below young adult mean
 * - European Working Group on Sarcopenia (EWGSOP2, 2019)
 * 
 * @param smiValue - SMI value in kg/m²
 * @param gender - Gender ('M'/'Masculino' or 'F'/'Feminino')
 * @returns Classification string or empty string if invalid
 */
export function classifySMI(
    smiValue: number | null | undefined,
    gender: Gender
): string {
    if (smiValue == null || !Number.isFinite(smiValue)) return '';

    const ref = isMaleGender(gender) ? SMI_REFERENCES.MALE : SMI_REFERENCES.FEMALE;

    if (smiValue > ref.excelente.min!) return 'Excelente (Atleta)';
    if (smiValue >= ref.bom.min!) return 'Bom (Saudável)';
    if (smiValue >= ref.medio.min!) return 'Médio (Normal)';
    if (smiValue >= ref.baixo.min!) return 'Baixo (Risco)';
    return 'Crítico';
}
