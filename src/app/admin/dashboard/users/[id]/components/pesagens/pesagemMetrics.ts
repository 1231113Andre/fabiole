/**
 * Body metrics calculations helper for Pesagem records.
 * Uses centralized functions from @/lib/utils/bodyMetrics
 */

import {
    calculateBMI,
    classifyBMI,
    classifyBodyFat,
    calculateMM,
    calculateH2OFull,
    getBmiClassColor,
    getFatClassColor,
    getDeltaPesoColor,
    getBmiIcon,
    getFatIcon,
    BADGE_STYLES
} from "@/lib/utils/bodyMetrics";
import { Pesagem } from "../../types";

// Re-export color functions for backward compatibility
export { getBmiClassColor, getFatClassColor, getDeltaPesoColor, getBmiIcon, getFatIcon, BADGE_STYLES };

export interface PesagemMetrics {
    bmi: number | null;
    bmiClass: string;
    fatClass: string;
    mm: number | null;
    h2o: number | null;
    h2oKg: number | null; // For tooltip display
    deltaPeso: string;
}

/**
 * Calculate all metrics for a single Pesagem record.
 * @param pesagem - The pesagem record
 * @param gender - User's gender for body fat classification and H2O calculation
 * @param userAge - User's age for Watson H2O formula (optional, defaults to 30 if not provided)
 * @param previousPesagem - Previous pesagem for delta calculation
 */
export function calculatePesagemMetrics(
    pesagem: Pesagem,
    gender: string,
    userAge?: number | null,
    previousPesagem?: Pesagem
): PesagemMetrics {
    const bmi = calculateBMI(pesagem.peso, pesagem.height);
    const bmiClass = classifyBMI(bmi || pesagem.imc);
    const fatClass = classifyBodyFat(pesagem.percentualMG, gender);

    // MM (LBM) - uses new formula: peso × (1 - %MG / 100)
    const mm = calculateMM(pesagem.peso, pesagem.percentualMG);

    // H2O - uses Watson formula with height and age (returns % and kg)
    const h2oResult = calculateH2OFull(pesagem.peso, pesagem.height, userAge ?? null, gender);

    let deltaPeso = '-';
    if (previousPesagem && pesagem.peso && previousPesagem.peso) {
        const delta = pesagem.peso - previousPesagem.peso;
        deltaPeso = (delta > 0 ? '+' : '') + delta.toFixed(1) + ' kg';
    }

    return {
        bmi,
        bmiClass,
        fatClass,
        mm,
        h2o: h2oResult.percent,
        h2oKg: h2oResult.kg,
        deltaPeso
    };
}
