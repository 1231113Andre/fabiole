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
import {
    getBmiClassColor,
    getFatClassColor,
    getBmiIcon,
    getFatIcon,
    getDeltaPesoColor,
    BADGE_STYLES
} from "../../../lib/utils/bodyMetrics";
import { TooltipHeader } from "../../../components/ui/TooltipHeader";

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
                    <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-visible">
                        <div className="border-b border-gray-100 px-6 py-5">
                            <h4 className="text-lg font-semibold text-gray-900 flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                                    <i className="fa-duotone fa-weight-scale text-primary"></i>
                                </div>
                                Registo de Pesagens
                            </h4>
                        </div>
                        <div className="w-full overflow-visible">
                            <table className="w-full text-xs border-collapse table-auto">
                                <thead>
                                    <tr className="bg-gray-50 border-b">
                                        <th className="py-3 px-2 text-left font-semibold text-gray-700 whitespace-nowrap">Data</th>
                                        <th className="py-3 px-2 text-center font-semibold text-gray-700 whitespace-nowrap">Peso (kg)</th>
                                        <th className="py-3 px-2 text-center font-semibold text-violet-700 whitespace-nowrap">
                                            <TooltipHeader label="PESO" description="Δ Peso. Diferença entre pesagens consecutivas." />
                                        </th>
                                        <th className="py-3 px-2 text-center font-semibold text-gray-700 whitespace-nowrap">Altura (cm)</th>
                                        <th className="py-3 px-2 text-center font-semibold text-gray-700 whitespace-nowrap">% MG</th>
                                        <th className="py-3 px-2 text-center font-semibold text-violet-700 whitespace-nowrap">
                                            <TooltipHeader label="MM (kg)" description="Peso × (1 - %MG). Massa magra (LBM). Automático ao inserir dados." />
                                        </th>
                                        <th className="py-3 px-2 text-center font-semibold text-violet-700 whitespace-nowrap">
                                            <TooltipHeader label="% H2O" description="Fórmula Watson: calcula água corporal baseado em peso, altura, idade e género. Valor em kg abaixo." />
                                        </th>
                                        <th className="py-3 px-2 text-center font-semibold text-violet-700 whitespace-nowrap">
                                            <TooltipHeader label="IMC" description="Peso ÷ Altura². Automático ao inserir dados." />
                                        </th>
                                        <th className="py-3 px-2 text-center font-semibold text-gray-700 whitespace-nowrap">Gordura Visc.</th>
                                        <th className="py-3 px-2 text-center font-semibold text-gray-700 whitespace-nowrap">ID Metab.</th>
                                        <th className="py-3 px-2 text-center font-semibold text-gray-700 whitespace-nowrap">Massa Óssea</th>
                                        <th className="py-3 px-2 text-center font-semibold text-violet-700 whitespace-nowrap">
                                            <TooltipHeader label="Resultado IMC" description="Classificação automática baseada no IMC: Baixo Peso, Normal, Pré-obesidade ou Obesidade." isAuto={true} />
                                        </th>
                                        <th className="py-3 px-2 text-center font-semibold text-violet-700 whitespace-nowrap">
                                            <TooltipHeader label="Resultado %MG" description="Classificação automática baseada no género e % de gordura." isAuto={true} />
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-none">
                                    {pesagens.map((pesagem, index) => (
                                        <tr key={index} className="group hover:bg-gray-50/50 transition-colors duration-200 border-t border-solid border-gray-300 first:border-none">
                                            <td className="py-4 px-3 whitespace-nowrap font-medium text-gray-700">{pesagem.data}</td>
                                            <td className="py-4 px-3 text-center font-bold text-gray-900">
                                                {pesagem.peso ? (
                                                    <span className="flex items-center justify-center">
                                                        {pesagem.peso}<sup className="text-[7px] ml-0.5">kg</sup>
                                                    </span>
                                                ) : "-"}
                                            </td>
                                            <td className={`py-4 px-3 text-center font-semibold ${getDeltaPesoColor(pesagem.deltaPeso)}`}>
                                                {pesagem.deltaPeso !== undefined && pesagem.deltaPeso !== null ? `${pesagem.deltaPeso > 0 ? '+' : ''}${pesagem.deltaPeso} kg` : '-'}
                                            </td>
                                            <td className="py-4 px-3 text-center font-bold text-gray-700">
                                                {pesagem.height ? (
                                                    <div className="flex items-center justify-center">
                                                        <span>{pesagem.height}</span>
                                                        <div className="flex flex-col items-start ml-0.5 leading-none gap-0.5">
                                                            <span className="text-[10px] text-black font-bold">cm</span>
                                                            <span className="text-[9px] text-gray-900 font-normal whitespace-nowrap">(m'{String(pesagem.height % 100).padStart(2, '0')})</span>
                                                        </div>
                                                    </div>
                                                ) : '-'}
                                            </td>
                                            <td className="py-4 px-3 text-center font-semibold text-gray-700">
                                                {pesagem.percentualMG ? `${pesagem.percentualMG}%` : '-'}
                                            </td>
                                            <td className="py-4 px-3 text-center">
                                                <span className={BADGE_STYLES.PURPLE}>
                                                    {pesagem.MM ? (
                                                        <span className="flex items-center justify-center">
                                                            {pesagem.MM}<sup className="text-[7px] ml-0.5">kg</sup>
                                                        </span>
                                                    ) : '-'}
                                                </span>
                                            </td>
                                            <td className="py-4 px-3 text-center">
                                                {pesagem.H2O ? (() => {
                                                    // Calculate h2oKg from percentage and peso
                                                    const h2oPercent = parseFloat(String(pesagem.H2O).replace(',', '.'));
                                                    const peso = parseFloat(String(pesagem.peso).replace(',', '.'));
                                                    const h2oKg = !isNaN(h2oPercent) && !isNaN(peso) && peso > 0
                                                        ? ((h2oPercent / 100) * peso).toFixed(1)
                                                        : null;
                                                    return (
                                                        <span className={`${BADGE_STYLES.BLUE} flex flex-col items-center leading-tight`}>
                                                            <span className="flex items-center gap-1">
                                                                <i className="fa-duotone fa-droplet text-[9px]" />
                                                                {pesagem.H2O}%
                                                            </span>
                                                            {h2oKg && (
                                                                <span className="text-[10px] flex items-center">
                                                                    ({h2oKg})<sup className="text-[7px] ml-0.5">kg</sup>
                                                                </span>
                                                            )}
                                                        </span>
                                                    );
                                                })() : (
                                                    <span className={BADGE_STYLES.BLUE}>-</span>
                                                )}
                                            </td>
                                            <td className="py-4 px-3 text-center">
                                                <span className={BADGE_STYLES.GREEN}>{pesagem.IMC ? pesagem.IMC.toFixed(1).replace('.', ',') : "-"}</span>
                                            </td>
                                            <td className="py-4 px-3 text-center font-semibold text-gray-900">{pesagem.gordVisceral || "-"}</td>
                                            <td className="py-4 px-3 text-center font-semibold text-gray-900">{pesagem.IDMetabolica || "-"}</td>
                                            <td className="py-4 px-3 text-center font-semibold text-gray-900">{pesagem.massaOssea || "-"}</td>
                                            <td className="py-4 px-3 text-center">
                                                <span className={`${getBmiClassColor(pesagem.resultadoIMC || '')} gap-2`}>
                                                    <i className={`fa-duotone ${getBmiIcon(pesagem.resultadoIMC || '')}`}></i>
                                                    {pesagem.resultadoIMC || "-"}
                                                </span>
                                            </td>
                                            <td className="py-4 px-3 text-center">
                                                <span className={`${getFatClassColor(pesagem.resultadoPercentualMG || '')} gap-2`}>
                                                    <i className={`fa-duotone ${getFatIcon(pesagem.resultadoPercentualMG || '')}`}></i>
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
