import React, { useMemo } from "react";
import { Avaliacao, Pesagem } from "../../types";
import { BADGE_STYLES, classifyMileResult, classifyPushUps, calculateAge, calculateVO2MaxRockport } from "@/lib/body-metrics";
import { TooltipHeader } from "@/components/ui/TooltipHeader";

const getMileResultStyle = (result: string | null): string => {
    if (!result) return BADGE_STYLES.GRAY;
    const r = result.toLowerCase();
    if (r.includes('excelente') || r.includes('bom') || r.includes('apto') || r.includes('fit')) return BADGE_STYLES.GREEN;
    if (r.includes('médio') || r.includes('medio') || r.includes('regular') || r.includes('atenção') || r.includes('autónomo')) return BADGE_STYLES.YELLOW;
    if (r.includes('fraco') || r.includes('not fit') || r.includes('mau') || r.includes('risco') || r.includes('vulnerável')) return BADGE_STYLES.RED;
    return BADGE_STYLES.BLUE;
}

// Helper to extract HR from mile string "120bpm | 10'00"" or "120 | 10:00"
const extractHeartRate = (mileStr: string | null): number | null => {
    if (!mileStr) return null;

    // Safety: Only assume HR if pipe indicates "HR | Time"
    if (mileStr.includes('|')) {
        const part = mileStr.split('|')[0].trim();
        const val = parseInt(part.replace(/[^\d]/g, ''));
        return isNaN(val) ? null : val;
    }

    // Or if explicit unit is present
    if (mileStr.toLowerCase().includes('bpm')) {
        const match = mileStr.match(/(\d+)\s*bpm/i);
        return match ? parseInt(match[1]) : null;
    }

    return null;
};

// Helper to extract Time from mile string "120bpm | 10'00"" or "10:00"
const extractTime = (mileStr: string | null): string | null => {
    if (!mileStr) return null;
    if (mileStr.includes('|')) {
        const parts = mileStr.split('|');
        if (parts.length > 1) {
            let t = parts[1].trim();
            // Normalize 10'00" to 10:00
            t = t.replace(/'/g, ':').replace(/"/g, '');
            return t;
        }
    }
    // Assume it is just time if no pipe, normalize 10'00" -> 10:00
    return mileStr.trim().replace(/'/g, ':').replace(/"/g, '');
};

// Helper to find closest weight
const getWeightForDate = (dateStr: string, pesagens: Pesagem[]): number | null => {
    if (!pesagens || pesagens.length === 0) return null;

    const targetTime = new Date(dateStr).getTime();

    // Sort pesagens by date descending
    const sorted = [...pesagens].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    // Find first pesagem that is on or before target date
    const closest = sorted.find(p => new Date(p.date).getTime() <= targetTime);

    if (closest && closest.peso) return closest.peso;

    // If no earlier weight, try the earliest available (last in sorted)
    const earliest = sorted[sorted.length - 1];
    if (earliest && earliest.peso) return earliest.peso;

    return null;
};

interface AvaliacoesTableProps {
    avaliacoes: Avaliacao[];
    pesagens?: Pesagem[];
    onEdit: (a: Avaliacao) => void;
    onDelete: (id: number) => void;
    gender?: string | null;
    userBirth?: string | null;
}

export const AvaliacoesTable: React.FC<AvaliacoesTableProps> = ({
    avaliacoes,
    pesagens = [],
    onEdit,
    onDelete,
    gender,
    userBirth
}) => {
    // Smart Column Visibility Analysis
    const columns = useMemo(() => {
        return {
            hasPushUps: avaliacoes.some(a => (a.pushUps !== null && a.pushUps > 0) || (a.pushUpsResult && a.pushUpsResult !== '-')),
            hasSitUps: avaliacoes.some(a => a.sitUps !== null && a.sitUps > 0),
            hasMile: avaliacoes.some(a => a.mile && a.mile !== '-'),
            hasNotes: avaliacoes.some(a => a.notes && a.notes !== '-'),
        };
    }, [avaliacoes]);

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

                        {columns.hasPushUps && (
                            <>
                                <th className="py-3 px-2 text-center font-semibold text-gray-700 whitespace-nowrap hidden md:table-cell">
                                    <TooltipHeader
                                        label={<span className="flex items-center gap-1.5"><i className="fa-duotone fa-dumbbell"></i> Flexões</span>}
                                        description="Número de flexões realizadas."
                                        isAuto={false}
                                    />
                                </th>
                                <th className="py-3 px-2 text-center font-semibold text-gray-700 whitespace-nowrap hidden md:table-cell">
                                    <TooltipHeader
                                        label="Class. Flexões"
                                        description={`Classificação baseada em:\nGénero: ${gender === 'M' ? 'Masculino' : 'Feminino'}\nIdade: ${calculateAge(userBirth) ?? 'N/A'} anos`}
                                        isAuto={true}
                                    />
                                </th>
                            </>
                        )}

                        {columns.hasSitUps && (
                            <th className="py-3 px-2 text-center font-semibold text-gray-700 whitespace-nowrap hidden md:table-cell">
                                <TooltipHeader
                                    label={<span className="flex items-center gap-1.5"><i className="fa-duotone fa-dumbbell"></i> Abdominais</span>}
                                    description="Número de abdominais realizados."
                                    isAuto={false}
                                />
                            </th>
                        )}

                        {columns.hasMile && (
                            <>
                                <th className="py-3 px-2 text-center font-semibold text-gray-700 whitespace-nowrap hidden md:table-cell">
                                    <TooltipHeader
                                        label={<span className="flex items-center gap-1.5"><i className="fa-duotone fa-person-running"></i> Milha</span>}
                                        description="Tempo na milha (batimentos e tempo)."
                                        isAuto={false}
                                    />
                                </th>
                                <th className="py-3 px-2 text-center font-semibold text-gray-700 whitespace-nowrap">
                                    <TooltipHeader
                                        label="Resultado Milha"
                                        description={`Resultado calculado automaticamente (VO2max Rockport) baseado em:\nGénero, Idade, Peso, Tempo e Frequência Cardíaca.`}
                                        isAuto={true}
                                    />
                                </th>
                            </>
                        )}

                        {columns.hasNotes && (
                            <th className="py-3 px-2 text-center font-semibold text-gray-700 whitespace-nowrap hidden lg:table-cell">
                                <TooltipHeader
                                    label={<span className="flex items-center gap-1.5"><i className="fa-duotone fa-note-sticky"></i> Notas</span>}
                                    description="Observações adicionais."
                                    isAuto={false}
                                />
                            </th>
                        )}

                        <th className="py-3 px-2 text-right font-semibold text-gray-700 whitespace-nowrap">Ações</th>
                    </tr>
                </thead>
                <tbody>
                    {avaliacoes.map((a) => {
                        // --- Logic Calculation Start ---
                        let pushRes = a.pushUpsResult;

                        let displayVO2: string | null = null;
                        let displayClass: string | null = null;

                        if (userBirth) {
                            const age = calculateAge(userBirth);

                            // 1. Auto-classify Push-ups if needed
                            if (!pushRes) {
                                pushRes = classifyPushUps(a.pushUps as any, age, gender as any);
                            }

                            // 2. Mile Logic only if mile exists
                            if (a.mile) {
                                const mileTime = extractTime(a.mile);
                                const heartRate = extractHeartRate(a.mile);
                                const weight = getWeightForDate(a.date, pesagens);

                                // Calculate pure classification explicitly from data
                                const calculatedClass = classifyMileResult(mileTime, age, gender as any);

                                // Calculate VO2 Max
                                if (mileTime && heartRate && weight && age) {
                                    const vo2 = calculateVO2MaxRockport(mileTime, heartRate, weight, age, gender as any);
                                    if (vo2) {
                                        displayVO2 = `${vo2} ml/kg/min`;
                                    }
                                }

                                // Determine what classification to show
                                // Priority: Calculated Class > Database Manual Result (if not auto-calculated looking)
                                displayClass = calculatedClass || a.mileResult;
                            }
                        }

                        // Combine VO2 and Classification
                        // Avoid duplicates if database result already contains messy string
                        // We construct fresh string: "VO2 | CLASS"

                        const finalMileDisplay = displayVO2
                            ? `${displayVO2} | ${displayClass?.replace(/.*\|\s*/, '') || 'N/A'}` // Strip previous VO2 part from db result if any (regex removes anything before |)
                            : (displayClass || '-');

                        // Extract just the class part (e.g., "BOM") for coloring
                        const classPartForColor = finalMileDisplay.includes('|')
                            ? finalMileDisplay.split('|').pop()?.trim()
                            : finalMileDisplay;

                        const mileBadgeColor = getMileResultStyle(classPartForColor || '');
                        // --- Logic Calculation End ---

                        return (
                            <tr key={a.id} className="border-b border-gray-300 hover:bg-gray-50 transition-colors">
                                <td className="py-3 px-2 whitespace-nowrap font-bold">{new Date(a.date).toLocaleDateString('pt-PT')}</td>

                                {columns.hasPushUps && (
                                    <>
                                        <td className="py-3 px-2 text-center hidden md:table-cell">
                                            <span className={BADGE_STYLES.PURPLE}>
                                                {a.pushUps || '-'}
                                            </span>
                                        </td>
                                        <td className="py-3 px-2 text-center hidden md:table-cell">
                                            {pushRes ? (
                                                <span className={getMileResultStyle(pushRes)}>
                                                    {pushRes}
                                                </span>
                                            ) : (
                                                <span className="text-gray-400">-</span>
                                            )}
                                        </td>
                                    </>
                                )}

                                {columns.hasSitUps && (
                                    <td className="py-3 px-2 text-center hidden md:table-cell">
                                        <span className={BADGE_STYLES.PURPLE}>
                                            {a.sitUps || '-'}
                                        </span>
                                    </td>
                                )}

                                {columns.hasMile && (
                                    <>
                                        <td className="py-3 px-2 text-center hidden md:table-cell">
                                            <span className={BADGE_STYLES.INDIGO}>
                                                {a.mile || '-'}
                                            </span>
                                        </td>
                                        <td className="py-3 px-2 text-center">
                                            {finalMileDisplay !== '-' ? (
                                                <span className={mileBadgeColor}>
                                                    {finalMileDisplay}
                                                </span>
                                            ) : (
                                                <span className="text-gray-400">-</span>
                                            )}
                                        </td>
                                    </>
                                )}

                                {columns.hasNotes && (
                                    <td className="py-3 px-2 text-center hidden lg:table-cell">
                                        {a.notes ? (
                                            <span className="inline-block px-2.5 py-1 bg-slate-50 border border-slate-200/60 rounded-lg text-gray-900 text-[10px] font-semibold leading-tight max-w-[280px] line-clamp-2 text-left" title={a.notes}>
                                                {a.notes}
                                            </span>
                                        ) : (
                                            <span className="text-gray-400">-</span>
                                        )}
                                    </td>
                                )}

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
