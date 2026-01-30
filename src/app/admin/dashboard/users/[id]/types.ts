import { AccountStatus } from "@/app/admin/types";

export interface UserData {
    id: string;
    name: string;
    surname: string;
    email: string;
    createdAt: string;
    phone: string;
    birth: string;
    role: string;
    gender: string;
    trainingCredit: number;
    trainingsScheduled: number;
    debtValue: number;
    goals: string;
    notes: string;
    paid: string | boolean;
    avatarUrl: string | null;
    status: string;
    statusChangedBy: string | null;
    statusChangedAt: string | null;
    statusReason: string | null;
    pesagens: Pesagem[];
    perimetros: Perimetro[];
    avaliacoes: Avaliacao[];
    updatedAt: string;
}

export interface Pesagem {
    id: number;
    date: string;
    peso: number | null;
    percentualMG: number | null;
    mm: number | null;
    h2o: number | null;
    imc: number | null;
    gordVisceral: number | null;
    idMetabolica: number | null;
    massaOssea: number | null;
    height: number | null;
    smi: number | null;
    resultadoIMC: string | null;
    resultadoPercentMG: string | null;
    notas: string | null;
}

export interface Perimetro {
    id: number;
    date: string;
    msRight: number | null;
    msRightFlex: number | null;
    msLeft: number | null;
    msLeftFlex: number | null;
    chest: number | null;
    waist: number | null;
    abdomen: number | null;
    hips: number | null;
    thighR: number | null;
    thighL: number | null;
}

export interface Avaliacao {
    id: number;
    date: string;
    pushUps: number | null;
    sitUps: number | null;
    mile: string | null;
    mileResult: string | null;
    pushUpsResult: string | null;
    notes: string | null;
}

export type Tab = 'info' | 'pesagens' | 'perimetros' | 'avaliacoes' | 'definicoes';
