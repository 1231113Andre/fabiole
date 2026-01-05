export interface ServiceFeature {
    text: string;
    icon: string;
    important?: boolean;
    highlightWords?: string[];
}

export interface ServicePrice {
    amount: string;
    unit: string;
    prefix: string;
}

export interface Service {
    title: string;
    titleIcon?: string;
    desc: string;
    price: ServicePrice | string;
    features?: ServiceFeature[];
    icon: string;
    color: string;
    popular?: boolean;
    pdf?: string;
}

export type TrainingDuration = "30 minutos" | "45 minutos" | "1 hora";
export type TrainingType = "individual" | "dupla" | "trio";

