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
    data: string;
    msDrt: number;
    msDrtCon: number;
    msEsq: number;
    msEsqCon: number;
    peito: number;
    cintura: number;
    abdominal: number;
    anca: number;
    miDrt: number;
    miEsq: number;
}

export interface AvaliacaoFisica {
    data: string;
    flexoes1min: number;
    abdominais1min: number;
    milha: string;
    resultadoMilha: string;
}

export type TabType = "overview" | "personal" | "pesagens" | "perimetros" | "avaliacoes" | "referencias";

export interface ReferenceTableData {
    excelente?: string;
    bom?: string;
    medio?: string;
    mau?: string;
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
