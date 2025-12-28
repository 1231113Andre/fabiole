import React from "react";
import { Pesagem } from "../../types";
import { PesagemRow } from "./PesagemRow";

interface PesagensTableProps {
    pesagens: Pesagem[];
    gender: string;
    onEdit: (p: Pesagem) => void;
    onDelete: (id: number) => void;
}

function TooltipHeader({ label, description, isAuto = true }: { label: string; description: string; isAuto?: boolean }) {
    return (
        <div className="flex items-center justify-center gap-1.5 relative group/tooltip">
            {isAuto && '🤖 '}{label}
            <i className="fa-duotone fa-circle-info text-violet-500/60 text-[10px] cursor-help hover:text-violet-600 transition-colors"></i>
            <div className="absolute left-1/2 top-full mt-2 -translate-x-1/2 w-max max-w-[200px] p-2.5 bg-gray-900/95 backdrop-blur-sm text-white text-[11px] rounded-xl shadow-2xl opacity-0 invisible group-hover/tooltip:opacity-100 group-hover/tooltip:visible transition-all duration-200 z-[60] pointer-events-none border border-white/10">
                <div className="absolute top-0 left-1/2 transform -translate-y-1/2 -translate-x-1/2 rotate-45 w-2 h-2 bg-gray-900/95 border-t border-l border-white/10"></div>
                <div className="relative whitespace-normal">
                    <div className="font-bold mb-1 flex items-center gap-1.5 text-violet-300 uppercase tracking-tighter text-[10px]">
                        <i className="fa-duotone fa-robot"></i>
                        {isAuto ? 'Auto-Cálculo' : 'Classificação'}
                    </div>
                    <p className="text-gray-300 leading-snug">{description}</p>
                </div>
            </div>
        </div>
    );
}

export const PesagensTable: React.FC<PesagensTableProps> = ({
    pesagens,
    gender,
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
        <div className="w-full overflow-visible pb-16">
            <table className="w-full text-xs border-collapse table-auto">
                <thead>
                    <tr className="bg-gray-50 border-b">
                        <th className="py-3 px-2 text-left font-semibold text-gray-700 whitespace-nowrap">Data</th>
                        <th className="py-3 px-2 text-center font-semibold text-gray-700 whitespace-nowrap">Peso (kg)</th>
                        <th className="py-3 px-2 text-center font-semibold text-violet-700 whitespace-nowrap">
                            <TooltipHeader label="PESO" description="Δ Peso. Diferença entre pesagens consecutivas." />
                        </th>
                        <th className="py-3 px-2 text-center font-semibold text-gray-700 whitespace-nowrap">Altura (cm)</th>
                        <th className="py-3 px-2 text-center font-semibold text-gray-700 whitespace-nowrap">% MG</th>
                        <th className="py-3 px-2 text-center font-semibold text-violet-700 whitespace-nowrap">
                            <TooltipHeader label="MM (kg)" description="Peso × (1 - %MG) - Massa Óssea. Automático ao inserir dados." />
                        </th>
                        <th className="py-3 px-2 text-center font-semibold text-violet-700 whitespace-nowrap">
                            <TooltipHeader label="H2O" description="Peso × Fator. Homem: 60%, Mulher: 55%. Automático ao inserir dados." />
                        </th>
                        <th className="py-3 px-2 text-center font-semibold text-violet-700 whitespace-nowrap">
                            <TooltipHeader label="IMC" description="Peso ÷ Altura². Automático ao inserir dados." />
                        </th>
                        <th className="py-3 px-2 text-center font-semibold text-gray-700 whitespace-nowrap">Gordura Visc.</th>
                        <th className="py-3 px-2 text-center font-semibold text-gray-700 whitespace-nowrap">ID Metab.</th>
                        <th className="py-3 px-2 text-center font-semibold text-gray-700 whitespace-nowrap">Massa Óssea</th>
                        <th className="py-3 px-2 text-center font-semibold text-violet-700 whitespace-nowrap">
                            <TooltipHeader label="Resultado IMC" description="Classificação automática baseada no IMC: Baixo Peso, Normal, Pré-obesidade ou Obesidade." isAuto={true} />
                        </th>
                        <th className="py-3 px-2 text-center font-semibold text-violet-700 whitespace-nowrap">
                            <TooltipHeader label="Resultado %MG" description="Classificação automática baseada no género e % de gordura." isAuto={true} />
                        </th>
                        <th className="py-3 px-2 text-right font-semibold text-gray-700 whitespace-nowrap">Ações</th>
                    </tr>
                </thead>
                <tbody>
                    {pesagens.map((p, index) => (
                        <PesagemRow
                            key={p.id}
                            pesagem={p}
                            gender={gender}
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
