"use client";

import { useMemo } from "react";
import { useSession } from "@/lib/react-query/hooks/useAuth";
import { useUserData } from "@/lib/react-query/hooks/useUserData";
import { parseDate, parseNumber, round, calculateBMI } from "../utils/dataUtils";
import {
    PersonalInfo,
    Pesagem,
    PerimetroCorporal,
    AvaliacaoFisica,
    ReferenceTables,
    ChartData,
    DashboardStats,
} from "../types";

interface RawPesagem {
    data: string;
    peso: string | number;
    height: string | number;
    IMC: string | number;
    percentualMG: string | number;
    MM: string | number;
    H2O: string | number;
    gordVisceral: string | number;
    IDMetabolica: string | number;
    massaOssea: string | number;
    resultadoIMC: string;
    resultadoPercentualMG: string;
    notas?: string;
}

interface RawPerimetro {
    date: string;
    msRight: string | number;
    msRightFlex: string | number;
    msLeft: string | number;
    msLeftFlex: string | number;
    chest: string | number;
    waist: string | number;
    abdomen: string | number;
    hips: string | number;
    thighR: string | number;
    thighL: string | number;
}

interface RawAvaliacao {
    date: string;
    pushUps: string | number;
    sitUps: string | number;
    mile: string;
    mileResult: string;
    notes?: string;
}

interface TransformedData {
    personalInfo: PersonalInfo | null;
    pesagens: Pesagem[];
    perimetros: PerimetroCorporal[];
    avaliacoes: AvaliacaoFisica[];
    referenceTables: ReferenceTables;
    chartData: ChartData[];
    stats: DashboardStats;
}

interface UseDashboardDataResult extends TransformedData {
    isLoading: boolean;
    isRefreshing: boolean;
    error: Error | null;
    user: { name: string; surname: string; email: string; birth: string } | undefined;
    isAuthenticated: boolean;
    refetch: () => Promise<unknown>;
}

/**
 * Transform raw pesagens data to typed format
 */
function transformPesagens(rawPesagens: RawPesagem[]): Pesagem[] {
    const pesagens = rawPesagens
        .map((p) => {
            const peso = parseNumber(p.peso);
            const heightCm = parseNumber(p.height);

            // Calculate BMI if not provided
            let imc = parseNumber(p.IMC);
            let isIMCCalculated = false;
            if (imc === 0 && peso > 0 && heightCm > 0) {
                imc = calculateBMI(peso, heightCm);
                isIMCCalculated = true;
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
function transformPerimetros(rawPerimetros: RawPerimetro[]): PerimetroCorporal[] {
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
function transformAvaliacoes(rawAvaliacoes: RawAvaliacao[]): AvaliacaoFisica[] {
    return rawAvaliacoes
        .map((a) => ({
            date: a.date,
            pushUps: parseNumber(a.pushUps),
            sitUps: parseNumber(a.sitUps),
            mile: a.mile || "",
            mileResult: a.mileResult || "",
            notes: a.notes || "",
        }))
        .filter((a) => a.pushUps > 0 || a.sitUps > 0 || a.mile)
        .sort((a, b) => parseDate(b.date) - parseDate(a.date));
}

/**
 * Prepare chart data from pesagens (sorted oldest first)
 */
function prepareChartData(pesagens: Pesagem[]): ChartData[] {
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
function calculateStats(
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
 * Custom hook for dashboard data transformation and management
 */
export function useDashboardData(forceRefresh: boolean = false): UseDashboardDataResult {
    const { data: sessionData, isLoading: isSessionLoading } = useSession();
    const {
        data: userData,
        isLoading: isUserDataLoading,
        isFetching,
        error,
        refetch
    } = useUserData(forceRefresh);

    const user = sessionData?.user;
    const isAuthenticated = Boolean(sessionData?.authenticated && user);

    const transformedData = useMemo((): TransformedData => {
        // Default empty state
        const emptyState: TransformedData = {
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

        if (!userData || !user) return emptyState;

        // Transform personal info
        const personalInfo: PersonalInfo = {
            name: `${userData.personalInfo.userName} ${userData.personalInfo.userSurname}`,
            email: userData.personalInfo.userEmail,
            birthDate: userData.personalInfo.userBirth,
            phone: userData.personalInfo.userPhone || "",
            height: "",
            weight: userData.pesagens?.length > 0
                ? `${userData.pesagens[userData.pesagens.length - 1].peso} kg`
                : "",
            goals: userData.personalInfo.notas || "",
            notes: userData.personalInfo.notas || "",
            trainingCredit: userData.personalInfo.trainingCredit || "",
            trainingsScheduled: userData.personalInfo.trainingsScheduled || "",
            debtValue: userData.personalInfo.debtValue || "",
            paid: userData.personalInfo.paid || "",
            q1: userData.personalInfo.q1 || "",
            q2: userData.personalInfo.q2 || "",
            q3: userData.personalInfo.q3 || "",
            q4: userData.personalInfo.q4 || "",
            age: userData.personalInfo.age || "",
        };

        // Transform data arrays
        const pesagens = transformPesagens(userData.pesagens || []);
        const perimetros = transformPerimetros(userData.perimetros || []);
        const avaliacoes = transformAvaliacoes(userData.avaliacoes || []);
        const referenceTables = (userData.referenceTables || {}) as ReferenceTables;

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
    }, [userData, user]);

    return {
        ...transformedData,
        isLoading: isSessionLoading || isUserDataLoading,
        isRefreshing: isFetching,
        error: error as Error | null,
        user,
        isAuthenticated,
        refetch,
    };
}
