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

    return (
        <div className="w-full overflow-visible pb-16">
            <table className="w-full text-xs border-collapse table-auto">
                <thead>
                    <tr className="bg-gray-50 border-b">
                        <th className="py-3 px-2 text-left font-semibold text-gray-700 whitespace-nowrap">Data</th>
                        <th className="py-3 px-2 text-center font-semibold text-gray-700 whitespace-nowrap">
                            <TooltipHeader
                                label={<span className="flex items-center gap-1.5"><i className="fa-duotone fa-dumbbell"></i> MS Dir.</span>}
                                description="Medida da circunferência do braço direito."
                                isAuto={false}
                            />
                        </th>
                        <th className="py-3 px-2 text-center font-semibold text-gray-700 whitespace-nowrap">
                            <TooltipHeader
                                label={<span className="flex items-center gap-1.5"><i className="fa-duotone fa-dumbbell"></i> MS Esq.</span>}
                                description="Medida da circunferência do braço esquerdo."
                                isAuto={false}
                            />
                        </th>
                        <th className="py-3 px-2 text-center font-semibold text-gray-700 whitespace-nowrap">
                            <TooltipHeader
                                label={<span className="flex items-center gap-1.5"><i className="fa-duotone fa-heart-pulse"></i> Peito</span>}
                                description="Medida da circunferência do tórax."
                                isAuto={false}
                            />
                        </th>
                        <th className="py-3 px-2 text-center font-semibold text-gray-700 whitespace-nowrap">
                            <TooltipHeader
                                label={<span className="flex items-center gap-1.5"><i className="fa-duotone fa-ruler-horizontal"></i> Cintura</span>}
                                description="Medida da circunferência da cintura."
                                isAuto={false}
                            />
                        </th>
                        <th className="py-3 px-2 text-center font-semibold text-gray-700 whitespace-nowrap">
                            <TooltipHeader
                                label={<span className="flex items-center gap-1.5"><i className="fa-duotone fa-circle-dot"></i> Abdómen</span>}
                                description="Medida da circunferência abdominal."
                                isAuto={false}
                            />
                        </th>
                        <th className="py-3 px-2 text-center font-semibold text-gray-700 whitespace-nowrap">
                            <TooltipHeader
                                label={<span className="flex items-center gap-1.5"><i className="fa-duotone fa-person-dress"></i> Anca</span>}
                                description="Medida da circunferência da anca."
                                isAuto={false}
                            />
                        </th>
                        <th className="py-3 px-2 text-center font-semibold text-gray-700 whitespace-nowrap">
                            <TooltipHeader
                                label={<span className="flex items-center gap-1.5"><i className="fa-duotone fa-person-running"></i> Coxa Dir.</span>}
                                description="Medida da circunferência da coxa direita."
                                isAuto={false}
                            />
                        </th>
                        <th className="py-3 px-2 text-center font-semibold text-gray-700 whitespace-nowrap">
                            <TooltipHeader
                                label={<span className="flex items-center gap-1.5"><i className="fa-duotone fa-person-running"></i> Coxa Esq.</span>}
                                description="Medida da circunferência da coxa esquerda."
                                isAuto={false}
                            />
                        </th>
                        <th className="py-3 px-2 text-right font-semibold text-gray-700 whitespace-nowrap">Ações</th>
                    </tr>
                </thead>
                <tbody>
                    {perimetros.map((p) => (
                        <tr key={p.id} className="border-b border-gray-300 hover:bg-gray-50 transition-colors">
                            <td className="py-3 px-2 whitespace-nowrap font-bold">{new Date(p.date).toLocaleDateString('pt-PT')}</td>
                            <td className="py-3 px-2 text-center">
                                <span className={BADGE_STYLES.BLUE}>
                                    {p.msRight || '-'}
                                </span>
                            </td>
                            <td className="py-3 px-2 text-center">
                                <span className={BADGE_STYLES.BLUE}>
                                    {p.msLeft || '-'}
                                </span>
                            </td>
                            <td className="py-3 px-2 text-center">
                                <span className={BADGE_STYLES.BLUE}>
                                    {p.chest || '-'}
                                </span>
                            </td>
                            <td className="py-3 px-2 text-center">
                                <span className={BADGE_STYLES.BLUE}>
                                    {p.waist || '-'}
                                </span>
                            </td>
                            <td className="py-3 px-2 text-center">
                                <span className={BADGE_STYLES.BLUE}>
                                    {p.abdomen || '-'}
                                </span>
                            </td>
                            <td className="py-3 px-2 text-center">
                                <span className={BADGE_STYLES.BLUE}>
                                    {p.hips || '-'}
                                </span>
                            </td>
                            <td className="py-3 px-2 text-center">
                                <span className={BADGE_STYLES.BLUE}>
                                    {p.thighR || '-'}
                                </span>
                            </td>
                            <td className="py-3 px-2 text-center">
                                <span className={BADGE_STYLES.BLUE}>
                                    {p.thighL || '-'}
                                </span>
                            </td>
                            <td className="py-3 px-2 text-right">
                                <div className="flex justify-end gap-1">
                                    <button
                                        onClick={() => onEdit(p)}
                                        className="p-1.5 text-gray-400 hover:text-primary transition-colors cursor-pointer"
                                        title="Editar"
                                    >
                                        <i className="fa-duotone fa-pen-to-square"></i>
                                    </button>
                                    <button
                                        onClick={() => onDelete(p.id)}
                                        className="p-1.5 text-gray-400 hover:text-red-600 transition-colors cursor-pointer"
                                        title="Eliminar"
                                    >
                                        <i className="fa-duotone fa-trash"></i>
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
