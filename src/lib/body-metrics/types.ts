export type Gender = 'M' | 'F' | 'Masculino' | 'Feminino' | string;

export type BMIClassification =
    | 'Baixo Peso'
    | 'Peso Normal'
    | 'Pré-obesidade'
    | 'Obesidade Grau I'
    | 'Obesidade Grau II'
    | 'Obesidade Grau III';

export type BodyFatClassification =
    | 'Gordura Vital'
    | 'Excelente (Atleta)'
    | 'Bom (Saudável)'
    | 'Médio (Aceitável)'
    | 'Risco/Obesidade'
    | 'Verifique o Género';

export interface AutoCalculatedMetrics {
    imc: number | null;
    mm: number | null;
    h2o: number | null;
    resultadoIMC: string;
    resultadoPercentMG: string;
}

export interface CalculateAllMetricsInput {
    peso: number | null;
    height: number | null;
    percentualMG: number | null;
    gender: Gender;
    age?: number | null; // For Watson H2O formula
    // Manual overrides - if set, use these instead of calculating
    manualOverrides?: {
        imc?: number | null;
        mm?: number | null;
        h2o?: number | null;
        resultadoIMC?: string | null;
        resultadoPercentMG?: string | null;
    };
}
