import { BMIClassification } from "./types";
import { BADGE_STYLES } from "./constants";

/**
 * Calculate BMI (Body Mass Index) from weight and height
 * 
 * Formula: BMI = weight (kg) / height (m)²
 * 
 * Reference: World Health Organization (WHO)
 * - Keys, A., et al. (1972). "Indices of relative weight and obesity". Journal of Chronic Diseases.
 * - WHO (2000). "Obesity: preventing and managing the global epidemic". WHO Technical Report Series 894.
 * 
 * @param weightKg - Body weight in kilograms
 * @param heightCm - Height in centimeters
 * @returns BMI value rounded to 1 decimal place, or null if invalid input
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
 * Classify BMI value according to WHO standards
 * 
 * WHO BMI Classification (for adults):
 * - < 18.5: Underweight (Baixo Peso)
 * - 18.5-24.9: Normal weight (Peso Normal)
 * - 25.0-29.9: Pre-obesity (Pré-obesidade)
 * - 30.0-34.9: Obesity class I (Obesidade Grau I)
 * - 35.0-39.9: Obesity class II (Obesidade Grau II)
 * - ≥ 40.0: Obesity class III (Obesidade Grau III)
 * 
 * Reference: WHO (2000). "Obesity: preventing and managing the global epidemic"
 * 
 * @param bmi - BMI value to classify
 * @returns Classification string or empty string if invalid
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
    if (bmiClass === 'Pré-obesidade' || bmiClass === 'Obesidade Grau I') return BADGE_STYLES.YELLOW;
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
