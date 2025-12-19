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
import { Pesagem, ChartData } from "../types";

interface PesagensTabProps {
    pesagens: Pesagem[];
    chartData: ChartData[];
}

export function PesagensTab({ pesagens, chartData }: PesagensTabProps) {
    return (
        <div className="space-y-6">
            {pesagens.length > 0 ? (
                <>
                    {/* Table Card */}
                    <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
                        <div className="border-b border-gray-100 px-6 py-5">
                            <h4 className="text-lg font-semibold text-gray-900 flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                                    <i className="fa-duotone fa-weight-scale text-primary"></i>
                                </div>
                                Registo de Pesagens
                            </h4>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="bg-gray-50 border-b border-gray-100">
                                        <th className="py-4 px-4 text-left font-semibold text-gray-700 text-sm xl:pl-8">Data</th>
                                        <th className="py-4 px-4 text-center font-semibold text-gray-700 text-sm">Peso (kg)</th>
                                        <th className="py-4 px-4 text-center font-semibold text-gray-700 text-sm">
                                            <span className="inline-flex items-center gap-1.5 bg-gradient-to-r from-violet-500/20 to-purple-500/20 text-violet-700 px-3 py-1.5 rounded-full border border-violet-200 shadow-sm">
                                                <span className="text-sm">🤖</span>
                                                <span className="font-bold text-xs uppercase tracking-wide">Δ PESO (AUTO)</span>
                                            </span>
                                        </th>
                                        <th className="py-4 px-4 text-center font-semibold text-gray-700 text-sm">Altura (cm)</th>
                                        <th className="py-4 px-4 text-center font-semibold text-gray-700 text-sm">% MG</th>
                                        <th className="py-4 px-4 text-center font-semibold text-gray-700 text-sm hidden md:table-cell">MM (kg)</th>
                                        <th className="py-4 px-4 text-center font-semibold text-gray-700 text-sm hidden lg:table-cell">H2O</th>
                                        <th className="py-4 px-4 text-center font-semibold text-gray-700 text-sm">
                                            <span className="inline-flex items-center gap-1.5 bg-gradient-to-r from-violet-500/20 to-purple-500/20 text-violet-700 px-3 py-1.5 rounded-full border border-violet-200 shadow-sm">
                                                <span className="text-sm">🤖</span>
                                                <span className="font-bold text-xs uppercase tracking-wide">IMC (AUTO)</span>
                                            </span>
                                        </th>
                                        <th className="py-4 px-4 text-center font-semibold text-gray-700 text-sm hidden lg:table-cell">Gordura Visc.</th>
                                        <th className="py-4 px-4 text-center font-semibold text-gray-700 text-sm hidden xl:table-cell">ID Metab.</th>
                                        <th className="py-4 px-4 text-center font-semibold text-gray-700 text-sm hidden xl:table-cell">Massa Óssea</th>
                                        <th className="py-4 px-4 text-center font-semibold text-gray-700 text-sm">Resultado IMC</th>
                                        <th className="py-4 px-4 text-center font-semibold text-gray-700 text-sm hidden md:table-cell">Resultado %MG</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {pesagens.map((pesagem, index) => (
                                        <tr key={index} className="border-b border-gray-100 hover:bg-gray-50/50 transition-colors">
                                            <td className="py-4 px-4 xl:pl-8">
                                                <div className="flex items-center gap-2">
                                                    <i className="fa-duotone fa-calendar-days text-primary text-sm"></i>
                                                    <span className="font-medium text-gray-900">{pesagem.data}</span>
                                                </div>
                                            </td>
                                            <td className="py-4 px-4 text-center">
                                                <span className="font-bold text-gray-900">{pesagem.peso || "-"}</span>
                                            </td>
                                            <td className="py-4 px-4 text-center">
                                                {pesagem.deltaPeso !== undefined ? (
                                                    <span className={`inline-flex items-center gap-1 font-semibold px-2 py-0.5 rounded-full text-sm ${pesagem.deltaPeso > 0
                                                        ? 'bg-red-100 text-red-700'
                                                        : pesagem.deltaPeso < 0
                                                            ? 'bg-emerald-100 text-emerald-700'
                                                            : 'bg-gray-100 text-gray-600'
                                                        }`}>
                                                        {pesagem.deltaPeso > 0 ? '+' : ''}{pesagem.deltaPeso} kg
                                                    </span>
                                                ) : (
                                                    <span className="text-gray-400">—</span>
                                                )}
                                            </td>
                                            <td className="py-4 px-4 text-center">
                                                <span className="text-gray-700">{pesagem.height || "-"}</span>
                                            </td>
                                            <td className="py-4 px-4 text-center">
                                                <span className="text-gray-700">{pesagem.percentualMG || "-"}</span>
                                            </td>
                                            <td className="py-4 px-4 text-center hidden md:table-cell">
                                                <span className="text-gray-700">{pesagem.MM || "-"}</span>
                                            </td>
                                            <td className="py-4 px-4 text-center hidden lg:table-cell">
                                                <span className="text-gray-700">{pesagem.H2O || "-"}</span>
                                            </td>
                                            <td className="py-4 px-4 text-center">
                                                <span className="font-semibold text-gray-900">{pesagem.IMC || "-"}</span>
                                            </td>
                                            <td className="py-4 px-4 text-center hidden lg:table-cell">
                                                <span className="text-gray-700">{pesagem.gordVisceral || "-"}</span>
                                            </td>
                                            <td className="py-4 px-4 text-center hidden xl:table-cell">
                                                <span className="text-gray-700">{pesagem.IDMetabolica || "-"}</span>
                                            </td>
                                            <td className="py-4 px-4 text-center hidden xl:table-cell">
                                                <span className="text-gray-700">{pesagem.massaOssea || "-"}</span>
                                            </td>
                                            <td className="py-4 px-4 text-center">
                                                <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${pesagem.resultadoIMC?.toLowerCase().includes('excelente') ? 'bg-emerald-100 text-emerald-700' :
                                                    pesagem.resultadoIMC?.toLowerCase().includes('bom') ? 'bg-blue-100 text-blue-700' :
                                                        pesagem.resultadoIMC?.toLowerCase().includes('médio') || pesagem.resultadoIMC?.toLowerCase().includes('medio') ? 'bg-amber-100 text-amber-700' :
                                                            pesagem.resultadoIMC?.toLowerCase().includes('mau') ? 'bg-red-100 text-red-700' :
                                                                'bg-gray-100 text-gray-600'
                                                    }`}>
                                                    {pesagem.resultadoIMC || "-"}
                                                </span>
                                            </td>
                                            <td className="py-4 px-4 text-center hidden md:table-cell">
                                                <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${pesagem.resultadoPercentualMG?.toLowerCase().includes('excelente') ? 'bg-emerald-100 text-emerald-700' :
                                                    pesagem.resultadoPercentualMG?.toLowerCase().includes('bom') ? 'bg-blue-100 text-blue-700' :
                                                        pesagem.resultadoPercentualMG?.toLowerCase().includes('médio') || pesagem.resultadoPercentualMG?.toLowerCase().includes('medio') ? 'bg-amber-100 text-amber-700' :
                                                            pesagem.resultadoPercentualMG?.toLowerCase().includes('mau') ? 'bg-red-100 text-red-700' :
                                                                'bg-gray-100 text-gray-600'
                                                    }`}>
                                                    {pesagem.resultadoPercentualMG || "-"}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Modern Charts Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Peso Chart */}
                        <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
                            <div className="border-b border-gray-100 px-6 py-4">
                                <h3 className="font-semibold text-gray-900 flex items-center gap-3">
                                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-orange-400 to-orange-600">
                                        <i className="fa-duotone fa-weight-scale text-white text-sm"></i>
                                    </div>
                                    Peso (kg)
                                </h3>
                            </div>
                            <div className="p-5">
                                <div className="h-[280px]">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <AreaChart data={chartData}>
                                            <defs>
                                                <linearGradient id="colorPeso" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#e6915b" stopOpacity={0.3} />
                                                    <stop offset="95%" stopColor="#e6915b" stopOpacity={0} />
                                                </linearGradient>
                                            </defs>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                                            <XAxis dataKey="data" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                                            <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                                            <Tooltip
                                                contentStyle={{
                                                    backgroundColor: '#ffffff',
                                                    border: 'none',
                                                    borderRadius: '12px',
                                                    boxShadow: '0 10px 40px -10px rgba(0,0,0,0.15)',
                                                }}
                                                labelStyle={{ fontWeight: 600, color: '#1f2937' }}
                                            />
                                            <Area type="monotone" dataKey="peso" stroke="#e6915b" strokeWidth={3} fill="url(#colorPeso)" dot={{ fill: '#e6915b', strokeWidth: 2, r: 4 }} activeDot={{ r: 6, fill: '#e6915b' }} />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        </div>

                        {/* Massa Gorda Chart */}
                        <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
                            <div className="border-b border-gray-100 px-6 py-4">
                                <h3 className="font-semibold text-gray-900 flex items-center gap-3">
                                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-rose-400 to-rose-600">
                                        <i className="fa-duotone fa-chart-pie text-white text-sm"></i>
                                    </div>
                                    Massa Gorda (%)
                                </h3>
                            </div>
                            <div className="p-5">
                                <div className="h-[280px]">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <AreaChart data={chartData}>
                                            <defs>
                                                <linearGradient id="colorMassaGorda" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.3} />
                                                    <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
                                                </linearGradient>
                                            </defs>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                                            <XAxis dataKey="data" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                                            <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                                            <Tooltip
                                                contentStyle={{
                                                    backgroundColor: '#ffffff',
                                                    border: 'none',
                                                    borderRadius: '12px',
                                                    boxShadow: '0 10px 40px -10px rgba(0,0,0,0.15)',
                                                }}
                                                labelStyle={{ fontWeight: 600, color: '#1f2937' }}
                                            />
                                            <Area type="monotone" dataKey="massaGorda" stroke="#f43f5e" strokeWidth={3} fill="url(#colorMassaGorda)" dot={{ fill: '#f43f5e', strokeWidth: 2, r: 4 }} activeDot={{ r: 6, fill: '#f43f5e' }} />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        </div>

                        {/* Massa Muscular Chart */}
                        <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
                            <div className="border-b border-gray-100 px-6 py-4">
                                <h3 className="font-semibold text-gray-900 flex items-center gap-3">
                                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-blue-400 to-blue-600">
                                        <i className="fa-duotone fa-dumbbell text-white text-sm"></i>
                                    </div>
                                    Massa Muscular (kg)
                                </h3>
                            </div>
                            <div className="p-5">
                                <div className="h-[280px]">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <AreaChart data={chartData}>
                                            <defs>
                                                <linearGradient id="colorMassaMuscular" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                                                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                                </linearGradient>
                                            </defs>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                                            <XAxis dataKey="data" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                                            <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                                            <Tooltip
                                                contentStyle={{
                                                    backgroundColor: '#ffffff',
                                                    border: 'none',
                                                    borderRadius: '12px',
                                                    boxShadow: '0 10px 40px -10px rgba(0,0,0,0.15)',
                                                }}
                                                labelStyle={{ fontWeight: 600, color: '#1f2937' }}
                                            />
                                            <Area type="monotone" dataKey="massaMuscular" stroke="#3b82f6" strokeWidth={3} fill="url(#colorMassaMuscular)" dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }} activeDot={{ r: 6, fill: '#3b82f6' }} />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        </div>

                        {/* Gordura Visceral Chart */}
                        <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
                            <div className="border-b border-gray-100 px-6 py-4">
                                <h3 className="font-semibold text-gray-900 flex items-center gap-3">
                                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-purple-400 to-purple-600">
                                        <i className="fa-duotone fa-heart-pulse text-white text-sm"></i>
                                    </div>
                                    Gordura Visceral
                                </h3>
                            </div>
                            <div className="p-5">
                                <div className="h-[280px]">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <AreaChart data={chartData}>
                                            <defs>
                                                <linearGradient id="colorGorduraVisceral" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#a855f7" stopOpacity={0.3} />
                                                    <stop offset="95%" stopColor="#a855f7" stopOpacity={0} />
                                                </linearGradient>
                                            </defs>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                                            <XAxis dataKey="data" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                                            <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                                            <Tooltip
                                                contentStyle={{
                                                    backgroundColor: '#ffffff',
                                                    border: 'none',
                                                    borderRadius: '12px',
                                                    boxShadow: '0 10px 40px -10px rgba(0,0,0,0.15)',
                                                }}
                                                labelStyle={{ fontWeight: 600, color: '#1f2937' }}
                                            />
                                            <Area type="monotone" dataKey="gorduraVisceral" stroke="#a855f7" strokeWidth={3} fill="url(#colorGorduraVisceral)" dot={{ fill: '#a855f7', strokeWidth: 2, r: 4 }} activeDot={{ r: 6, fill: '#a855f7' }} />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        </div>
                    </div>
                </>
            ) : (
                <div className="rounded-xl border border-gray-200 bg-white p-12 text-center shadow-sm">
                    <i className="fa-duotone fa-weight-scale text-gray-300 text-5xl mb-4"></i>
                    <p className="text-gray-500 font-medium">Nenhuma pesagem registada</p>
                </div>
            )}
        </div>
    );
}
