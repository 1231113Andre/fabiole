export interface PersonalInfo {
    name: string;
    email: string;
    birthDate: string;
    phone?: string;
    height?: string;
    weight?: string;
    goals?: string;
    notes?: string;
    lastUpdate?: string;
    trainingCredit?: string;
    trainingsScheduled?: string;
    debtValue?: string;
    paid?: string;
    q1?: string;
    q2?: string;
    q3?: string;
    q4?: string;
}

export interface Pesagem {
    data: string;
    peso: number;
    percentualMG: number;
    MM: number;
    H2O: number;
    IMC: number;
    gordVisceral: number;
    IDMetabolica: number;
    massaOssea: number;
    resultadoIMC: string;
    resultadoPercentualMG: string;
    notas?: string;
}

export interface PerimetroCorporal {
    date: string;      // DATE 📅
    msRight: number;   // MS RIGHT
    msRightFlex: number; // MS RIGHT FLEX
    msLeft: number;    // MS LEFT
    msLeftFlex: number;  // MS LEFT FLEX
    chest: number;     // CHEST
    waist: number;     // WAIST
    abdomen: number;   // ABDOMEN
    hips: number;      // HIPS
    thighR: number;    // THIGH R
    thighL: number;    // THIGH L
}

export interface AvaliacaoFisica {
    date: string;
    pushUps: number;
    sitUps: number;
    mile: string;
    mileResult: string;
    notes: string;
}

export type TabType = "overview" | "personal" | "pesagens" | "perimetros" | "avaliacoes" | "referencias";

export interface ReferenceTableData {
    excelente?: string;
    bom?: string;
    medio?: string;
    mau?: string;
    percent?: string;
    description?: string;
}

export interface ReferenceTableCategory {
    [key: string]: ReferenceTableData;
}

export interface ImcReference {
    magreza?: string;
    normal?: string;
    sobrepeso?: string;
    obesidade?: string;
}

export interface ReferenceTables {
    massaGordaMasculino?: ReferenceTableCategory;
    massaGordaFeminino?: ReferenceTableCategory;
    imc?: ImcReference;
    flexoesFeminino?: ReferenceTableCategory;
    flexoesMasculino?: ReferenceTableCategory;
    abdominaisFeminino?: ReferenceTableCategory;
    abdominaisMasculino?: ReferenceTableCategory;
    milhaFeminino?: ReferenceTableCategory;
    milhaMasculino?: ReferenceTableCategory;
}

export interface ChartData {
    data: string;
    peso: number;
    massaGorda: number;
    massaMuscular: number;
    gorduraVisceral: number;
    IMC: number;
}

export interface DashboardStats {
    latestPesagem: Pesagem | null;
    latestPerimetro: PerimetroCorporal | null;
    latestAvaliacao: AvaliacaoFisica | null;
    weightTrend: number;
    totalPesagens: number;
    totalPerimetros: number;
    totalAvaliacoes: number;
}
