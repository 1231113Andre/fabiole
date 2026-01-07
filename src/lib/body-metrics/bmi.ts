import { BMIClassification } from "./types";
import { BADGE_STYLES } from "./constants";

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
