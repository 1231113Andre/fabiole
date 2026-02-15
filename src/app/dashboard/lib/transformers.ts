// Output Types (UI - Numbers)
import {
    Pesagem,
    PerimetroCorporal,
    AvaliacaoFisica,
    ChartData,
    DashboardStats,
    ReferenceTables,
    PersonalInfo,
} from "../types";

// Input Types (Sheets - Strings)
import {
    UserSheetData,
    Pesagem as SheetPesagem,
    PerimetroCorporal as SheetPerimetro,
    AvaliacaoFisica as SheetAvaliacao
} from "@/lib/types/dashboard";

// Simple utility functions (re-implemented or imported if they were in a shared util)
// Assuming these were in a utils file, but for safety in this refactor, I will copy the logic 
// or import them if I can find where they are. 
// The original file imported from "../utils/dataUtils". 
// Let's assume we can import them from there if the path is accessible.
import { parseDate, parseNumber, round, calculateBMI } from "../utils/dataUtils";

// Note: We use SheetPesagem etc. as input (strings) and convert to Pesagem etc. (numbers)

/**
 * Transform raw pesagens data to typed format
 */
export function transformPesagens(rawPesagens: SheetPesagem[]): Pesagem[] {
    if (!rawPesagens) return [];

    const pesagens = rawPesagens
        .map((p) => {
            const peso = parseNumber(p.peso);
            const heightCm = parseNumber(p.height);

            // Calculate BMI if not provided
            let imc = parseNumber(p.IMC);
            let isIMCCalculated = false;
            if (imc === 0 && peso > 0 && heightCm > 0) {
                const calculatedBmi = calculateBMI(peso, heightCm);
                if (calculatedBmi !== null) {
                    imc = calculatedBmi;
                    isIMCCalculated = true;
                }
            }

            return {
                data: p.data,
                peso,
                percentualMG: parseNumber(p.percentualMG),
                MM: parseNumber(p.MM),
                H2O: parseNumber(p.H2O),
                IMC: imc,
                isIMCCalculated,
                gordVisceral: parseNumber(p.gordVisceral),
                IDMetabolica: parseNumber(p.IDMetabolica),
                massaOssea: parseNumber(p.massaOssea),
                resultadoIMC: p.resultadoIMC || "",
                resultadoPercentualMG: p.resultadoPercentualMG || "",
                notas: p.notas || "",
                height: heightCm,
                msRight: parseNumber(p.msRight),
                msLeft: parseNumber(p.msLeft),
                miRight: parseNumber(p.miRight),
                miLeft: parseNumber(p.miLeft),
            } as Pesagem;
        })
        .filter((p) => p.peso > 0)
        .sort((a, b) => parseDate(b.data) - parseDate(a.data));

    // Calculate delta peso
    pesagens.forEach((pesagem, index) => {
        if (index < pesagens.length - 1) {
            const previous = pesagens[index + 1];
            pesagem.deltaPeso = round(pesagem.peso - previous.peso);
        }
    });

    return pesagens;
}

/**
 * Transform raw perimetros data to typed format
 */
export function transformPerimetros(rawPerimetros: SheetPerimetro[]): PerimetroCorporal[] {
    if (!rawPerimetros) return [];

    return rawPerimetros
        .map((p) => ({
            date: p.date,
            msRight: parseNumber(p.msRight),
            msRightFlex: parseNumber(p.msRightFlex),
            msLeft: parseNumber(p.msLeft),
            msLeftFlex: parseNumber(p.msLeftFlex),
            chest: parseNumber(p.chest),
            waist: parseNumber(p.waist),
            abdomen: parseNumber(p.abdomen),
            hips: parseNumber(p.hips),
            thighR: parseNumber(p.thighR),
            thighL: parseNumber(p.thighL),
        }))
        .filter((p) => p.chest > 0 || p.waist > 0)
        .sort((a, b) => parseDate(b.date) - parseDate(a.date));
}

/**
 * Transform raw avaliacoes data to typed format
 */
export function transformAvaliacoes(rawAvaliacoes: SheetAvaliacao[]): AvaliacaoFisica[] {
    if (!rawAvaliacoes) return [];

    return rawAvaliacoes
        .map((a) => ({
            date: a.date,
            pushUps: parseNumber(a.pushUps),
            sitUps: parseNumber(a.sitUps),
            mile: a.mile || "",
            mileResult: a.mileResult || "",
            pushUpsResult: a.pushUpsResult || "",
            notes: a.notes || "",
        }))
        .filter((a) => a.pushUps > 0 || a.sitUps > 0 || a.mile)
        .sort((a, b) => parseDate(b.date) - parseDate(a.date));
}

/**
 * Prepare chart data from pesagens (sorted oldest first)
 */
export function prepareChartData(pesagens: Pesagem[]): ChartData[] {
    return [...pesagens].reverse().map((p) => ({
        data: p.data,
        peso: p.peso,
        massaGorda: p.percentualMG,
        massaMuscular: p.MM,
        gorduraVisceral: p.gordVisceral,
        IMC: p.IMC,
    }));
}

/**
 * Calculate dashboard statistics
 */
export function calculateStats(
    pesagens: Pesagem[],
    perimetros: PerimetroCorporal[],
    avaliacoes: AvaliacaoFisica[]
): DashboardStats {
    const latestPesagem = pesagens.length > 0 ? pesagens[0] : null;
    const latestPerimetro = perimetros.length > 0 ? perimetros[0] : null;
    const latestAvaliacao = avaliacoes.length > 0 ? avaliacoes[0] : null;

    const weightTrend = pesagens.length >= 2
        ? round(pesagens[0].peso - pesagens[1].peso)
        : 0;

    return {
        latestPesagem,
        latestPerimetro,
        latestAvaliacao,
        weightTrend,
        totalPesagens: pesagens.length,
        totalPerimetros: perimetros.length,
        totalAvaliacoes: avaliacoes.length,
    };
}

/**
 * Transform UserSheetData into PersonalInfo structure for UI
 */
export function transformPersonalInfo(userData: UserSheetData, lastWeight?: number): PersonalInfo {
    return {
        name: userData.personalInfo.userName,
        surname: userData.personalInfo.userSurname,
        email: userData.personalInfo.userEmail,
        birthDate: userData.personalInfo.userBirth,
        phone: userData.personalInfo.userPhone || "",
        height: "", // Not available in standard fields yet
        weight: lastWeight ? `${lastWeight} kg` : "",
        goals: userData.personalInfo.goals || userData.personalInfo.notas || "",
        notes: userData.personalInfo.notes || "",
        trainingCredit: userData.personalInfo.trainingCredit || "",
        trainingsScheduled: userData.personalInfo.trainingsScheduled || "",
        debtValue: userData.personalInfo.debtValue || "",
        paid: userData.personalInfo.paid || "",
        q1: userData.personalInfo.q1 || "",
        q2: userData.personalInfo.q2 || "",
        q3: userData.personalInfo.q3 || "",
        q4: userData.personalInfo.q4 || "",
        age: userData.personalInfo.age || "",
        gender: userData.personalInfo.gender || "masculino", // Default validation
        birth: userData.personalInfo.userBirth || "", // Alias for userBirth
        avatarUrl: userData.personalInfo.avatarUrl || undefined,
    };
}

export interface TransformedDashboardData {
    personalInfo: PersonalInfo | null;
    pesagens: Pesagem[];
    perimetros: PerimetroCorporal[];
    avaliacoes: AvaliacaoFisica[];
    referenceTables: ReferenceTables;
    chartData: ChartData[];
    stats: DashboardStats;
}

/**
 * Main transformation function
 */
export function transformDashboardData(userData: UserSheetData | null | undefined): TransformedDashboardData {
    // Default empty state
    const emptyState: TransformedDashboardData = {
        personalInfo: null,
        pesagens: [],
        perimetros: [],
        avaliacoes: [],
        referenceTables: {},
        chartData: [],
        stats: {
            latestPesagem: null,
            latestPerimetro: null,
            latestAvaliacao: null,
            weightTrend: 0,
            totalPesagens: 0,
            totalPerimetros: 0,
            totalAvaliacoes: 0,
        },
    };

    if (!userData) return emptyState;

    // Transform data arrays
    const pesagens = transformPesagens(userData.pesagens || []);
    const perimetros = transformPerimetros(userData.perimetros || []);
    const avaliacoes = transformAvaliacoes(userData.avaliacoes || []);
    // Load static reference data
    const staticReferences: ReferenceTables = {
        massaGordaMasculino: require("@/lib/data/references/male/massa_gorda.json"),
        massaGordaFeminino: require("@/lib/data/references/female/massa_gorda.json"),
        flexoesMasculino: require("@/lib/data/references/male/flexoes.json"),
        flexoesFeminino: require("@/lib/data/references/female/flexoes.json"),
        abdominaisMasculino: require("@/lib/data/references/male/abdominais.json"),
        abdominaisFeminino: require("@/lib/data/references/female/abdominais.json"),
        milhaMasculino: require("@/lib/data/references/male/teste_milha.json"),
        milhaFeminino: require("@/lib/data/references/female/teste_milha.json"),
        smiMasculino: require("@/lib/data/references/male/smi.json"),
        smiFeminino: require("@/lib/data/references/female/smi.json"),
    };

    const referenceTables = {
        ...staticReferences,
        ...(userData.referenceTables || {})
    } as ReferenceTables;

    // Transform personal info
    const lastWeight = pesagens.length > 0 ? pesagens[0].peso : undefined;
    const personalInfo = transformPersonalInfo(userData, lastWeight);

    // Prepare derived data
    const chartData = prepareChartData(pesagens);
    const stats = calculateStats(pesagens, perimetros, avaliacoes);

    return {
        personalInfo,
        pesagens,
        perimetros,
        avaliacoes,
        referenceTables,
        chartData,
        stats,
    };
}
