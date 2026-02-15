"use client";

import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
} from "recharts";
import { Pesagem, ChartData } from "../types";
import {
    getBmiClassColor,
    getFatClassColor,
    getBmiIcon,
    getFatIcon,
    getDeltaPesoColor,
    getMileResultStyle,
    calculateSMI,
    calculateSMIFromLimbs,
    classifySMI,
    classifyBMI,
    classifyBodyFat,
    calculateAge,
    BADGE_STYLES
} from "@/lib/body-metrics";
import { TooltipHeader } from "../../../components/ui/TooltipHeader";
import { CustomChartTooltip } from "./CustomChartTooltip";

interface PesagensTabProps {
    pesagens: Pesagem[];
    chartData: ChartData[];
    /** User gender for SMI classification (e.g. "masculino" / "feminino"). */
    gender?: string | null;
    birth?: string | null;
}

export function PesagensTab({ pesagens, chartData, gender, birth }: PesagensTabProps) {
    return (
        <div className="w-full min-w-0 space-y-4 sm:space-y-5 overflow-hidden">
            {pesagens.length > 0 ? (
                <>
                    {/* Table Card – compact padding; horizontal scroll only inside this block (no page overflow) */}
                    <div className="w-full min-w-0 rounded-lg sm:rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
                        <div className="border-b border-gray-100 px-3 py-3 sm:px-4 sm:py-4">
                            <h4 className="text-base sm:text-lg font-semibold text-gray-900 flex items-center gap-2 sm:gap-3">
                                <div className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-full bg-primary/10 shrink-0">
                                    <i className="fa-duotone fa-weight-scale text-primary text-sm sm:text-base"></i>
                                </div>
                                <span className="truncate">Registo de Pesagens</span>
                            </h4>
                            {/* Mobile-only: hint that table scrolls horizontally */}
                            <p className="md:hidden mt-2 text-xs text-muted-foreground flex items-center gap-1.5" aria-hidden="true">
                                <i className="fa-duotone fa-arrows-left-right text-[10px]" />
                                Deslize para a direita para ver mais colunas
                            </p>
                        </div>
                        <div className="w-full min-w-0 overflow-x-auto overflow-y-hidden premium-scrollbar shadow-inner touch-pan-x" role="region" aria-label="Tabela de pesagens – deslize horizontalmente para ver todas as colunas">
                            <table className="w-full text-xs sm:text-sm border-collapse" style={{ minWidth: 1000 }}>
                                <colgroup>
                                    <col style={{ minWidth: 68 }} />
                                    <col style={{ minWidth: 48 }} />
                                    <col style={{ minWidth: 52 }} />
                                    <col style={{ minWidth: 62 }} />
                                    <col style={{ minWidth: 42 }} />
                                    <col style={{ minWidth: 60 }} />
                                    <col style={{ minWidth: 68 }} />
                                    <col style={{ minWidth: 42 }} />
                                    <col style={{ minWidth: 40 }} />
                                    <col style={{ minWidth: 40 }} />
                                    <col style={{ minWidth: 52 }} />
                                    <col style={{ minWidth: 118 }} />
                                    <col style={{ minWidth: 118 }} />
                                    <col style={{ minWidth: 48 }} />
                                    <col style={{ minWidth: 118 }} />
                                </colgroup>
                                <thead>
                                    <tr className="bg-gray-50 border-b">
                                        <th className="py-1.5 px-1.5 text-left font-semibold text-gray-700 text-[11px] sm:text-xs">Data</th>
                                        <th className="py-1.5 px-1.5 text-center font-semibold text-gray-700 text-[11px] sm:text-xs">Peso</th>
                                        <th className="py-1.5 px-1.5 text-center font-semibold text-violet-700 text-[11px] sm:text-xs">
                                            <TooltipHeader label="Δ" description="Δ Peso. Diferença entre pesagens consecutivas." />
                                        </th>
                                        <th className="py-1.5 px-1.5 text-center font-semibold text-gray-700 text-[11px] sm:text-xs">Alt.</th>
                                        <th className="py-1.5 px-1.5 text-center font-semibold text-gray-700 text-[11px] sm:text-xs">% MG</th>
                                        <th className="py-1.5 px-1.5 text-center font-semibold text-violet-700 text-[11px] sm:text-xs">
                                            <TooltipHeader label="MM" description="Peso × (1 - %MG). Massa magra (LBM)." isAuto={true} />
                                        </th>
                                        <th className="py-1.5 px-1.5 text-center font-semibold text-violet-700 text-[11px] sm:text-xs">
                                            <TooltipHeader label="H2O" description="Fórmula Watson: água corporal a partir de peso, altura, género e idade (homens). % e kg." isAuto={true} />
                                        </th>
                                        <th className="py-1.5 px-1.5 text-center font-semibold text-violet-700 text-[11px] sm:text-xs">
                                            <TooltipHeader label="IMC" description="Peso ÷ Altura²." isAuto={true} />
                                        </th>
                                        <th className="py-1.5 px-1.5 text-center font-semibold text-gray-700 text-[11px] sm:text-xs">G.Visc.</th>
                                        <th className="py-1.5 px-1.5 text-center font-semibold text-gray-700 text-[11px] sm:text-xs">ID M.</th>
                                        <th className="py-1.5 px-1.5 text-center font-semibold text-gray-700 text-[11px] sm:text-xs">M.Óssea</th>
                                        <th className="py-1.5 px-1.5 text-center font-semibold text-violet-700 text-[11px] sm:text-xs">
                                            <TooltipHeader label="Res. IMC" description="Classificação automática: baixo peso, normal, pré-obesidade, obesidade (graus I–III)." isAuto={true} />
                                        </th>
                                        <th className="py-1.5 px-1.5 text-center font-semibold text-violet-700 text-[11px] sm:text-xs">
                                            <TooltipHeader label="Res. %MG" description="Classificação por género, idade e % gordura (escalas por faixa etária)." isAuto={true} />
                                        </th>
                                        <th className="py-1.5 px-1.5 text-center font-semibold text-violet-700 text-[11px] sm:text-xs">
                                            <TooltipHeader label="SMI" description="Novo cálculo: se MS+MI (4 membros) preenchidos → soma ÷ Altura². Caso contrário → MM ÷ Altura². Resultado em kg/m²." isAuto={true} />
                                        </th>
                                        <th className="py-1.5 px-1.5 text-center font-semibold text-violet-700 text-[11px] sm:text-xs">
                                            <TooltipHeader label="SMI Res." description="Classificação por género." isAuto={true} />
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-none">
                                    {pesagens.map((pesagem, index) => (
                                        <tr key={index} className="group hover:bg-gray-50/50 transition-colors duration-200 border-t border-solid border-gray-300 first:border-none">
                                            <td className="py-1.5 px-1.5 whitespace-nowrap font-medium text-gray-700 text-[11px] sm:text-xs">{pesagem.data}</td>
                                            <td className="py-1.5 px-1.5 text-center font-bold text-gray-900 whitespace-nowrap text-[11px] sm:text-xs">
                                                {pesagem.peso ? (
                                                    <span className="inline-flex items-center justify-center gap-0.5">
                                                        {pesagem.peso}<sup className="text-[8px]">kg</sup>
                                                    </span>
                                                ) : "-"}
                                            </td>
                                            <td className={`py-1.5 px-1.5 text-center font-semibold whitespace-nowrap text-[11px] sm:text-xs ${getDeltaPesoColor(pesagem.deltaPeso)}`}>
                                                {pesagem.deltaPeso !== undefined && pesagem.deltaPeso !== null ? `${pesagem.deltaPeso > 0 ? '+' : ''}${pesagem.deltaPeso} kg` : '-'}
                                            </td>
                                            <td className="py-1.5 px-1.5 text-center font-bold text-gray-700 whitespace-nowrap text-[11px] sm:text-xs">
                                                {pesagem.height ? (
                                                    <span className="inline-flex items-center gap-0.5">
                                                        {pesagem.height}
                                                        <span className="text-[9px] text-gray-600">cm</span>
                                                    </span>
                                                ) : '-'}
                                            </td>
                                            <td className="py-1.5 px-1.5 text-center font-semibold text-gray-700 whitespace-nowrap text-[11px] sm:text-xs">
                                                {pesagem.percentualMG ? `${pesagem.percentualMG}%` : '-'}
                                            </td>
                                            <td className="py-1.5 px-1.5 text-center align-middle">
                                                <span className={`${BADGE_STYLES.PURPLE} inline-flex items-center justify-center gap-0.5 whitespace-nowrap text-[11px] sm:text-xs`}>
                                                    {pesagem.MM ? <>{pesagem.MM}<sup className="text-[8px]">kg</sup></> : '-'}
                                                </span>
                                            </td>
                                            <td className="py-1.5 px-1.5 text-center align-middle">
                                                {pesagem.H2O ? (() => {
                                                    const h2oPercent = parseFloat(String(pesagem.H2O).replace(',', '.'));
                                                    const peso = parseFloat(String(pesagem.peso).replace(',', '.'));
                                                    const h2oKg = !isNaN(h2oPercent) && !isNaN(peso) && peso > 0
                                                        ? ((h2oPercent / 100) * peso).toFixed(1)
                                                        : null;
                                                    return (
                                                        <span className={`${BADGE_STYLES.BLUE} inline-flex flex-col items-center justify-center leading-tight whitespace-nowrap text-[11px] sm:text-xs`}>
                                                            <span className="inline-flex items-center gap-0.5">
                                                                <i className="fa-duotone fa-droplet text-[10px]" />
                                                                {pesagem.H2O}%
                                                            </span>
                                                            {h2oKg && <span className="text-[9px]">({h2oKg} kg)</span>}
                                                        </span>
                                                    );
                                                })() : (
                                                    <span className={`${BADGE_STYLES.BLUE} whitespace-nowrap text-[11px] sm:text-xs`}>-</span>
                                                )}
                                            </td>
                                            <td className="py-1.5 px-1.5 text-center align-middle">
                                                <span className={`${BADGE_STYLES.GREEN} inline-flex items-center justify-center whitespace-nowrap text-[11px] sm:text-xs`}>
                                                    {pesagem.IMC ? pesagem.IMC.toFixed(1).replace('.', ',') : "-"}
                                                </span>
                                            </td>
                                            <td className="py-1.5 px-1.5 text-center font-semibold text-gray-900 whitespace-nowrap text-[11px] sm:text-xs">{pesagem.gordVisceral || "-"}</td>
                                            <td className="py-1.5 px-1.5 text-center font-semibold text-gray-900 whitespace-nowrap text-[11px] sm:text-xs">{pesagem.IDMetabolica || "-"}</td>
                                            <td className="py-1.5 px-1.5 text-center font-semibold text-gray-900 whitespace-nowrap text-[11px] sm:text-xs">{pesagem.massaOssea || "-"}</td>
                                            <td className="py-1.5 px-1.5 text-center align-middle">
                                                {(() => {
                                                    const resBmi = classifyBMI(pesagem.IMC);
                                                    return (
                                                        <span className={`${getBmiClassColor(resBmi)} inline-flex items-center justify-center gap-0.5 whitespace-nowrap text-[11px] sm:text-xs`}>
                                                            <i className={`fa-duotone ${getBmiIcon(resBmi)} shrink-0 text-[10px]`}></i>
                                                            <span>{resBmi || "-"}</span>
                                                        </span>
                                                    );
                                                })()}
                                            </td>
                                            <td className="py-1.5 px-1.5 text-center align-middle">
                                                {(() => {
                                                    const age = birth ? calculateAge(birth) : null;
                                                    const resFat = classifyBodyFat(pesagem.percentualMG, gender as any, age);
                                                    return (
                                                        <span className={`${getFatClassColor(resFat)} inline-flex items-center justify-center gap-0.5 whitespace-nowrap text-[11px] sm:text-xs`}>
                                                            <i className={`fa-duotone ${getFatIcon(resFat)} shrink-0 text-[10px]`}></i>
                                                            <span>{resFat || "-"}</span>
                                                        </span>
                                                    );
                                                })()}
                                            </td>
                                            <td className="py-1.5 px-1.5 text-center align-middle">
                                                {(() => {
                                                    const { msRight, msLeft, miRight, miLeft, height, MM } = pesagem;

                                                    // Try new formula first
                                                    let smiVal = (msRight && msLeft && miRight && miLeft && height && height > 0)
                                                        ? calculateSMIFromLimbs(msRight, msLeft, miRight, miLeft, height)
                                                        : null;

                                                    // Fallback
                                                    if (smiVal == null && MM != null && MM > 0 && height != null && height > 0) {
                                                        smiVal = calculateSMI(MM, height);
                                                    }

                                                    return smiVal != null ? (
                                                        <span className={`${BADGE_STYLES.PURPLE} inline-flex items-center justify-center whitespace-nowrap text-[11px] sm:text-xs`}>
                                                            {smiVal.toFixed(2).replace('.', ',')}
                                                        </span>
                                                    ) : '-';
                                                })()}
                                            </td>
                                            <td className="py-1.5 px-1.5 text-center align-middle">
                                                {(() => {
                                                    const { msRight, msLeft, miRight, miLeft, height, MM } = pesagem;

                                                    // Try new formula first: (Arms + Legs) / Height²
                                                    let smiVal = (msRight && msLeft && miRight && miLeft && height && height > 0)
                                                        ? calculateSMIFromLimbs(msRight, msLeft, miRight, miLeft, height)
                                                        : null;

                                                    // Fallback: MM / Height² (if limb data missing but Total MM exists)
                                                    if (smiVal == null && MM != null && MM > 0 && height != null && height > 0) {
                                                        smiVal = calculateSMI(MM, height);
                                                    }

                                                    const smiRes = (smiVal != null && gender)
                                                        ? classifySMI(smiVal, gender)
                                                        : '';

                                                    return smiRes ? (
                                                        <span className={`${getMileResultStyle(smiRes)} inline-flex items-center justify-center whitespace-nowrap text-[11px] sm:text-xs`}>
                                                            {smiRes}
                                                        </span>
                                                    ) : '-';
                                                })()}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Charts Grid – compact spacing */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-2 gap-4 sm:gap-5 w-full min-w-0">
                        {/* Peso Chart */}
                        <div className="w-full min-w-0 rounded-lg sm:rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden flex flex-col">
                            <div className="border-b border-gray-100 px-3 py-3 sm:px-4 sm:py-4">
                                <h3 className="font-semibold text-gray-900 flex items-center gap-2 sm:gap-3 text-sm sm:text-base">
                                    <div className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-full bg-gradient-to-br from-orange-400 to-amber-600 shrink-0">
                                        <i className="fa-duotone fa-weight-scale text-white text-xs sm:text-sm"></i>
                                    </div>
                                    Peso (kg)
                                </h3>
                            </div>
                            <div className="p-3 sm:p-4 flex-1 min-h-0">
                                <div className="h-[200px] sm:h-[240px] lg:h-[260px] w-full min-w-0 min-h-[180px]">
                                    <AreaChart data={chartData} responsive width="100%" height="100%" style={{ minHeight: 180, minWidth: 100 }}>
                                        <defs>
                                            <linearGradient id="colorPeso" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#e6915b" stopOpacity={0.3} />
                                                <stop offset="95%" stopColor="#e6915b" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                                        <XAxis dataKey="data" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                                        <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                                        <Tooltip content={<CustomChartTooltip unit="kg" />} />
                                        <Area
                                            type="monotone"
                                            dataKey="peso"
                                            stroke="#e6915b"
                                            strokeWidth={3}
                                            fill="url(#colorPeso)"
                                            dot={{ fill: '#e6915b', stroke: '#fff', strokeWidth: 2, r: 4 }}
                                            activeDot={{ r: 6, fill: '#e6915b', stroke: '#fff', strokeWidth: 2 }}
                                        />
                                    </AreaChart>
                                </div>
                            </div>
                        </div>

                        {/* Massa Gorda Chart */}
                        <div className="w-full min-w-0 rounded-lg sm:rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden flex flex-col">
                            <div className="border-b border-gray-100 px-3 py-3 sm:px-4 sm:py-4">
                                <h3 className="font-semibold text-gray-900 flex items-center gap-2 sm:gap-3 text-sm sm:text-base">
                                    <div className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-full bg-gradient-to-br from-rose-400 to-rose-600 shrink-0">
                                        <i className="fa-duotone fa-chart-pie text-white text-xs sm:text-sm"></i>
                                    </div>
                                    Massa Gorda (%)
                                </h3>
                            </div>
                            <div className="p-3 sm:p-4 flex-1 min-h-0">
                                <div className="h-[200px] sm:h-[240px] lg:h-[260px] w-full min-w-0 min-h-[180px]">
                                    <AreaChart data={chartData} responsive width="100%" height="100%" style={{ minHeight: 180, minWidth: 100 }}>
                                        <defs>
                                            <linearGradient id="colorMassaGorda" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.3} />
                                                <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                                        <XAxis dataKey="data" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                                        <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                                        <Tooltip content={<CustomChartTooltip unit="%" />} />
                                        <Area
                                            type="monotone"
                                            dataKey="massaGorda"
                                            stroke="#f43f5e"
                                            strokeWidth={3}
                                            fill="url(#colorMassaGorda)"
                                            dot={{ fill: '#f43f5e', stroke: '#fff', strokeWidth: 2, r: 4 }}
                                            activeDot={{ r: 6, fill: '#f43f5e', stroke: '#fff', strokeWidth: 2 }}
                                        />
                                    </AreaChart>
                                </div>
                            </div>
                        </div>

                        {/* Massa Muscular Chart */}
                        <div className="w-full min-w-0 rounded-lg sm:rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden flex flex-col">
                            <div className="border-b border-gray-100 px-3 py-3 sm:px-4 sm:py-4">
                                <h3 className="font-semibold text-gray-900 flex items-center gap-2 sm:gap-3 text-sm sm:text-base">
                                    <div className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-full bg-gradient-to-br from-blue-400 to-blue-600 shrink-0">
                                        <i className="fa-duotone fa-dumbbell text-white text-xs sm:text-sm"></i>
                                    </div>
                                    Massa Muscular (kg)
                                </h3>
                            </div>
                            <div className="p-3 sm:p-4 flex-1 min-h-0">
                                <div className="h-[200px] sm:h-[240px] lg:h-[260px] w-full min-w-0 min-h-[180px]">
                                    <AreaChart data={chartData} responsive width="100%" height="100%" style={{ minHeight: 180, minWidth: 100 }}>
                                        <defs>
                                            <linearGradient id="colorMassaMuscular" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                                                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                                        <XAxis dataKey="data" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                                        <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                                        <Tooltip content={<CustomChartTooltip unit="kg" />} />
                                        <Area
                                            type="monotone"
                                            dataKey="massaMuscular"
                                            stroke="#3b82f6"
                                            strokeWidth={3}
                                            fill="url(#colorMassaMuscular)"
                                            dot={{ fill: '#3b82f6', stroke: '#fff', strokeWidth: 2, r: 4 }}
                                            activeDot={{ r: 6, fill: '#3b82f6', stroke: '#fff', strokeWidth: 2 }}
                                        />
                                    </AreaChart>
                                </div>
                            </div>
                        </div>

                        {/* Gordura Visceral Chart */}
                        <div className="w-full min-w-0 rounded-lg sm:rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden flex flex-col">
                            <div className="border-b border-gray-100 px-3 py-3 sm:px-4 sm:py-4">
                                <h3 className="font-semibold text-gray-900 flex items-center gap-2 sm:gap-3 text-sm sm:text-base">
                                    <div className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-full bg-gradient-to-br from-purple-400 to-purple-600 shrink-0">
                                        <i className="fa-duotone fa-heart-pulse text-white text-xs sm:text-sm"></i>
                                    </div>
                                    Gordura Visceral
                                </h3>
                            </div>
                            <div className="p-3 sm:p-4 flex-1 min-h-0">
                                <div className="h-[200px] sm:h-[240px] lg:h-[260px] w-full min-w-0 min-h-[180px]">
                                    <AreaChart data={chartData} responsive width="100%" height="100%" style={{ minHeight: 180, minWidth: 100 }}>
                                        <defs>
                                            <linearGradient id="colorGorduraVisceral" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#a855f7" stopOpacity={0.3} />
                                                <stop offset="95%" stopColor="#a855f7" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                                        <XAxis dataKey="data" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                                        <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                                        <Tooltip content={<CustomChartTooltip />} />
                                        <Area
                                            type="monotone"
                                            dataKey="gorduraVisceral"
                                            stroke="#a855f7"
                                            strokeWidth={3}
                                            fill="url(#colorGorduraVisceral)"
                                            dot={{ fill: '#a855f7', stroke: '#fff', strokeWidth: 2, r: 4 }}
                                            activeDot={{ r: 6, fill: '#a855f7', stroke: '#fff', strokeWidth: 2 }}
                                        />
                                    </AreaChart>
                                </div>
                            </div>
                        </div>
                    </div>
                </>
            ) : (
                <div className="w-full min-w-0 rounded-xl border border-gray-200 bg-white p-12 text-center shadow-sm">
                    <i className="fa-duotone fa-weight-scale text-gray-300 text-5xl mb-4"></i>
                    <p className="text-gray-500 font-medium">Nenhuma pesagem registada</p>
                </div>
            )}
        </div>
    );
}
