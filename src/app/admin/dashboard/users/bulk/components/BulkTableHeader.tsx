import React, { memo } from "react";
import { TooltipHeader } from "@/components/ui/TooltipHeader";
import { BulkType } from "./types";

interface BulkTableHeaderProps {
    type: BulkType;
}

const thCompact = "py-1.5 px-0.5 text-center font-semibold text-[10px] whitespace-nowrap min-w-[2.25rem]";
const PesagensHeaders = memo(function PesagensHeaders() {
    return (
        <>
            <th className={`${thCompact} text-violet-700`}>
                <TooltipHeader label="MS Dir." description="Massa muscular membros superiores direito (kg)." isAuto={false} />
            </th>
            <th className={`${thCompact} text-violet-700`}>
                <TooltipHeader label="MS Esq." description="Massa muscular membros superiores esquerdo (kg)." isAuto={false} />
            </th>
            <th className={`${thCompact} text-violet-700`}>
                <TooltipHeader label="MI Dir." description="Massa muscular membros inferiores direito (kg)." isAuto={false} />
            </th>
            <th className={`${thCompact} text-violet-700`}>
                <TooltipHeader label="MI Esq." description="Massa muscular membros inferiores esquerdo (kg)." isAuto={false} />
            </th>
            <th className={thCompact + " text-gray-700"}>Peso</th>
            <th className={thCompact + " text-violet-700"}>
                <TooltipHeader label="Δ PESO" description="Δ Peso. Diferença entre pesagens consecutivas." />
            </th>
            <th className={thCompact + " text-gray-700"}>Altura</th>
            <th className={thCompact + " text-gray-700"}>% MG</th>
            <th className={thCompact + " text-violet-700"}>
                <TooltipHeader label="MM" description="Peso × (1 - %MG). Massa magra (LBM)." isAuto={true} />
            </th>
            <th className={thCompact + " text-violet-700"}>
                <TooltipHeader label="% H2O" description="Fórmula Watson: água corporal a partir de peso, altura, género e idade (homens). % e kg." isAuto={true} />
            </th>
            <th className={thCompact + " text-violet-700"}>
                <TooltipHeader label="IMC" description="Peso ÷ Altura² (kg/m²)." isAuto={true} />
            </th>
            <th className={thCompact + " text-gray-700"}>G. Visc.</th>
            <th className={thCompact + " text-gray-700"}>ID Met.</th>
            <th className={thCompact + " text-gray-700"}>M. Óssea</th>
            <th className={thCompact + " text-violet-700"}>
                <TooltipHeader label="Res. IMC" description="Classificação automática: baixo peso, normal, pré-obesidade, obesidade (graus I–III)." isAuto={true} />
            </th>
            <th className={thCompact + " text-violet-700"}>
                <TooltipHeader label="Res. %MG" description="Classificação por género, idade e % gordura (escalas por faixa etária)." isAuto={true} />
            </th>
        </>
    );
});

const PerimetrosHeaders = memo(function PerimetrosHeaders() {
    const headers = ['MS Dir.', 'MS Esq.', 'Peito', 'Cintura', 'Abdómen', 'Anca', 'Coxa Dir.', 'Coxa Esq.'];
    return (
        <>
            {headers.map(h => (
                <th key={h} className="py-1.5 px-0.5 text-center font-semibold text-[10px] text-gray-700 whitespace-nowrap min-w-[2.25rem]">{h}</th>
            ))}
        </>
    );
});

const AvaliacoesHeaders = memo(function AvaliacoesHeaders() {
    const headers = ['Flexões', 'Abdominais', 'Milha', 'Resultado', 'Notas'];
    return (
        <>
            {headers.map(h => (
                <th key={h} className="py-1.5 px-0.5 text-center font-semibold text-[10px] text-gray-700 whitespace-nowrap min-w-[2.25rem]">{h}</th>
            ))}
        </>
    );
});

export const BulkTableHeader = memo(function BulkTableHeader({ type }: BulkTableHeaderProps) {
    return (
        <thead className="sticky top-0 z-20 bg-gray-50 shadow-sm">
            <tr className="bg-gray-50 border-b">
                <th className="sticky left-0 z-20 bg-gray-50 py-1.5 px-1.5 text-left font-semibold text-[10px] text-gray-700 whitespace-nowrap shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">Data</th>
                {type === 'pesagens' && <PesagensHeaders />}
                {type === 'perimetros' && <PerimetrosHeaders />}
                {type === 'avaliacoes' && <AvaliacoesHeaders />}
                <th className="py-1.5 px-1 text-right font-semibold text-[10px] text-gray-700 whitespace-nowrap">Ações</th>
            </tr>
        </thead>
    );
});
