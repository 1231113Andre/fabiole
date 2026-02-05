"use client";

import { AvaliacaoFisica } from "../types";
import { BADGE_STYLES, getMileResultStyle, classifyMileResult, classifySitUps, calculateAge } from "@/lib/body-metrics";

interface AvaliacoesTabProps {
    avaliacoes: AvaliacaoFisica[];
    gender?: string | null;
    birth?: string | null;
}

export function AvaliacoesTab({ avaliacoes, gender, birth }: AvaliacoesTabProps) {
    const userBirth = birth;
    const userGender = gender || 'Masculino'; // Default if unknown, though usually available
    return (
        <div className="space-y-6">
            {avaliacoes.length > 0 ? (
                <>
                    {/* Table Card - Same style as PesagensTab */}
                    <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
                        <div className="border-b border-gray-100 px-6 py-5">
                            <h4 className="text-lg font-semibold text-gray-900 flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                                    <i className="fa-duotone fa-dumbbell text-primary"></i>
                                </div>
                                Avaliação Física / Physical Evaluation
                            </h4>
                        </div>
                        <div className="overflow-x-auto premium-scrollbar shadow-inner">
                            <table className="w-full min-w-max">
                                <thead>
                                    <tr className="bg-gray-50 border-b border-gray-100">
                                        <th className="py-4 px-4 text-left font-semibold text-gray-700 text-sm xl:pl-8">Date</th>
                                        <th className="py-4 px-4 text-center font-semibold text-gray-700 text-sm">Push-Ups (1')</th>
                                        <th className="py-4 px-4 text-center font-semibold text-gray-700 text-sm hidden md:table-cell">Push-Ups Res.</th>
                                        <th className="py-4 px-4 text-center font-semibold text-gray-700 text-sm">Sit-Ups (1')</th>
                                        <th className="py-4 px-4 text-center font-semibold text-gray-700 text-sm hidden md:table-cell">Sit-Ups Res.</th>
                                        <th className="py-4 px-4 text-center font-semibold text-gray-700 text-sm hidden md:table-cell">Mile Time</th>
                                        <th className="py-4 px-4 text-center font-semibold text-gray-700 text-sm hidden lg:table-cell">Mile Result</th>
                                        <th className="py-4 px-4 text-left font-semibold text-gray-700 text-sm hidden xl:table-cell">Notes</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {avaliacoes.map((av, index) => {
                                        // Zawsze wyświetl wynik według aktualnej tabeli (Referências)
                                        const age = userBirth ? calculateAge(userBirth) : null;
                                        const pushRes =
                                            av.pushUps !== null && av.pushUps !== undefined && age != null
                                                ? classifySitUps(av.pushUps, age, userGender)
                                                : av.pushUpsResult || '';
                                        const mileRes =
                                            av.mile && age != null
                                                ? classifyMileResult(av.mile, age, userGender)
                                                : av.mileResult || '';
                                        const sitRes =
                                            av.sitUps !== null && av.sitUps !== undefined && age != null
                                                ? classifySitUps(av.sitUps, age, userGender)
                                                : '';

                                        return (
                                            <tr key={index} className="border-b border-gray-100 hover:bg-gray-50/50 transition-colors">
                                                <td className="py-4 px-4 xl:pl-8">
                                                    <div className="flex items-center gap-2">
                                                        <i className="fa-duotone fa-calendar-days text-primary text-sm"></i>
                                                        <span className="font-medium text-gray-900">{av.date}</span>
                                                    </div>
                                                </td>

                                                {/* Push ups */}
                                                <td className="py-4 px-4 text-center">
                                                    <span className={BADGE_STYLES.PURPLE}>{av.pushUps || "-"}</span>
                                                </td>

                                                {/* Push Ups Result (New Column) */}
                                                <td className="py-4 px-4 text-center hidden md:table-cell">
                                                    {pushRes ? (
                                                        <span className={getMileResultStyle(pushRes)}>
                                                            {pushRes}
                                                        </span>
                                                    ) : (
                                                        <span>-</span>
                                                    )}
                                                </td>

                                                {/* Sit ups */}
                                                <td className="py-4 px-4 text-center">
                                                    <span className={BADGE_STYLES.PURPLE}>{av.sitUps || "-"}</span>
                                                </td>

                                                {/* Sit-Ups Result */}
                                                <td className="py-4 px-4 text-center hidden md:table-cell">
                                                    {sitRes ? (
                                                        <span className={getMileResultStyle(sitRes)}>
                                                            {sitRes}
                                                        </span>
                                                    ) : (
                                                        <span>-</span>
                                                    )}
                                                </td>

                                                {/* Mile Time (Clean) */}
                                                <td className="py-4 px-4 text-center hidden md:table-cell">
                                                    <span className={BADGE_STYLES.INDIGO}>{av.mile || "-"}</span>
                                                </td>

                                                {/* Mile Result (Restored) */}
                                                <td className="py-4 px-4 text-center hidden lg:table-cell">
                                                    <div className="flex flex-col gap-1 items-center justify-center">
                                                        {mileRes ? (
                                                            <div className="flex items-center gap-1.5">
                                                                <i className="fa-duotone fa-person-running text-[10px] text-gray-400"></i>
                                                                <span className={getMileResultStyle(mileRes)}>
                                                                    {mileRes}
                                                                </span>
                                                            </div>
                                                        ) : (
                                                            <span>-</span>
                                                        )}
                                                    </div>
                                                </td>

                                                <td className="py-4 px-4 hidden xl:table-cell">
                                                    <span className="text-gray-500 text-sm">{av.notes || "-"}</span>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </>
            ) : (
                <div className="rounded-xl border border-gray-200 bg-white p-12 text-center shadow-sm">
                    <i className="fa-duotone fa-dumbbell text-gray-300 text-5xl mb-4"></i>
                    <p className="text-gray-500 font-medium">Nenhuma avaliação registada</p>
                </div>
            )}
        </div>
    );
}
