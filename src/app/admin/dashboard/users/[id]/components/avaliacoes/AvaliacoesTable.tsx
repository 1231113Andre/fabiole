import React from "react";
import { Avaliacao } from "../../types";
import { BADGE_STYLES, classifyMileResult, classifyPushUps, calculateAge } from "@/lib/utils/bodyMetrics";
import { TooltipHeader } from "@/components/ui/TooltipHeader";

const getMileResultStyle = (result: string | null): string => {
    if (!result) return BADGE_STYLES.GRAY;
    const r = result.toLowerCase();
    if (r.includes('excelente') || r.includes('bom') || r.includes('apto') || r.includes('fit')) return BADGE_STYLES.GREEN;
    if (r.includes('médio') || r.includes('medio') || r.includes('regular') || r.includes('atenção')) return BADGE_STYLES.YELLOW;
    if (r.includes('fraco') || r.includes('not fit') || r.includes('mau') || r.includes('risco')) return BADGE_STYLES.RED;
    return BADGE_STYLES.BLUE;
}

interface AvaliacoesTableProps {
    avaliacoes: Avaliacao[];
    onEdit: (a: Avaliacao) => void;
    onDelete: (id: number) => void;
    gender?: string | null;
    userBirth?: string | null;
}

export const AvaliacoesTable: React.FC<AvaliacoesTableProps> = ({
    avaliacoes,
    onEdit,
    onDelete,
    gender,
    userBirth
}) => {
    if (avaliacoes.length === 0) {
        return (
            <div className="py-12 text-center text-gray-500">
                <i className="fa-duotone fa-dumbbell text-4xl mb-3 text-gray-300"></i>
                <p>Nenhuma avaliação registada</p>
            </div>
        );
    }

    return (
        <div className="w-full overflow-visible pb-16">
            <table className="w-full text-xs border-collapse table-auto">
                <thead>
                    <tr className="bg-gray-50 border-b">
                        <th className="py-3 px-2 text-left font-semibold text-gray-700 whitespace-nowrap">Data</th>
                        <th className="py-3 px-2 text-center font-semibold text-gray-700 whitespace-nowrap hidden md:table-cell">
                            <TooltipHeader
                                label={<span className="flex items-center gap-1.5"><i className="fa-duotone fa-dumbbell"></i> Flexões</span>}
                                description="Número de flexões realizadas."
                                isAuto={false}
                            />
                        </th>
                        <th className="py-3 px-2 text-center font-semibold text-gray-700 whitespace-nowrap hidden md:table-cell">
                            <TooltipHeader
                                label={<span className="flex items-center gap-1.5"><i className="fa-duotone fa-star-half-stroke"></i> Class. Flexões</span>}
                                description={`Classificação baseada em:\nGénero: ${gender === 'M' ? 'Masculino' : 'Feminino'}\nIdade: ${calculateAge(userBirth) ?? 'N/A'} anos`}
                                isAuto={false}
                            />
                        </th>
                        <th className="py-3 px-2 text-center font-semibold text-gray-700 whitespace-nowrap hidden md:table-cell">
                            <TooltipHeader
                                label={<span className="flex items-center gap-1.5"><i className="fa-duotone fa-dumbbell"></i> Abdominais</span>}
                                description="Número de abdominais realizados."
                                isAuto={false}
                            />
                        </th>
                        <th className="py-3 px-2 text-center font-semibold text-gray-700 whitespace-nowrap hidden md:table-cell">
                            <TooltipHeader
                                label={<span className="flex items-center gap-1.5"><i className="fa-duotone fa-person-running"></i> Milha</span>}
                                description="Tempo na milha."
                                isAuto={false}
                            />
                        </th>
                        <th className="py-3 px-2 text-center font-semibold text-gray-700 whitespace-nowrap">
                            <TooltipHeader
                                label={<span className="flex items-center gap-1.5"><i className="fa-duotone fa-trophy"></i> Class. Milha</span>}
                                description={`Classificação baseada em:\nGénero: ${gender === 'M' ? 'Masculino' : 'Feminino'}\nIdade: ${calculateAge(userBirth) ?? 'N/A'} anos`}
                                isAuto={false}
                            />
                        </th>
                        <th className="py-3 px-2 text-center font-semibold text-gray-700 whitespace-nowrap">
                            <TooltipHeader
                                label={<span className="flex items-center gap-1.5"><i className="fa-duotone fa-note-sticky"></i> Notas</span>}
                                description="Observações adicionais."
                                isAuto={false}
                            />
                        </th>
                        <th className="py-3 px-2 text-right font-semibold text-gray-700 whitespace-nowrap">Ações</th>
                    </tr>
                </thead>
                <tbody>
                    {avaliacoes.map((a) => {
                        // On-the-fly calculation fallback
                        let mileRes = a.mileResult;
                        let pushRes = a.pushUpsResult;

                        if (userBirth) {
                            const age = calculateAge(userBirth);

                            if (a.mile && typeof a.mile === 'string' && a.mile.includes(':')) {
                                mileRes = classifyMileResult(a.mile, age, gender as any);
                            } else {
                                mileRes = classifyMileResult(undefined, age, gender as any);
                            }

                            if (!pushRes) {
                                pushRes = classifyPushUps(a.pushUps as any, age, gender as any);
                            }
                        }

                        return (
                            <tr key={a.id} className="border-b border-gray-300 hover:bg-gray-50 transition-colors">
                                <td className="py-3 px-2 whitespace-nowrap font-bold">{new Date(a.date).toLocaleDateString('pt-PT')}</td>

                                {/* Push Ups Count */}
                                <td className="py-3 px-2 text-center hidden md:table-cell">
                                    <span className={BADGE_STYLES.PURPLE}>
                                        {a.pushUps || '-'}
                                    </span>
                                </td>

                                {/* Push Ups Result */}
                                <td className="py-3 px-2 text-center hidden md:table-cell">
                                    {pushRes ? (
                                        <span className={getMileResultStyle(pushRes)}>
                                            {pushRes}
                                        </span>
                                    ) : (
                                        <span className="text-gray-400">-</span>
                                    )}
                                </td>

                                <td className="py-3 px-2 text-center hidden md:table-cell">
                                    <span className={BADGE_STYLES.PURPLE}>
                                        {a.sitUps || '-'}
                                    </span>
                                </td>

                                {/* Mile Time */}
                                <td className="py-3 px-2 text-center hidden md:table-cell">
                                    <span className={BADGE_STYLES.INDIGO}>
                                        {a.mile || '-'}
                                    </span>
                                </td>

                                {/* Mile Result */}
                                <td className="py-3 px-2 text-center">
                                    {mileRes ? (
                                        <span className={getMileResultStyle(mileRes)}>
                                            {mileRes}
                                        </span>
                                    ) : (
                                        <span className="text-gray-400">-</span>
                                    )}
                                </td>

                                <td className="py-3 px-2 text-center">
                                    {a.notes ? (
                                        <span className="inline-block px-2.5 py-1 bg-slate-50 border border-slate-200/60 rounded-lg text-gray-900 text-[10px] font-semibold leading-tight max-w-[280px] line-clamp-2 text-left" title={a.notes}>
                                            {a.notes}
                                        </span>
                                    ) : (
                                        <span className="text-gray-400">-</span>
                                    )}
                                </td>
                                <td className="py-3 px-2 text-right">
                                    <div className="flex justify-end gap-1">
                                        <button
                                            onClick={() => onEdit(a)}
                                            className="p-1.5 text-gray-400 hover:text-primary transition-colors cursor-pointer"
                                            title="Editar"
                                        >
                                            <i className="fa-duotone fa-pen-to-square"></i>
                                        </button>
                                        <button
                                            onClick={() => onDelete(a.id)}
                                            className="p-1.5 text-gray-400 hover:text-red-600 transition-colors cursor-pointer"
                                            title="Eliminar"
                                        >
                                            <i className="fa-duotone fa-trash"></i>
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
};
