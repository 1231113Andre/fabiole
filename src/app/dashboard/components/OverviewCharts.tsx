"use client";

import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
} from "recharts";
import { ChartData, DashboardStats } from "../types";

interface OverviewChartsProps {
    stats: DashboardStats;
    chartData: ChartData[];
}

const cardBase = "flex flex-col rounded-xl sm:rounded-2xl border border-stroke bg-white p-4 sm:p-5 shadow-default hover:shadow-lg transition-shadow duration-300 min-w-0 h-full";

export default function OverviewCharts({ stats, chartData }: OverviewChartsProps) {
    return (
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
    );
}
