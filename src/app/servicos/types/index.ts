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
    /** Botão principal que abre um PDF (substitui o botão por defeito). */
    pdf?: ServiceLink;
    /** Botão secundário (ex.: mailto) mostrado por baixo do principal. */
    secondaryAction?: ServiceLink;
    /** Não abre o modal de preços; o botão leva diretamente à página de contacto. */
    contactOnly?: boolean;
    /** Chave das definições de onde vem o preço (preço em texto). */
    priceSettingKey?: string;
}

export interface ServiceLink {
    label: string;
    href: string;
    icon?: string;
}

export type TrainingDuration = "30 minutos" | "45 minutos" | "1 hora";
export type TrainingType = "individual" | "dupla" | "trio";



