export interface PersonalInfo {
    userName: string;
    userSurname: string;
    userEmail: string;
    userPhone: string;
    userBirth: string;
    trainingCredit: string;
    trainingsScheduled: string;
    debtValue: string;
    paid: string;
    q1: string;
    q2: string;
    q3: string;
    q4: string;
    goals: string;
    notes: string;
    age: string;
    // Legacy fields
    notas?: string;
    inicio?: string;
}

export interface Pesagem {
    data: string;
    peso: string;
    percentualMG: string;
    MM: string;
    H2O: string;
    IMC: string;
    gordVisceral: string;
    IDMetabolica: string;
    massaOssea: string;
    height: string;
    resultadoIMC: string;
    resultadoPercentualMG: string;
    notas: string;
}

export interface PerimetroCorporal {
    date: string;
    msRight: string;
    msRightFlex: string;
    msLeft: string;
    msLeftFlex: string;
    chest: string;
    waist: string;
    abdomen: string;
    hips: string;
    thighR: string;
    thighL: string;
}

export interface AvaliacaoFisica {
    date: string;
    pushUps: string;
    sitUps: string;
    mile: string;
    mileResult: string;
    notes: string;
}

export interface UserSheetData {
    personalInfo: PersonalInfo;
    pesagens: Pesagem[];
    perimetros: PerimetroCorporal[];
    avaliacoes: AvaliacaoFisica[];
    referenceTables: any;
}
