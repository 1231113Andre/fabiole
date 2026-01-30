import React from "react";
import { Pesagem } from "../../types";
import { PesagemRow } from "./PesagemRow";

interface PesagensTableProps {
    pesagens: Pesagem[];
    gender: string;
    userAge?: number | null;
    onEdit: (p: Pesagem) => void;
    onDelete: (id: number) => void;
}

import { TooltipHeader } from "../../../../../../../components/ui/TooltipHeader";

export const PesagensTable: React.FC<PesagensTableProps> = ({
    pesagens,
    gender,
    userAge,
    onEdit,
    onDelete
}) => {
    if (pesagens.length === 0) {
        return (
            <div className="py-12 text-center text-gray-500">
                <i className="fa-duotone fa-weight-scale text-4xl mb-3 text-gray-300"></i>
                <p>Nenhuma pesagem registada</p>
            </div>
        );
    }

    return (
        <div className="w-full overflow-visible">
            <table className="w-full text-sm border-collapse table-fixed">
                <thead>
                    <tr className="bg-gray-50 border-b">
                        <th className="py-3 px-2 text-left font-semibold text-gray-700 w-[4.2rem]">Data</th>
                        <th className="py-3 px-2 text-center font-semibold text-gray-700 w-[4rem]">Peso</th>
                        <th className="py-3 px-2 text-center font-semibold text-violet-700 w-[3.5rem]">
                            <TooltipHeader label="Δ" description="Δ Peso. Diferença entre pesagens consecutivas." />
                        </th>
                        <th className="py-3 px-2 text-center font-semibold text-gray-700 w-[3.8rem]">Alt.</th>
                        <th className="py-3 px-2 text-center font-semibold text-gray-700 w-[2.8rem]">% MG</th>
                        <th className="py-3 px-2 text-center font-semibold text-violet-700 w-[3.2rem]">
                            <TooltipHeader label="MM" description="Peso × (1 - %MG). Massa magra (LBM)." isAuto={true} />
                        </th>
                        <th className="py-3 px-2 text-center font-semibold text-violet-700 w-[3.2rem]">
                            <TooltipHeader label="H2O" description="Fórmula Watson. % e kg." isAuto={true} />
                        </th>
                        <th className="py-3 px-2 text-center font-semibold text-violet-700 w-[2.8rem]">
                            <TooltipHeader label="IMC" description="Peso ÷ Altura²." isAuto={true} />
                        </th>
                        <th className="py-3 px-2 text-center font-semibold text-gray-700 w-[2.6rem]">G.Visc.</th>
                        <th className="py-3 px-2 text-center font-semibold text-gray-700 w-[2.6rem]">ID M.</th>
                        <th className="py-3 px-2 text-center font-semibold text-gray-700 w-[2.8rem]">M.Óssea</th>
                        <th className="py-3 px-2 text-center font-semibold text-violet-700 w-[5rem]">
                            <TooltipHeader label="Res. IMC" description="Classificação automática IMC." isAuto={true} />
                        </th>
                        <th className="py-3 px-2 text-center font-semibold text-violet-700 w-[5rem]">
                            <TooltipHeader label="Res. %MG" description="Classificação por género e % gordura." isAuto={true} />
                        </th>
                        <th className="py-3 px-2 text-center font-semibold text-violet-700 w-[3.5rem]">
                            <TooltipHeader label="SMI" description="MM ÷ Altura² (kg/m²)." isAuto={true} />
                        </th>
                        <th className="py-3 px-2 text-center font-semibold text-violet-700 w-[4.5rem]">
                            <TooltipHeader label="SMI Res." description="Classificação por género." isAuto={true} />
                        </th>
                        <th className="py-3 px-2 text-right font-semibold text-gray-700 w-[4rem]">Ações</th>
                    </tr>
                </thead>
                <tbody className="divide-none">
                    {pesagens.map((p, index) => (
                        <PesagemRow
                            key={p.id}
                            pesagem={p}
                            gender={gender}
                            userAge={userAge}
                            previousPesagem={pesagens[index + 1]}
                            onEdit={onEdit}
                            onDelete={onDelete}
                        />
                    ))}
                </tbody>
            </table>
        </div>
    );
};
