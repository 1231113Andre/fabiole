import React from "react";
import { Pesagem } from "../../types";
import { calculatePesagemMetrics, getBmiClassColor, getFatClassColor, getDeltaPesoColor, getBmiIcon, getFatIcon, BADGE_STYLES } from "./pesagemMetrics";

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
        <tr className="group hover:bg-gray-50/50 transition-colors duration-200 border-t border-solid border-gray-300 first:border-none">
            <td className="py-4 px-3 whitespace-nowrap font-medium text-gray-700">{new Date(p.date).toLocaleDateString('pt-PT')}</td>
            <td className="py-4 px-3 text-center font-bold text-gray-900">{p.peso || '-'}</td>
            <td className={`py-4 px-3 text-center font-semibold ${getDeltaPesoColor(metrics.deltaPeso)}`}>
                {metrics.deltaPeso}
            </td>
            <td className="py-4 px-3 text-center font-bold text-gray-700">
                {p.height ? (
                    <div className="flex items-center justify-center">
                        <span>{p.height}</span>
                        <div className="flex flex-col items-start ml-0.5 leading-none gap-0.5">
                            <span className="text-[10px] text-black font-bold">cm</span>
                            <span className="text-[9px] text-gray-900 font-normal whitespace-nowrap">(m'{String(p.height % 100).padStart(2, '0')})</span>
                        </div>
                    </div>
                ) : '-'}
            </td>
            <td className="py-4 px-3 text-center font-semibold text-gray-700">{p.percentualMG ? `${p.percentualMG}%` : '-'}</td>
            <td className="py-4 px-3 text-center">
                <span className={BADGE_STYLES.PURPLE}>
                    {p.mm ?? metrics.mm ?? '-'}
                </span>
            </td>
            <td className="py-4 px-3 text-center">
                <span className={BADGE_STYLES.BLUE}>
                    {p.h2o ?? metrics.h2o ?? '-'}
                </span>
            </td>
            <td className="py-4 px-3 text-center">
                <span className={BADGE_STYLES.GREEN}>
                    {p.imc ?? metrics.bmi ?? '-'}
                </span>
            </td>
            <td className="py-4 px-3 text-center font-semibold text-gray-900">{p.gordVisceral || '-'}</td>
            <td className="py-4 px-3 text-center font-semibold text-gray-900">{p.idMetabolica || '-'}</td>
            <td className="py-4 px-3 text-center font-semibold text-gray-900">{p.massaOssea || '-'}</td>
            <td className="py-4 px-3 text-center">
                <span className={`${getBmiClassColor(isValidValue(p.resultadoIMC) ? p.resultadoIMC! : metrics.bmiClass)} gap-2`}>
                    <i className={`fa-duotone ${getBmiIcon(isValidValue(p.resultadoIMC) ? p.resultadoIMC! : metrics.bmiClass)}`}></i>
                    {isValidValue(p.resultadoIMC) ? p.resultadoIMC : (metrics.bmiClass || '-')}
                </span>
            </td>
            <td className="py-4 px-3 text-center">
                <span className={`${getFatClassColor(isValidValue(p.resultadoPercentMG) ? p.resultadoPercentMG! : metrics.fatClass)} gap-2`}>
                    <i className={`fa-duotone ${getFatIcon(isValidValue(p.resultadoPercentMG) ? p.resultadoPercentMG! : metrics.fatClass)}`}></i>
                    {isValidValue(p.resultadoPercentMG) ? p.resultadoPercentMG : (metrics.fatClass || '-')}
                </span>
            </td>
            <td className="py-4 px-3 text-right">
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
                        className="p-1.5 text-gray-400 hover:text-red-500 transition-colors cursor-pointer"
                        title="Eliminar"
                    >
                        <i className="fa-duotone fa-trash"></i>
                    </button>
                </div>
            </td>
        </tr>
    );
};
