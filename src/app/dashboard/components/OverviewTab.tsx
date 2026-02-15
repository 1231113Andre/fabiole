"use client";

import dynamic from "next/dynamic";
import { PersonalInfo, DashboardStats, ChartData } from "../types";

// Dynamically import Charts component with no SSR to avoid hydration mismatch
// and reduce initial bundle size for LCP
const OverviewCharts = dynamic(() => import("./OverviewCharts"), {
    ssr: false,
    loading: () => (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-5 w-full min-w-0">
            <div className="h-64 rounded-xl bg-gray-100 animate-pulse"></div>
            <div className="col-span-1 lg:col-span-2 h-64 rounded-xl bg-gray-100 animate-pulse"></div>
        </div>
    )
});

interface OverviewTabProps {
    personalInfo: PersonalInfo | null;
    stats: DashboardStats;
    chartData: ChartData[];
}

const cardBase = "flex flex-col rounded-xl sm:rounded-2xl border border-stroke bg-white p-4 sm:p-5 shadow-default hover:shadow-lg transition-shadow duration-300 min-w-0 h-full";
const cardIcon = "flex h-10 w-10 sm:h-11 sm:w-11 shrink-0 items-center justify-center rounded-xl bg-primary/5 text-primary";
const cardTitle = "text-sm sm:text-base font-bold text-black";
const cardDesc = "text-xs text-slate-500 leading-snug mt-1 line-clamp-2 min-h-[2.25rem]";
const cardValueRow = "flex items-end justify-between gap-2 mt-4 pt-4 border-t border-gray-100";

export function OverviewTab({ personalInfo, stats, chartData }: OverviewTabProps) {
    return (
        <div className="w-full min-w-0 space-y-6 sm:space-y-8">
            {/* Stats cards – 1 col mobile, 2 sm, 4 lg; no horizontal scroll */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-5 w-full min-w-0">
                {/* Trainings Scheduled */}
                <div className={cardBase}>
                    <div className="flex items-start gap-3">
                        <div className={cardIcon}>
                            <i className="fa-duotone fa-calendar-check text-lg sm:text-xl" />
                        </div>
                        <div className="min-w-0 flex-1">
                            <h4 className={cardTitle}>Agendados</h4>
                            <p className={cardDesc} title="Número de sessões de treino atualmente agendadas.">
                                <i className="fa-duotone fa-circle-info text-slate-400 mr-1" />
                                Número de sessões de treino atualmente agendadas.
                            </p>
                        </div>
                    </div>
                    <div className={cardValueRow}>
                        <span className="text-xl sm:text-2xl font-bold text-black truncate">{personalInfo?.trainingsScheduled || "0"}</span>
                        {Number(personalInfo?.trainingsScheduled || 0) > 0 ? (
                            <span className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 px-2.5 py-1 text-[11px] font-semibold text-white shadow-sm shrink-0">
                                <i className="fas fa-calendar-alt text-[10px]" /> Agendado
                            </span>
                        ) : (
                            <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-medium text-slate-500 shrink-0">
                                <i className="fas fa-calendar-xmark text-[10px]" /> Sem Treinos
                            </span>
                        )}
                    </div>
                </div>

                {/* Training Credit */}
                <div className={cardBase}>
                    <div className="flex items-start gap-3">
                        <div className={cardIcon}>
                            <i className="fa-duotone fa-coins text-lg sm:text-xl" />
                        </div>
                        <div className="min-w-0 flex-1">
                            <h4 className={cardTitle}>Crédito de Treinos</h4>
                            <p className={cardDesc} title="Saldo restante de sessões de treino pré-pagas.">
                                <i className="fa-duotone fa-circle-info text-slate-400 mr-1" />
                                Saldo restante de sessões de treino pré-pagas.
                            </p>
                        </div>
                    </div>
                    <div className={cardValueRow}>
                        <span className="text-xl sm:text-2xl font-bold text-black truncate">{personalInfo?.trainingCredit ? personalInfo.trainingCredit.replace("€", "").trim() : "0"}</span>
                        {Number(personalInfo?.trainingCredit?.replace("€", "") || 0) > 0 ? (
                            <span className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 px-2.5 py-1 text-[11px] font-semibold text-white shadow-sm shrink-0">
                                <i className="fas fa-check-circle text-[10px]" /> Disponível
                            </span>
                        ) : (
                            <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-medium text-slate-500 shrink-0">
                                <i className="fas fa-ban text-[10px]" /> Sem Saldo
                            </span>
                        )}
                    </div>
                </div>

                {/* Debt Value */}
                <div className={cardBase}>
                    <div className="flex items-start gap-3">
                        <div className={cardIcon}>
                            <i className="fa-duotone fa-file-invoice-dollar text-lg sm:text-xl" />
                        </div>
                        <div className="min-w-0 flex-1">
                            <h4 className={cardTitle}>Valor em Dívida</h4>
                            <p className={cardDesc} title="Valor total em dívida na sua conta.">
                                <i className="fa-duotone fa-circle-info text-slate-400 mr-1" />
                                Valor total em dívida na sua conta.
                            </p>
                        </div>
                    </div>
                    <div className={cardValueRow}>
                        <span className="text-xl sm:text-2xl font-bold text-black truncate">
                            {personalInfo?.debtValue ? (personalInfo.debtValue.includes("€") ? personalInfo.debtValue : `${personalInfo.debtValue}€`) : "0€"}
                        </span>
                        {!personalInfo?.debtValue || personalInfo?.debtValue === "0€" || personalInfo?.debtValue === "0" ? (
                            <span className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-emerald-500 to-green-500 px-2.5 py-1 text-[11px] font-semibold text-white shadow-sm shrink-0">
                                <i className="fas fa-check-circle text-[10px]" /> Sem Dívida
                            </span>
                        ) : (
                            <span className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-rose-500 to-red-500 px-2.5 py-1 text-[11px] font-semibold text-white shadow-sm animate-pulse shrink-0">
                                <i className="fas fa-exclamation-triangle text-[10px]" /> Pendente
                            </span>
                        )}
                    </div>
                </div>

                {/* Paid Status */}
                <div className={cardBase}>
                    <div className="flex items-start gap-3">
                        <div className={`flex h-10 w-10 sm:h-11 sm:w-11 shrink-0 items-center justify-center rounded-xl ${(personalInfo?.paid?.toLowerCase() === "sim" || personalInfo?.paid?.toLowerCase() === "yes" || personalInfo?.paid?.toLowerCase() === "pago") ? "bg-emerald-50 text-emerald-500" : (personalInfo?.paid?.toLowerCase() === "pendente") ? "bg-red-50 text-red-500" : "bg-amber-50 text-amber-500"}`}>
                            <i className={`fa-duotone ${(personalInfo?.paid?.toLowerCase() === "sim" || personalInfo?.paid?.toLowerCase() === "yes" || personalInfo?.paid?.toLowerCase() === "pago") ? "fa-shield-check" : (personalInfo?.paid?.toLowerCase() === "pendente") ? "fa-circle-exclamation" : "fa-hourglass-half"} text-lg sm:text-xl`} />
                        </div>
                        <div className="min-w-0 flex-1">
                            <h4 className={cardTitle}>Estado</h4>
                            <p className={cardDesc} title="Estado atual do pagamento mensal da sua conta.">
                                <i className="fa-duotone fa-circle-info text-slate-400 mr-1" />
                                Estado atual do pagamento mensal da sua conta.
                            </p>
                        </div>
                    </div>
                    <div className={cardValueRow}>
                        <span className={`text-xl sm:text-2xl font-bold truncate ${(personalInfo?.paid?.toLowerCase() === "sim" || personalInfo?.paid?.toLowerCase() === "yes" || personalInfo?.paid?.toLowerCase() === "pago") ? "text-emerald-500" : (personalInfo?.paid?.toLowerCase() === "pendente") ? "text-red-500" : "text-amber-500"}`}>{personalInfo?.paid || "N/A"}</span>
                        {(personalInfo?.paid?.toLowerCase() === "sim" || personalInfo?.paid?.toLowerCase() === "yes" || personalInfo?.paid?.toLowerCase() === "pago") ? (
                            <span className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-emerald-500 to-green-500 px-2.5 py-1 text-[11px] font-semibold text-white shadow-sm shrink-0">
                                <i className="fas fa-shield-check text-[10px]" /> Pago
                            </span>
                        ) : (personalInfo?.paid?.toLowerCase() === "pendente") ? (
                            <span className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-red-500 to-rose-500 px-2.5 py-1 text-[11px] font-semibold text-white shadow-sm animate-pulse shrink-0">
                                <i className="fas fa-circle-exclamation text-[10px]" /> Pendente
                            </span>
                        ) : (
                            <span className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-amber-400 to-orange-400 px-2.5 py-1 text-[11px] font-semibold text-white shadow-sm shrink-0">
                                <i className="fas fa-hourglass-half text-[10px]" /> Aguarda
                            </span>
                        )}
                    </div>
                </div>

                {/* Pesagens */}
                <div className={cardBase}>
                    <div className="flex items-start gap-3">
                        <div className={cardIcon}>
                            <i className="fa-duotone fa-weight-scale text-lg sm:text-xl" />
                        </div>
                        <div className="min-w-0 flex-1">
                            <h4 className={cardTitle}>Pesagens</h4>
                            <p className={cardDesc} title="Número total de pesagens registadas.">
                                <i className="fa-duotone fa-circle-info text-slate-400 mr-1" />
                                Número total de pesagens registadas.
                            </p>
                        </div>
                    </div>
                    <div className={cardValueRow}>
                        <span className="text-xl sm:text-2xl font-bold text-black truncate">{stats.totalPesagens}</span>
                        {stats.weightTrend !== 0 ? (
                            <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold text-white shadow-sm shrink-0 ${stats.weightTrend < 0 ? "bg-gradient-to-r from-emerald-500 to-green-500" : "bg-gradient-to-r from-rose-500 to-red-500"}`}>
                                <i className={`fas fa-arrow-trend-${stats.weightTrend < 0 ? "down" : "up"} text-[10px]`} />{stats.weightTrend < 0 ? "-" : "+"}{Math.abs(stats.weightTrend).toFixed(1)} kg
                            </span>
                        ) : stats.totalPesagens > 0 ? (
                            <span className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-violet-500 to-purple-500 px-2.5 py-1 text-[11px] font-semibold text-white shadow-sm shrink-0">
                                <i className="fas fa-scale-balanced text-[10px]" /> Estável
                            </span>
                        ) : (
                            <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-medium text-slate-500 shrink-0">
                                <i className="fas fa-minus text-[10px]" /> Sem Dados
                            </span>
                        )}
                    </div>
                </div>

                {/* Avaliações */}
                <div className={cardBase}>
                    <div className="flex items-start gap-3">
                        <div className={cardIcon}>
                            <i className="fa-duotone fa-dumbbell text-lg sm:text-xl" />
                        </div>
                        <div className="min-w-0 flex-1">
                            <h4 className={cardTitle}>Avaliações</h4>
                            <p className={cardDesc} title="Número total de avaliações físicas realizadas.">
                                <i className="fa-duotone fa-circle-info text-slate-400 mr-1" />
                                Número total de avaliações físicas realizadas.
                            </p>
                        </div>
                    </div>
                    <div className={cardValueRow}>
                        <span className="text-xl sm:text-2xl font-bold text-black truncate">{stats.totalAvaliacoes}</span>
                        {stats.totalAvaliacoes > 0 ? (
                            <span className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-fuchsia-500 to-pink-500 px-2.5 py-1 text-[11px] font-semibold text-white shadow-sm shrink-0">
                                <i className="fas fa-clipboard-check text-[10px]" /> Concluído
                            </span>
                        ) : (
                            <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-medium text-slate-500 shrink-0">
                                <i className="fas fa-clipboard-list text-[10px]" /> Sem Dados
                            </span>
                        )}
                    </div>
                </div>

                {/* Perímetros */}
                <div className={cardBase}>
                    <div className="flex items-start gap-3">
                        <div className={cardIcon}>
                            <i className="fa-duotone fa-ruler-combined text-lg sm:text-xl" />
                        </div>
                        <div className="min-w-0 flex-1">
                            <h4 className={cardTitle}>Perímetros</h4>
                            <p className={cardDesc} title="Número total de medições corporais registadas.">
                                <i className="fa-duotone fa-circle-info text-slate-400 mr-1" />
                                Número total de medições corporais registadas.
                            </p>
                        </div>
                    </div>
                    <div className={cardValueRow}>
                        <span className="text-xl sm:text-2xl font-bold text-black truncate">{stats.totalPerimetros}</span>
                        {stats.totalPerimetros > 0 ? (
                            <span className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 px-2.5 py-1 text-[11px] font-semibold text-white shadow-sm shrink-0">
                                <i className="fas fa-ruler text-[10px]" /> Registado
                            </span>
                        ) : (
                            <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-medium text-slate-500 shrink-0">
                                <i className="fas fa-ruler text-[10px]" /> Sem Dados
                            </span>
                        )}
                    </div>
                </div>
            </div>

            {/* Charts Component - Loaded Dynamically */}
            <OverviewCharts stats={stats} chartData={chartData} />
        </div>
    );
}
