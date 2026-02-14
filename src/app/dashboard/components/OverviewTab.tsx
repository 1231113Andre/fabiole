"use client";

import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
} from "recharts";
import { PersonalInfo, DashboardStats, ChartData } from "../types";

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
                        <span className="text-xl sm:text-2xl font-bold text-black truncate">{personalInfo?.trainingCredit && personalInfo.trainingCredit !== "0" ? personalInfo.trainingCredit : "0€"}</span>
                        {Number(personalInfo?.trainingCredit || 0) > 0 ? (
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
                        <span className="text-xl sm:text-2xl font-bold text-black truncate">{personalInfo?.debtValue || "0€"}</span>
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

            {/* Última Pesagem + Evolução do Peso – same card style and gap */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-5 w-full min-w-0">
                {stats.latestPesagem && (
                    <div className={`${cardBase} flex flex-col`}>
                        <div className="flex items-center justify-between gap-3 mb-4">
                            <h3 className="text-sm sm:text-base font-bold text-black">Última Pesagem</h3>
                            <div className="flex h-9 w-9 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-xl bg-primary/5 text-primary">
                                <i className="fa-duotone fa-chart-simple text-base sm:text-lg" />
                            </div>
                        </div>
                        <div className="space-y-2 sm:space-y-3 flex-1 min-h-0">
                            <div className="flex items-center justify-between p-2.5 sm:p-3 bg-gray-50 rounded-lg">
                                <span className="text-xs sm:text-sm font-medium text-slate-500">Peso</span>
                                <span className="text-sm sm:text-base font-bold text-black">{stats.latestPesagem.peso} kg</span>
                            </div>
                            <div className="flex items-center justify-between p-2.5 sm:p-3 bg-gray-50 rounded-lg">
                                <span className="text-xs sm:text-sm font-medium text-slate-500">% Massa Gorda</span>
                                <span className="text-sm sm:text-base font-bold text-black">{stats.latestPesagem.percentualMG}%</span>
                            </div>
                            <div className="flex items-center justify-between p-2.5 sm:p-3 bg-gray-50 rounded-lg">
                                <span className="text-xs sm:text-sm font-medium text-slate-500">Massa Muscular</span>
                                <span className="text-sm sm:text-base font-bold text-black">{stats.latestPesagem.MM} kg</span>
                            </div>
                            <div className="flex items-center justify-between p-2.5 sm:p-3 bg-gray-50 rounded-lg">
                                <span className="text-xs sm:text-sm font-medium text-slate-500">IMC</span>
                                <span className="text-sm sm:text-base font-bold text-black">{stats.latestPesagem.IMC ? stats.latestPesagem.IMC.toFixed(1).replace(".", ",") : "-"}</span>
                            </div>
                        </div>
                    </div>
                )}

                {chartData.length > 0 && (
                    <div className={`${cardBase} col-span-1 lg:col-span-2 flex flex-col min-h-0`}>
                        <div className="flex items-center justify-between gap-3 mb-4">
                            <h3 className="text-sm sm:text-base font-bold text-black">Evolução do Peso</h3>
                            <div className="flex h-9 w-9 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-xl bg-primary/5 text-primary">
                                <i className="fa-duotone fa-chart-line text-base sm:text-lg" />
                            </div>
                        </div>
                        <div className="h-[220px] sm:h-[260px] lg:h-[280px] w-full min-h-[180px] flex-1">
                            <AreaChart data={chartData} responsive width="100%" height="100%" style={{ minHeight: 180, minWidth: 100 }}>
                                    <defs>
                                        <linearGradient id="colorPeso" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#e6915b" stopOpacity={0.4} />
                                            <stop offset="95%" stopColor="#e6915b" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.5} />
                                    <XAxis dataKey="data" stroke="#94a3b8" tick={{ fill: "#94a3b8", fontSize: 11 }} tickLine={false} axisLine={false} />
                                    <YAxis stroke="#94a3b8" tick={{ fill: "#94a3b8", fontSize: 11 }} tickLine={false} axisLine={false} />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "8px", boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)", color: "#000", padding: "10px 12px" }}
                                        itemStyle={{ color: "#000" }}
                                        labelStyle={{ color: "#94a3b8", marginBottom: "4px" }}
                                    />
                                    <Area type="monotone" dataKey="peso" stroke="#e6915b" strokeWidth={3} fillOpacity={1} fill="url(#colorPeso)" />
                                </AreaChart>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
