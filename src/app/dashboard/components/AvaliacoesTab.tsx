"use client";

import { AvaliacaoFisica } from "../types";
import { BADGE_STYLES, getMileResultStyle, classifyMileResult, classifySitUps, classifyPushUps, calculateAge } from "@/lib/body-metrics";

interface AvaliacoesTabProps {
    avaliacoes: AvaliacaoFisica[];
    gender?: string | null;
    birth?: string | null;
}

const thMeasure = "py-3 px-2.5 text-center font-semibold text-gray-700 text-xs sm:text-sm whitespace-nowrap min-w-[3.5rem] sm:min-w-[4rem]";
const tdMeasure = "py-3 px-2.5 text-center align-middle text-xs sm:text-sm";

export function AvaliacoesTab({ avaliacoes, gender, birth }: AvaliacoesTabProps) {
    const userBirth = birth;
    const userGender = gender || "Masculino";

    return (
        <div className="space-y-6 w-full min-w-0">
            {avaliacoes.length > 0 ? (
                <>
                    {/* Table Card – horizontal scroll on mobile, sticky first column */}
                    <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
                        <div className="border-b border-gray-100 px-4 sm:px-6 py-4 sm:py-5">
                            <h4 className="text-base sm:text-lg font-semibold text-gray-900 flex items-center gap-3">
                                <div className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-full bg-primary/10 shrink-0">
                                    <i className="fa-duotone fa-dumbbell text-primary text-sm sm:text-base" />
                                </div>
                                <span className="min-w-0">Avaliação Física</span>
                            </h4>
                        </div>
                        <div
                            className="w-full min-w-0 -mx-2 sm:mx-0 px-2 sm:px-0 overflow-x-auto overflow-y-hidden premium-scrollbar touch-pan-x border-t border-gray-100 bg-gray-50/50"
                            style={{ WebkitOverflowScrolling: "touch" }}
                            role="region"
                            aria-label="Tabela de avaliações – deslize para a esquerda ou direita para ver todas as colunas"
                        >
                            <table className="w-full border-collapse min-w-max text-xs sm:text-sm">
                                <thead>
                                    <tr className="bg-gray-100 border-b border-gray-200">
                                        <th className="py-3 px-2.5 text-left font-semibold text-gray-700 whitespace-nowrap min-w-[5rem] sm:min-w-[5.5rem]">
                                            Data
                                        </th>
                                        <th className={thMeasure}>Flexões (1&apos;)</th>
                                        <th className={`${thMeasure} min-w-[5rem]`}>Res. Flexões</th>
                                        <th className={thMeasure}>Abdominais (1&apos;)</th>
                                        <th className={`${thMeasure} min-w-[5rem]`}>Res. Abdominais</th>
                                        <th className={thMeasure}>Tempo 1 milha</th>
                                        <th className={`${thMeasure} min-w-[5rem]`}>Resultado Milha</th>
                                        <th className={`${thMeasure} min-w-[6rem] sm:min-w-[8rem] text-left`}>Notas</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {avaliacoes.map((av, index) => {
                                        const age = userBirth ? calculateAge(userBirth) : null;
                                        const pushRes =
                                            av.pushUps !== null && av.pushUps !== undefined && age != null
                                                ? classifyPushUps(av.pushUps, age, userGender)
                                                : av.pushUpsResult || "";
                                        const mileRes =
                                            av.mile && age != null
                                                ? classifyMileResult(av.mile, age, userGender)
                                                : av.mileResult || "";
                                        const sitRes =
                                            av.sitUps !== null && av.sitUps !== undefined && age != null
                                                ? classifySitUps(av.sitUps, age, userGender)
                                                : "";

                                        return (
                                            <tr key={index} className="border-b border-gray-200 hover:bg-gray-100/80 transition-colors bg-white">
                                                <td className="py-3 px-2.5 whitespace-nowrap font-semibold text-gray-800">
                                                    <div className="flex items-center gap-2">
                                                        <i className="fa-duotone fa-calendar-days text-primary text-[10px] sm:text-sm shrink-0" />
                                                        <span>{av.date}</span>
                                                    </div>
                                                </td>

                                                <td className={tdMeasure}>
                                                    <span className={BADGE_STYLES.PURPLE}>{av.pushUps ?? "-"}</span>
                                                </td>

                                                <td className={tdMeasure}>
                                                    {pushRes ? (
                                                        <span className={getMileResultStyle(pushRes)}>{pushRes}</span>
                                                    ) : (
                                                        <span className="text-gray-400">-</span>
                                                    )}
                                                </td>

                                                <td className={tdMeasure}>
                                                    <span className={BADGE_STYLES.PURPLE}>{av.sitUps ?? "-"}</span>
                                                </td>

                                                <td className={tdMeasure}>
                                                    {sitRes ? (
                                                        <span className={getMileResultStyle(sitRes)}>{sitRes}</span>
                                                    ) : (
                                                        <span className="text-gray-400">-</span>
                                                    )}
                                                </td>

                                                <td className={tdMeasure}>
                                                    <span className={BADGE_STYLES.INDIGO}>{av.mile ?? "-"}</span>
                                                </td>

                                                <td className={tdMeasure}>
                                                    {mileRes ? (
                                                        <div className="flex items-center justify-center gap-1.5">
                                                            <i className="fa-duotone fa-person-running text-[10px] text-gray-400 shrink-0" />
                                                            <span className={getMileResultStyle(mileRes)}>{mileRes}</span>
                                                        </div>
                                                    ) : (
                                                        <span className="text-gray-400">-</span>
                                                    )}
                                                </td>

                                                <td className={`${tdMeasure} text-left max-w-[200px] sm:max-w-[280px]`}>
                                                    <span className="text-gray-600 line-clamp-2" title={av.notes || undefined}>
                                                        {av.notes ?? "-"}
                                                    </span>
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
                <div className="rounded-xl border border-gray-200 bg-white p-8 sm:p-12 text-center shadow-sm">
                    <i className="fa-duotone fa-dumbbell text-gray-300 text-4xl sm:text-5xl mb-4" />
                    <p className="text-gray-500 font-medium text-sm sm:text-base">Nenhuma avaliação registada</p>
                </div>
            )}
        </div>
    );
}
