"use client";

import { PerimetroCorporal } from "../types";
import { BADGE_STYLES } from "../../../lib/utils/bodyMetrics";

interface PerimetrosTabProps {
    perimetros: PerimetroCorporal[];
}

export function PerimetrosTab({ perimetros }: PerimetrosTabProps) {
    return (
        <div className="space-y-6">
            {perimetros.length > 0 ? (
                <>
                    {/* Table Card - Same style as PesagensTab */}
                    <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
                        <div className="border-b border-gray-100 px-6 py-5">
                            <h4 className="text-lg font-semibold text-gray-900 flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                                    <i className="fa-duotone fa-ruler-combined text-primary"></i>
                                </div>
                                Perímetros Corporais / Body Measurements
                            </h4>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="bg-gray-50 border-b border-gray-100">
                                        <th className="py-4 px-4 text-left font-semibold text-gray-700 text-sm xl:pl-8">Data</th>
                                        <th className="py-4 px-4 text-center font-semibold text-gray-700 text-sm hidden md:table-cell">MS Right</th>
                                        <th className="py-4 px-4 text-center font-semibold text-gray-700 text-sm hidden lg:table-cell">MS Right Flex</th>
                                        <th className="py-4 px-4 text-center font-semibold text-gray-700 text-sm hidden md:table-cell">MS Left</th>
                                        <th className="py-4 px-4 text-center font-semibold text-gray-700 text-sm hidden lg:table-cell">MS Left Flex</th>
                                        <th className="py-4 px-4 text-center font-semibold text-gray-700 text-sm">Chest</th>
                                        <th className="py-4 px-4 text-center font-semibold text-gray-700 text-sm">Waist</th>
                                        <th className="py-4 px-4 text-center font-semibold text-gray-700 text-sm hidden md:table-cell">Abdomen</th>
                                        <th className="py-4 px-4 text-center font-semibold text-gray-700 text-sm hidden lg:table-cell">Hips</th>
                                        <th className="py-4 px-4 text-center font-semibold text-gray-700 text-sm hidden lg:table-cell">Thigh R</th>
                                        <th className="py-4 px-4 text-center font-semibold text-gray-700 text-sm hidden lg:table-cell">Thigh L</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {perimetros.map((p, index) => (
                                        <tr key={index} className="border-b border-gray-100 hover:bg-gray-50/50 transition-colors">
                                            <td className="py-4 px-4 xl:pl-8">
                                                <div className="flex items-center gap-2">
                                                    <i className="fa-duotone fa-calendar-days text-primary text-sm"></i>
                                                    <span className="font-medium text-gray-900">{p.date}</span>
                                                </div>
                                            </td>
                                            <td className="py-4 px-4 text-center hidden md:table-cell">
                                                <span className={BADGE_STYLES.BLUE}>{p.msRight || "-"}</span>
                                            </td>
                                            <td className="py-4 px-4 text-center hidden lg:table-cell">
                                                <span className={BADGE_STYLES.BLUE}>{p.msRightFlex || "-"}</span>
                                            </td>
                                            <td className="py-4 px-4 text-center hidden md:table-cell">
                                                <span className={BADGE_STYLES.BLUE}>{p.msLeft || "-"}</span>
                                            </td>
                                            <td className="py-4 px-4 text-center hidden lg:table-cell">
                                                <span className={BADGE_STYLES.BLUE}>{p.msLeftFlex || "-"}</span>
                                            </td>
                                            <td className="py-4 px-4 text-center">
                                                <span className={BADGE_STYLES.BLUE}>{p.chest || "-"}</span>
                                            </td>
                                            <td className="py-4 px-4 text-center">
                                                <span className={BADGE_STYLES.BLUE}>{p.waist || "-"}</span>
                                            </td>
                                            <td className="py-4 px-4 text-center hidden md:table-cell">
                                                <span className={BADGE_STYLES.BLUE}>{p.abdomen || "-"}</span>
                                            </td>
                                            <td className="py-4 px-4 text-center hidden lg:table-cell">
                                                <span className={BADGE_STYLES.BLUE}>{p.hips || "-"}</span>
                                            </td>
                                            <td className="py-4 px-4 text-center hidden lg:table-cell">
                                                <span className={BADGE_STYLES.BLUE}>{p.thighR || "-"}</span>
                                            </td>
                                            <td className="py-4 px-4 text-center hidden lg:table-cell">
                                                <span className={BADGE_STYLES.BLUE}>{p.thighL || "-"}</span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </>
            ) : (
                <div className="rounded-xl border border-gray-200 bg-white p-12 text-center shadow-sm">
                    <i className="fa-duotone fa-ruler-combined text-gray-300 text-5xl mb-4"></i>
                    <p className="text-gray-500 font-medium">Nenhum perímetro registado</p>
                </div>
            )}
        </div>
    );
}
