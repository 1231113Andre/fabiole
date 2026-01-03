import React, { memo } from "react";
import { TooltipHeader } from "./TooltipHeader";
import { BulkType } from "./types";

interface BulkTableHeaderProps {
    type: BulkType;
}

const PesagensHeaders = memo(function PesagensHeaders() {
    return (
        <>
            <th className="py-3 px-1 text-center font-semibold text-gray-700 whitespace-nowrap">Peso (kg)</th>
            <th className="py-3 px-1 text-center font-semibold text-violet-700 whitespace-nowrap">
                <TooltipHeader label="Δ PESO" description="Δ Peso. Diferença entre pesagens consecutivas." />
            </th>
            <th className="py-3 px-1 text-center font-semibold text-gray-700 whitespace-nowrap">Altura (cm)</th>
            <th className="py-3 px-1 text-center font-semibold text-gray-700 whitespace-nowrap">% MG</th>
            <th className="py-3 px-1 text-center font-semibold text-violet-700 whitespace-nowrap">
                <TooltipHeader label="MM (kg)" description="Peso × (1 - %MG). Massa magra (LBM). Automático ao inserir dados." />
            </th>
            <th className="py-3 px-1 text-center font-semibold text-violet-700 whitespace-nowrap">
                <TooltipHeader label="% H2O" description="Fórmula Watson: calcula água corporal baseado em peso, altura, idade e género. Valor em kg no tooltip." />
            </th>
            <th className="py-3 px-1 text-center font-semibold text-violet-700 whitespace-nowrap">
                <TooltipHeader label="IMC" description="Peso ÷ Altura². Automático ao inserir dados." />
            </th>
            <th className="py-3 px-1 text-center font-semibold text-gray-700 whitespace-nowrap">Gordura Visc.</th>
            <th className="py-3 px-1 text-center font-semibold text-gray-700 whitespace-nowrap">ID Metab.</th>
            <th className="py-3 px-1 text-center font-semibold text-gray-700 whitespace-nowrap">Massa Óssea</th>
            <th className="py-3 px-1 text-center font-semibold text-violet-700 whitespace-nowrap">
                <TooltipHeader label="Resultado IMC" description="Classificação automática baseada no IMC: Baixo Peso, Normal, Pré-obesidade ou Obesidade." />
            </th>
            <th className="py-3 px-1 text-center font-semibold text-violet-700 whitespace-nowrap">
                <TooltipHeader label="Resultado %MG" description="Classificação automática baseada no género e % de gordura." />
            </th>
        </>
    );
});

const PerimetrosHeaders = memo(function PerimetrosHeaders() {
    const headers = ['MS Dir.', 'MS Esq.', 'Peito', 'Cintura', 'Abdómen', 'Anca', 'Coxa Dir.', 'Coxa Esq.'];
    return (
        <>
            {headers.map(h => (
                <th key={h} className="py-3 px-1 text-center font-semibold text-gray-700 whitespace-nowrap">{h}</th>
            ))}
        </>
    );
});

const AvaliacoesHeaders = memo(function AvaliacoesHeaders() {
    const headers = ['Flexões', 'Abdominais', 'Milha', 'Resultado', 'Notas'];
    return (
        <>
            {headers.map(h => (
                <th key={h} className="py-3 px-1 text-center font-semibold text-gray-700 whitespace-nowrap">{h}</th>
            ))}
        </>
    );
});

export const BulkTableHeader = memo(function BulkTableHeader({ type }: BulkTableHeaderProps) {
    return (
        <thead className="sticky top-0 z-20 bg-gray-50 shadow-sm">
            <tr className="bg-gray-50 border-b">
                <th className="sticky left-0 z-20 bg-gray-50 py-3 px-2 text-left font-semibold text-gray-700 whitespace-nowrap shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">Data</th>
                {type === 'pesagens' && <PesagensHeaders />}
                {type === 'perimetros' && <PerimetrosHeaders />}
                {type === 'avaliacoes' && <AvaliacoesHeaders />}
                <th className="py-3 px-2 text-right font-semibold text-gray-700 whitespace-nowrap">Ações</th>
            </tr>
        </thead>
    );
});
