import { TrainingDuration, TrainingType } from "../types";

export function calculatePrice(
    serviceTitle: string,
    trainingFrequency: number,
    trainingDuration: TrainingDuration,
    trainingType: TrainingType,
    pricingConfig?: Record<string, any>
): number {
    let basePrice = 0;

    if (serviceTitle === "Treinos Presenciais") {
        switch (trainingDuration) {
            case "30 minutos":
                basePrice = pricingConfig?.price_presencial_30min ?? 22;
                break;
            case "45 minutos":
                basePrice = pricingConfig?.price_presencial_45min ?? 28;
                break;
            case "1 hora":
                basePrice = pricingConfig?.price_presencial_1hora ?? 35;
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

    // Adicionar preços extras para dupla e trio
    if (trainingType === "dupla") {
        switch (trainingDuration) {
            case "30 minutos":
                basePrice += pricingConfig?.price_extra_dupla_30min ?? 2;
                break;
            case "45 minutos":
                basePrice += pricingConfig?.price_extra_dupla_45min ?? 3;
                break;
            case "1 hora":
                basePrice += pricingConfig?.price_extra_dupla_1hora ?? 6;
                break;
        }
    } else if (trainingType === "trio") {
        switch (trainingDuration) {
            case "30 minutos":
                basePrice += pricingConfig?.price_extra_trio_30min ?? 4;
                break;
            case "45 minutos":
                basePrice += pricingConfig?.price_extra_trio_45min ?? 7;
                break;
            case "1 hora":
                basePrice += pricingConfig?.price_extra_trio_1hora ?? 9;
                break;
        }
    }

    return basePrice * trainingFrequency;
}

