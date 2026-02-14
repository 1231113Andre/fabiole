"use client";

import { PerimetroCorporal } from "../types";
import { BADGE_STYLES } from "@/lib/body-metrics";

interface PerimetrosTabProps {
    perimetros: PerimetroCorporal[];
}

const thMeasure = "py-3 px-2.5 text-center font-semibold text-gray-700 text-xs sm:text-sm whitespace-nowrap min-w-[3.5rem] sm:min-w-[4rem]";
const tdMeasure = "py-3 px-2.5 text-center align-middle text-xs sm:text-sm";

export function PerimetrosTab({ perimetros }: PerimetrosTabProps) {
    return (
        <div className="space-y-6 w-full min-w-0">
            {perimetros.length > 0 ? (
                <>
                    {/* Table Card – horizontal scroll on mobile, sticky first column */}
                    <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
                        <div className="border-b border-gray-100 px-4 sm:px-6 py-4 sm:py-5">
                            <h4 className="text-base sm:text-lg font-semibold text-gray-900 flex items-center gap-3">
                                <div className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-full bg-primary/10 shrink-0">
                                    <i className="fa-duotone fa-ruler-combined text-primary text-sm sm:text-base" />
                                </div>
                                <span className="min-w-0">Perímetros Corporais / Body Measurements</span>
                            </h4>
                        </div>
                        <div
                            className="w-full min-w-0 -mx-2 sm:mx-0 px-2 sm:px-0 overflow-x-auto overflow-y-hidden premium-scrollbar touch-pan-x border-t border-gray-100 bg-gray-50/50"
                            style={{ WebkitOverflowScrolling: "touch" }}
                            role="region"
                            aria-label="Tabela de perímetros – deslize para a esquerda ou direita para ver todas as colunas"
                        >
                            <table className="w-full border-collapse min-w-max text-xs sm:text-sm">
                                <thead>
                                    <tr className="bg-gray-100 border-b border-gray-200">
                                        <th className="py-3 px-2.5 text-left font-semibold text-gray-700 whitespace-nowrap min-w-[5rem] sm:min-w-[5.5rem]">
                                            Data
                                        </th>
                                        <th className={thMeasure}>MS Right</th>
                                        <th className={thMeasure}>MS R. Flex</th>
                                        <th className={thMeasure}>MS Left</th>
                                        <th className={thMeasure}>MS L. Flex</th>
                                        <th className={thMeasure}>Chest</th>
                                        <th className={thMeasure}>Waist</th>
                                        <th className={thMeasure}>Abdomen</th>
                                        <th className={thMeasure}>Hips</th>
                                        <th className={thMeasure}>Thigh R</th>
                                        <th className={thMeasure}>Thigh L</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {perimetros.map((p, index) => (
                                        <tr key={index} className="border-b border-gray-200 hover:bg-gray-100/80 transition-colors bg-white">
                                            <td className="py-3 px-2.5 whitespace-nowrap font-semibold text-gray-800">
                                                <div className="flex items-center gap-2">
                                                    <i className="fa-duotone fa-calendar-days text-primary text-[10px] sm:text-sm shrink-0" />
                                                    <span>{p.date}</span>
                                                </div>
                                            </td>
                                            <td className={tdMeasure}>
                                                <span className={BADGE_STYLES.BLUE}>{p.msRight ?? "-"}</span>
                                            </td>
                                            <td className={tdMeasure}>
                                                <span className={BADGE_STYLES.BLUE}>{p.msRightFlex ?? "-"}</span>
                                            </td>
                                            <td className={tdMeasure}>
                                                <span className={BADGE_STYLES.BLUE}>{p.msLeft ?? "-"}</span>
                                            </td>
                                            <td className={tdMeasure}>
                                                <span className={BADGE_STYLES.BLUE}>{p.msLeftFlex ?? "-"}</span>
                                            </td>
                                            <td className={tdMeasure}>
                                                <span className={BADGE_STYLES.BLUE}>{p.chest ?? "-"}</span>
                                            </td>
                                            <td className={tdMeasure}>
                                                <span className={BADGE_STYLES.BLUE}>{p.waist ?? "-"}</span>
                                            </td>
                                            <td className={tdMeasure}>
                                                <span className={BADGE_STYLES.BLUE}>{p.abdomen ?? "-"}</span>
                                            </td>
                                            <td className={tdMeasure}>
                                                <span className={BADGE_STYLES.BLUE}>{p.hips ?? "-"}</span>
                                            </td>
                                            <td className={tdMeasure}>
                                                <span className={BADGE_STYLES.BLUE}>{p.thighR ?? "-"}</span>
                                            </td>
                                            <td className={tdMeasure}>
                                                <span className={BADGE_STYLES.BLUE}>{p.thighL ?? "-"}</span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </>
            ) : (
                <div className="rounded-xl border border-gray-200 bg-white p-8 sm:p-12 text-center shadow-sm">
                    <i className="fa-duotone fa-ruler-combined text-gray-300 text-4xl sm:text-5xl mb-4" />
                    <p className="text-gray-500 font-medium text-sm sm:text-base">Nenhum perímetro registado</p>
                </div>
            )}
        </div>
    );
}
