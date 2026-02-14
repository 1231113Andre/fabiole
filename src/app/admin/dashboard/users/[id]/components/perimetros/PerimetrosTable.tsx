import React from "react";
import { Perimetro } from "../../types";
import { BADGE_STYLES } from "@/lib/body-metrics";
import { TooltipHeader } from "@/components/ui/TooltipHeader";

interface PerimetrosTableProps {
    perimetros: Perimetro[];
    onEdit: (p: Perimetro) => void;
    onDelete: (id: number) => void;
}

export const PerimetrosTable: React.FC<PerimetrosTableProps> = ({
    perimetros,
    onEdit,
    onDelete
}) => {
    if (perimetros.length === 0) {
        return (
            <div className="py-12 text-center text-gray-500">
                <i className="fa-duotone fa-ruler-combined text-4xl mb-3 text-gray-300"></i>
                <p>Nenhum perímetro registado</p>
            </div>
        );
    }

    const thMeasure = "py-3 px-2.5 text-center font-semibold text-gray-700 whitespace-nowrap min-w-[3.5rem] sm:min-w-[4rem]";
    const tdMeasure = "py-3 px-2.5 text-center align-middle";

    return (
        <div
            className="w-full min-w-0 -mx-2 sm:mx-0 px-2 sm:px-0 overflow-x-auto overflow-y-hidden premium-scrollbar touch-pan-x rounded-xl border border-gray-200 bg-gray-50/50"
            style={{ WebkitOverflowScrolling: "touch" }}
            role="region"
            aria-label="Tabela de perímetros – deslize para a esquerda ou direita para ver todas as colunas"
        >
            <table className="w-full text-xs sm:text-sm border-collapse min-w-max">
                <thead>
                    <tr className="bg-gray-100 border-b border-gray-200">
                        <th className="py-3 px-2.5 text-left font-semibold text-gray-700 whitespace-nowrap min-w-[5rem] sm:min-w-[5.5rem]">
                            Data
                        </th>
                        <th className={thMeasure}>
                            <TooltipHeader
                                label={<span className="flex items-center justify-center gap-1"><i className="fa-duotone fa-dumbbell text-[10px] sm:text-xs" /> MS Dir.</span>}
                                description="Medida da circunferência do braço direito."
                                isAuto={false}
                            />
                        </th>
                        <th className={thMeasure}>
                            <TooltipHeader
                                label={<span className="flex items-center justify-center gap-1"><i className="fa-duotone fa-dumbbell text-[10px] sm:text-xs" /> MS Esq.</span>}
                                description="Medida da circunferência do braço esquerdo."
                                isAuto={false}
                            />
                        </th>
                        <th className={thMeasure}>
                            <TooltipHeader
                                label={<span className="flex items-center justify-center gap-1"><i className="fa-duotone fa-heart-pulse text-[10px] sm:text-xs" /> Peito</span>}
                                description="Medida da circunferência do tórax."
                                isAuto={false}
                            />
                        </th>
                        <th className={thMeasure}>
                            <TooltipHeader
                                label={<span className="flex items-center justify-center gap-1"><i className="fa-duotone fa-ruler-horizontal text-[10px] sm:text-xs" /> Cintura</span>}
                                description="Medida da circunferência da cintura."
                                isAuto={false}
                            />
                        </th>
                        <th className={thMeasure}>
                            <TooltipHeader
                                label={<span className="flex items-center justify-center gap-1"><i className="fa-duotone fa-circle-dot text-[10px] sm:text-xs" /> Abdómen</span>}
                                description="Medida da circunferência abdominal."
                                isAuto={false}
                            />
                        </th>
                        <th className={thMeasure}>
                            <TooltipHeader
                                label={<span className="flex items-center justify-center gap-1"><i className="fa-duotone fa-person-dress text-[10px] sm:text-xs" /> Anca</span>}
                                description="Medida da circunferência da anca."
                                isAuto={false}
                            />
                        </th>
                        <th className={thMeasure}>
                            <TooltipHeader
                                label={<span className="flex items-center justify-center gap-1"><i className="fa-duotone fa-person-running text-[10px] sm:text-xs" /> Coxa Dir.</span>}
                                description="Medida da circunferência da coxa direita."
                                isAuto={false}
                            />
                        </th>
                        <th className={thMeasure}>
                            <TooltipHeader
                                label={<span className="flex items-center justify-center gap-1"><i className="fa-duotone fa-person-running text-[10px] sm:text-xs" /> Coxa Esq.</span>}
                                description="Medida da circunferência da coxa esquerda."
                                isAuto={false}
                            />
                        </th>
                        <th className="py-3 px-2.5 text-right font-semibold text-gray-700 whitespace-nowrap min-w-[5rem] sm:min-w-[5.5rem]">
                            Ações
                        </th>
                    </tr>
                </thead>
                <tbody>
                    {perimetros.map((p) => (
                        <tr key={p.id} className="border-b border-gray-200 hover:bg-gray-100/80 transition-colors bg-white">
                            <td className="py-3 px-2.5 whitespace-nowrap font-semibold text-gray-800">
                                {new Date(p.date).toLocaleDateString("pt-PT")}
                            </td>
                            <td className={tdMeasure}>
                                <span className={BADGE_STYLES.BLUE}>{p.msRight ?? "-"}</span>
                            </td>
                            <td className={tdMeasure}>
                                <span className={BADGE_STYLES.BLUE}>{p.msLeft ?? "-"}</span>
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
                            <td className="py-3 px-2.5 text-right align-middle">
                                <div className="flex justify-end gap-0.5 sm:gap-1">
                                    <button
                                        type="button"
                                        onClick={() => onEdit(p)}
                                        className="p-1.5 sm:p-2 text-gray-400 hover:text-primary transition-colors cursor-pointer rounded-lg hover:bg-primary/5"
                                        title="Editar"
                                        aria-label="Editar"
                                    >
                                        <i className="fa-duotone fa-pen-to-square text-sm" />
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => onDelete(p.id)}
                                        className="p-1.5 sm:p-2 text-gray-400 hover:text-red-600 transition-colors cursor-pointer rounded-lg hover:bg-red-50"
                                        title="Eliminar"
                                        aria-label="Eliminar"
                                    >
                                        <i className="fa-duotone fa-trash text-sm" />
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};
