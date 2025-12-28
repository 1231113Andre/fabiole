/**
 * Body metrics calculations helper for Pesagem records.
 * Uses centralized functions from @/lib/utils/bodyMetrics
 */

import {
    calculateBMI,
    classifyBMI,
    classifyBodyFat,
    calculateMM,
    calculateH2O,
    getBmiClassColor,
    getFatClassColor,
    getDeltaPesoColor
} from "@/lib/utils/bodyMetrics";
import { Pesagem } from "../../types";

// Re-export color functions for backward compatibility
export { getBmiClassColor, getFatClassColor, getDeltaPesoColor };

export interface PesagemMetrics {
    bmi: number | null;
    bmiClass: string;
    fatClass: string;
    mm: number | null;
    h2o: number | null;
    deltaPeso: string;
}

/**
 * Calculate all metrics for a single Pesagem record.
 */
export function calculatePesagemMetrics(
    pesagem: Pesagem,
    gender: string,
    previousPesagem?: Pesagem
): PesagemMetrics {
    const bmi = calculateBMI(pesagem.peso, pesagem.height);
    const bmiClass = classifyBMI(bmi || pesagem.imc);
    const fatClass = classifyBodyFat(pesagem.percentualMG, gender);
    const mm = calculateMM(pesagem.peso, pesagem.percentualMG, pesagem.massaOssea);
    const h2o = calculateH2O(pesagem.peso, gender);

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
        h2o,
        deltaPeso
    };
}
