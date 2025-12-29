import React from "react";
import { Pesagem } from "../../types";
import { calculatePesagemMetrics, getBmiClassColor, getFatClassColor, getDeltaPesoColor } from "./pesagemMetrics";

interface PesagemRowProps {
    pesagem: Pesagem;
    gender: string;
    previousPesagem?: Pesagem;
    onEdit: (p: Pesagem) => void;
    onDelete: (id: number) => void;
}

// Helper to check if a value is valid (not a spreadsheet error like #REF!)
const isValidValue = (val: any): boolean => {
    if (val === null || val === undefined) return false;
    if (typeof val === 'string' && (val.startsWith('#') || val === '')) return false;
    return true;
};

export const PesagemRow: React.FC<PesagemRowProps> = ({
    pesagem: p,
    gender,
    previousPesagem,
    onEdit,
    onDelete
}) => {
    const metrics = calculatePesagemMetrics(p, gender, previousPesagem);

    return (
        <tr className="border-b border-gray-300 hover:bg-gray-50 transition-colors">
            <td className="py-3 px-2 whitespace-nowrap">{new Date(p.date).toLocaleDateString('pt-PT')}</td>
            <td className="py-3 px-2 text-center font-bold text-gray-900">{p.peso || '-'}</td>
            <td className={`py-3 px-2 text-center font-semibold ${getDeltaPesoColor(metrics.deltaPeso)}`}>
                {metrics.deltaPeso}
            </td>
            <td className="py-3 px-2 text-center text-gray-600">{p.height || '-'}</td>
            <td className="py-3 px-2 text-center font-semibold text-gray-900">{p.percentualMG ? `${p.percentualMG}%` : '-'}</td>
            <td className="py-3 px-2 text-center">
                <span className="bg-violet-100 text-violet-700 px-2 py-0.5 rounded text-[10px] font-bold">
                    {p.mm ?? metrics.mm ?? '-'}
                </span>
            </td>
            <td className="py-3 px-2 text-center">
                <span className="bg-violet-100 text-violet-700 px-2 py-0.5 rounded text-[10px] font-bold">
                    {p.h2o ?? metrics.h2o ?? '-'}
                </span>
            </td>
            <td className="py-3 px-2 text-center">
                <span className="bg-violet-100 text-violet-700 px-2 py-0.5 rounded text-[10px] font-bold">
                    {p.imc ?? metrics.bmi ?? '-'}
                </span>
            </td>
            <td className="py-3 px-2 text-center text-gray-600">{p.gordVisceral || '-'}</td>
            <td className="py-3 px-2 text-center text-gray-600">{p.idMetabolica || '-'}</td>
            <td className="py-3 px-2 text-center text-gray-600">{p.massaOssea || '-'}</td>
            <td className="py-3 px-2 text-center">
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${getBmiClassColor(metrics.bmiClass)}`}>
                    {isValidValue(p.resultadoIMC) ? p.resultadoIMC : (metrics.bmiClass || '-')}
                </span>
            </td>
            <td className="py-3 px-2 text-center">
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${getFatClassColor(metrics.fatClass)}`}>
                    {isValidValue(p.resultadoPercentMG) ? p.resultadoPercentMG : (metrics.fatClass || '-')}
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
    );
};
