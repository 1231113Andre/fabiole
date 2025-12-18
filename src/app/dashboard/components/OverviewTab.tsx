"use client";

import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from "recharts";
import { PersonalInfo, DashboardStats, ChartData } from "../types";

interface OverviewTabProps {
    personalInfo: PersonalInfo | null;
    stats: DashboardStats;
    chartData: ChartData[];
}

export function OverviewTab({ personalInfo, stats, chartData }: OverviewTabProps) {
    return (
        <div className="space-y-8">
            {/* Top Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                {/* Training Credit */}
                {personalInfo?.trainingCredit && (
                    <div className="flex flex-col justify-between rounded-2xl border border-stroke bg-white p-6 shadow-default hover:shadow-lg transition-shadow duration-300">
                        <div className="flex flex-col items-center text-center gap-4 mb-6">
                            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/5 text-primary">
                                <i className="fa-duotone fa-coins text-2xl"></i>
                            </div>
                            <div>
                                <h4 className="text-lg font-bold text-black">Training Credit</h4>
                                <span className="text-xs font-medium text-slate-500 group">
                                    <i className="fa-duotone fa-circle-info text-sm text-slate-400 group-hover:text-primary cursor-help transition-colors mr-1.5"></i>
                                    Your remaining balance of prepaid training sessions.
                                </span>
                            </div>
                        </div>
                        <div className="flex items-end justify-between">
                            <span className="text-2xl font-bold text-black">{personalInfo.trainingCredit}</span>
                            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-600">
                                <i className="fas fa-arrow-up text-[10px]"></i>
                                Available
                            </span>
                        </div>
                    </div>
                )}

                {/* Trainings Scheduled */}
                {personalInfo?.trainingsScheduled && (
                    <div className="flex flex-col justify-between rounded-2xl border border-stroke bg-white p-6 shadow-default hover:shadow-lg transition-shadow duration-300">
                        <div className="flex flex-col items-center text-center gap-4 mb-6">
                            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/5 text-primary">
                                <i className="fa-duotone fa-calendar-check text-2xl"></i>
                            </div>
                            <div>
                                <h4 className="text-lg font-bold text-black">Scheduled</h4>
                                <span className="text-xs font-medium text-slate-500 group">
                                    <i className="fa-duotone fa-circle-info text-sm text-slate-400 group-hover:text-primary cursor-help transition-colors mr-1.5"></i>
                                    The number of training sessions currently scheduled.
                                </span>
                            </div>
                        </div>
                        <div className="flex items-end justify-between">
                            <span className="text-2xl font-bold text-black">{personalInfo.trainingsScheduled}</span>
                            <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-blue-600">
                                <i className="fas fa-clock text-[10px]"></i>
                                Upcoming
                            </span>
                        </div>
                    </div>
                )}

                {/* Debt Value - Highlighted if debt exists */}
                {personalInfo?.debtValue && (
                    <div className="flex flex-col justify-between rounded-2xl border border-stroke bg-white p-6 shadow-default hover:shadow-lg transition-shadow duration-300">
                        <div className="flex flex-col items-center text-center gap-4 mb-6">
                            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/5 text-primary">
                                <i className="fa-duotone fa-file-invoice-dollar text-2xl"></i>
                            </div>
                            <div>
                                <h4 className="text-lg font-bold text-black">Debt Value</h4>
                                <span className="text-xs font-medium text-slate-500 group">
                                    <i className="fa-duotone fa-circle-info text-sm text-slate-400 group-hover:text-primary cursor-help transition-colors mr-1.5"></i>
                                    Total amount currently outstanding on your account.
                                </span>
                            </div>
                        </div>
                        <div className="flex items-end justify-between">
                            <span className="text-2xl font-bold text-black">{personalInfo.debtValue}</span>
                            <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-2.5 py-0.5 text-xs font-medium text-rose-600">
                                <i className="fas fa-exclamation-circle text-[10px]"></i>
                                Action
                            </span>
                        </div>
                    </div>
                )}

                {/* Total Pesagens with Weight Trend */}
                <div className="flex flex-col justify-between rounded-2xl border border-stroke bg-white p-6 shadow-default hover:shadow-lg transition-shadow duration-300">
                    <div className="flex flex-col items-center text-center gap-4 mb-6">
                        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/5 text-primary">
                            <i className="fa-duotone fa-weight-scale text-2xl"></i>
                        </div>
                        <div>
                            <h4 className="text-lg font-bold text-black">Pesagens</h4>
                            <span className="text-xs font-medium text-slate-500 group">
                                <i className="fa-duotone fa-circle-info text-sm text-slate-400 group-hover:text-primary cursor-help transition-colors mr-1.5"></i>
                                Total count of weight measurements recorded.
                            </span>
                        </div>
                    </div>
                    <div className="flex items-end justify-between">
                        <span className="text-2xl font-bold text-black">{stats.totalPesagens}</span>
                        {stats.weightTrend !== 0 ? (
                            <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${stats.weightTrend < 0
                                ? 'bg-emerald-50 text-emerald-600'
                                : 'bg-rose-50 text-rose-600'
                                }`}>
                                <i className={`fas fa-arrow-${stats.weightTrend < 0 ? 'down' : 'up'} text-[10px]`}></i>
                                {Math.abs(stats.weightTrend).toFixed(1)} kg
                            </span>
                        ) : (
                            <span className="inline-flex items-center gap-1 rounded-full bg-slate-50 px-2.5 py-0.5 text-xs font-medium text-slate-500">
                                <i className="fas fa-minus text-[10px]"></i>
                                Stable
                            </span>
                        )}
                    </div>
                </div>

                {/* Total Perímetros */}
                <div className="flex flex-col justify-between rounded-2xl border border-stroke bg-white p-6 shadow-default hover:shadow-lg transition-shadow duration-300">
                    <div className="flex flex-col items-center text-center gap-4 mb-6">
                        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/5 text-primary">
                            <i className="fa-duotone fa-ruler-combined text-2xl"></i>
                        </div>
                        <div>
                            <h4 className="text-lg font-bold text-black">Perímetros</h4>
                            <span className="text-xs font-medium text-slate-500 group">
                                <i className="fa-duotone fa-circle-info text-sm text-slate-400 group-hover:text-primary cursor-help transition-colors mr-1.5"></i>
                                Total number of body measurements recorded.
                            </span>
                        </div>
                    </div>
                    <div className="flex items-end justify-between">
                        <span className="text-2xl font-bold text-black">{stats.totalPerimetros}</span>
                        <span className="inline-flex items-center gap-1 rounded-full bg-slate-50 px-2.5 py-0.5 text-xs font-medium text-slate-500">
                            <i className="fas fa-chart-bar text-[10px]"></i>
                            Tracked
                        </span>
                    </div>
                </div>

                {/* Total Avaliações */}
                <div className="flex flex-col justify-between rounded-2xl border border-stroke bg-white p-6 shadow-default hover:shadow-lg transition-shadow duration-300">
                    <div className="flex flex-col items-center text-center gap-4 mb-6">
                        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/5 text-primary">
                            <i className="fa-duotone fa-dumbbell text-2xl"></i>
                        </div>
                        <div>
                            <h4 className="text-lg font-bold text-black">Avaliações</h4>
                            <span className="text-xs font-medium text-slate-500 group">
                                <i className="fa-duotone fa-circle-info text-sm text-slate-400 group-hover:text-primary cursor-help transition-colors mr-1.5"></i>
                                Total number of physical assessments completed.
                            </span>
                        </div>
                    </div>
                    <div className="flex items-end justify-between">
                        <span className="text-2xl font-bold text-black">{stats.totalAvaliacoes}</span>
                        <span className="inline-flex items-center gap-1 rounded-full bg-slate-50 px-2.5 py-0.5 text-xs font-medium text-slate-500">
                            <i className="fas fa-star text-[10px]"></i>
                            Completed
                        </span>
                    </div>
                </div>

                {/* Paid Status */}
                {personalInfo?.paid && (
                    <div className="flex flex-col justify-between rounded-2xl border border-stroke bg-white p-6 shadow-default hover:shadow-lg transition-shadow duration-300">
                        <div className="flex flex-col items-center text-center gap-4 mb-6">
                            <div className={`flex h-14 w-14 items-center justify-center rounded-full ${personalInfo.paid.toLowerCase() === 'sim' || personalInfo.paid.toLowerCase() === 'yes'
                                ? 'bg-emerald-50 text-emerald-500'
                                : 'bg-amber-50 text-amber-500'
                                }`}>
                                <i className={`fa-duotone ${personalInfo.paid.toLowerCase() === 'sim' || personalInfo.paid.toLowerCase() === 'yes'
                                    ? 'fa-shield-check'
                                    : 'fa-shield-exclamation'
                                    } text-2xl`}></i>
                            </div>
                            <div>
                                <h4 className="text-lg font-bold text-black">Status</h4>
                                <span className="text-xs font-medium text-slate-500 group">
                                    <i className="fa-duotone fa-circle-info text-sm text-slate-400 group-hover:text-primary cursor-help transition-colors mr-1.5"></i>
                                    Current status of your account monthly payment.
                                </span>
                            </div>
                        </div>
                        <div className="flex items-end justify-between">
                            <span className={`text-2xl font-bold ${personalInfo.paid.toLowerCase() === 'sim' || personalInfo.paid.toLowerCase() === 'yes'
                                ? 'text-emerald-500'
                                : 'text-amber-500'
                                }`}>
                                {personalInfo.paid}
                            </span>
                            <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${personalInfo.paid.toLowerCase() === 'sim' || personalInfo.paid.toLowerCase() === 'yes'
                                ? 'bg-emerald-50 text-emerald-600'
                                : 'bg-amber-50 text-amber-600'
                                }`}>
                                <i className={`fas ${personalInfo.paid.toLowerCase() === 'sim' || personalInfo.paid.toLowerCase() === 'yes'
                                    ? 'fa-check'
                                    : 'fa-triangle-exclamation'
                                    } text-[10px]`}></i>
                                {personalInfo.paid.toLowerCase() === 'sim' || personalInfo.paid.toLowerCase() === 'yes' ? 'Verified' : 'Pending'}
                            </span>
                        </div>
                    </div>
                )}

            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Latest Measurements Summary */}
                {stats.latestPesagem && (
                    <div className="col-span-1 border border-stroke bg-white shadow-default rounded-2xl p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-lg font-semibold text-black">
                                Última Pesagem
                            </h3>
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/5 text-primary">
                                <i className="fa-duotone fa-chart-simple text-lg"></i>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                                <span className="text-sm font-medium text-slate-500">Peso</span>
                                <span className="text-lg font-bold text-black">{stats.latestPesagem.peso} kg</span>
                            </div>
                            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                                <span className="text-sm font-medium text-slate-500">% Massa Gorda</span>
                                <span className="text-lg font-bold text-black">{stats.latestPesagem.percentualMG}%</span>
                            </div>
                            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                                <span className="text-sm font-medium text-slate-500">Massa Muscular</span>
                                <span className="text-lg font-bold text-black">{stats.latestPesagem.MM} kg</span>
                            </div>
                            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                                <span className="text-sm font-medium text-slate-500">IMC</span>
                                <span className="text-lg font-bold text-black">{stats.latestPesagem.IMC}</span>
                            </div>
                        </div>
                    </div>
                )}

                {/* Quick Chart Preview */}
                {chartData.length > 0 && (
                    <div className="col-span-1 lg:col-span-2 border border-stroke bg-white shadow-default rounded-2xl p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-lg font-semibold text-black">
                                Evolução do Peso
                            </h3>
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/5 text-primary">
                                <i className="fa-duotone fa-chart-line text-lg"></i>
                            </div>
                        </div>
                        <div className="h-[300px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={chartData}>
                                    <defs>
                                        <linearGradient id="colorPeso" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#e6915b" stopOpacity={0.4} />
                                            <stop offset="95%" stopColor="#e6915b" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.5} />
                                    <XAxis
                                        dataKey="data"
                                        stroke="#94a3b8"
                                        tick={{ fill: '#94a3b8', fontSize: 12 }}
                                        tickLine={false}
                                        axisLine={false}
                                    />
                                    <YAxis
                                        stroke="#94a3b8"
                                        tick={{ fill: '#94a3b8', fontSize: 12 }}
                                        tickLine={false}
                                        axisLine={false}
                                    />
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: '#ffffff',
                                            border: '1px solid #e2e8f0',
                                            borderRadius: '8px',
                                            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                                            color: '#000',
                                            padding: '12px'
                                        }}
                                        itemStyle={{ color: '#000' }}
                                        labelStyle={{ color: '#94a3b8', marginBottom: '4px' }}
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="peso"
                                        stroke="#e6915b"
                                        strokeWidth={3}
                                        fillOpacity={1}
                                        fill="url(#colorPeso)"
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                )}
            </div>
        </div >
    );
}
