import { TrainingDuration, TrainingType } from "../types";

/**
 * Calcula o desconto por sessão com base na frequência semanal e no tipo de treino.
 * - Individual: -1€ por sessão adicional (-1€, -2€, -3€, -4€)
 * - Dupla: -4€ na 2x/sem e -2€ por cada sessão adicional subsequente (-4€, -6€, -8€, -10€)
 * - Trio: -3€ por sessão adicional (-3€, -6€, -9€, -12€)
 */
export function getSessionDiscount(
    trainingType: TrainingType,
    frequency: number,
    trainingDuration?: TrainingDuration
): number {
    if (frequency <= 1) return 0;

    switch (trainingType) {
        case "individual":
            // Treinos 45 min têm desconto de 3€ a 3x/sem na tabela oficial (35 -> 34 -> 32 -> 31 -> 30)
            if (trainingDuration === "45 minutos") {
                const discounts = [0, 0, 1, 3, 4, 5];
                return discounts[frequency] ?? (frequency - 1);
            }
            // Linear -1€ por sessão adicional por semana
            return (frequency - 1) * 1;

        case "dupla":
            // Começa com -4€ em 2x/sem e acumula -2€ por cada sessão extra (-4€, -6€, -8€, -10€)
            return 4 + (frequency - 2) * 2;

        case "trio":
            // Linear -3€ por sessão adicional por semana (-3€, -6€, -9€, -12€)
            return (frequency - 1) * 3;

        default:
            return 0;
    }
}

/**
 * Obtém o preço base de 1 sessão (1x/semana) antes de descontos.
 */
export function getBaseSessionPrice(
    serviceTitle: string,
    trainingDuration: TrainingDuration,
    trainingType: TrainingType,
    pricingConfig?: Record<string, any>
): number {
    let basePrice = 0;

    if (serviceTitle === "Treinos Presenciais") {
        switch (trainingDuration) {
            case "30 minutos":
                basePrice = pricingConfig?.price_presencial_30min ?? 30;
                break;
            case "45 minutos":
                basePrice = pricingConfig?.price_presencial_45min ?? 35;
                break;
            case "1 hora":
                basePrice = pricingConfig?.price_presencial_1hora ?? 40;
                break;
        }
    } else if (serviceTitle === "Treinos Online") {
        switch (trainingDuration) {
            case "30 minutos":
                basePrice = pricingConfig?.price_online_30min ?? 18;
                break;
            case "45 minutos":
                basePrice = pricingConfig?.price_online_45min ?? 24;
                break;
            case "1 hora":
                basePrice = pricingConfig?.price_online_1hora ?? 30;
                break;
        }
    }

    // Acréscimo base para Dupla e Trio (valores para 1x/semana)
    if (trainingType === "dupla") {
        switch (trainingDuration) {
            case "30 minutos":
                basePrice += pricingConfig?.price_extra_dupla_30min ?? 10;
                break;
            case "45 minutos":
                basePrice += pricingConfig?.price_extra_dupla_45min ?? 9;
                break;
            case "1 hora":
                basePrice += pricingConfig?.price_extra_dupla_1hora ?? 10;
                break;
        }
    } else if (trainingType === "trio") {
        switch (trainingDuration) {
            case "30 minutos":
                basePrice += pricingConfig?.price_extra_trio_30min ?? 15;
                break;
            case "45 minutos":
                basePrice += pricingConfig?.price_extra_trio_45min ?? 17;
                break;
            case "1 hora":
                basePrice += pricingConfig?.price_extra_trio_1hora ?? 20;
                break;
        }
    }

    return basePrice;
}

/**
 * Calcula o preço unitário por sessão com desconto de frequência aplicado.
 */
export function calculatePricePerSession(
    serviceTitle: string,
    trainingFrequency: number,
    trainingDuration: TrainingDuration,
    trainingType: TrainingType,
    pricingConfig?: Record<string, any>
): number {
    const base = getBaseSessionPrice(serviceTitle, trainingDuration, trainingType, pricingConfig);
    const discount = getSessionDiscount(trainingType, trainingFrequency, trainingDuration);
    return Math.max(0, base - discount);
}

/**
 * Calcula o preço total semanal (Preço por sessão com desconto * Frequência).
 */
export function calculatePrice(
    serviceTitle: string,
    trainingFrequency: number,
    trainingDuration: TrainingDuration,
    trainingType: TrainingType,
    pricingConfig?: Record<string, any>
): number {
    const pricePerSession = calculatePricePerSession(
        serviceTitle,
        trainingFrequency,
        trainingDuration,
        trainingType,
        pricingConfig
    );
    return pricePerSession * trainingFrequency;
}

/**
 * Calcula o total de poupança semanal obtido pelo cliente.
 */
export function calculateSavings(
    serviceTitle: string,
    trainingFrequency: number,
    trainingDuration: TrainingDuration,
    trainingType: TrainingType,
    pricingConfig?: Record<string, any>
): number {
    if (trainingFrequency <= 1) return 0;
    const base = getBaseSessionPrice(serviceTitle, trainingDuration, trainingType, pricingConfig);
    const discountedTotal = calculatePrice(serviceTitle, trainingFrequency, trainingDuration, trainingType, pricingConfig);
    const regularTotal = base * trainingFrequency;
    return Math.max(0, regularTotal - discountedTotal);
}



