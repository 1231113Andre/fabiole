import { TrainingDuration, TrainingType } from "../types";

export function calculatePrice(
    serviceTitle: string,
    trainingFrequency: number,
    trainingDuration: TrainingDuration,
    trainingType: TrainingType
): number {
    let basePrice = 0;

    if (serviceTitle === "Treinos Presenciais") {
        switch (trainingDuration) {
            case "30 minutos":
                basePrice = 22;
                break;
            case "45 minutos":
                basePrice = 28;
                break;
            case "1 hora":
                basePrice = 33;
                break;
        }
    } else if (serviceTitle === "Treinos Online") {
        switch (trainingDuration) {
            case "30 minutos":
                basePrice = 17;
                break;
            case "45 minutos":
                basePrice = 23;
                break;
            case "1 hora":
                basePrice = 28;
                break;
        }
    }

    // Adicionar preços extras para dupla e trio
    if (trainingType === "dupla") {
        switch (trainingDuration) {
            case "30 minutos":
                basePrice += 2;
                break;
            case "45 minutos":
                basePrice += 3;
                break;
            case "1 hora":
                basePrice += 6;
                break;
        }
    } else if (trainingType === "trio") {
        switch (trainingDuration) {
            case "30 minutos":
                basePrice += 4;
                break;
            case "45 minutos":
                basePrice += 7;
                break;
            case "1 hora":
                basePrice += 9;
                break;
        }
    }

    return basePrice * trainingFrequency;
}

