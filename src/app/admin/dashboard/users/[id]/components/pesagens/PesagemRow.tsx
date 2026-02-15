import React from "react";
import { Pesagem } from "../../types";
import { calculatePesagemMetrics, getBmiClassColor, getFatClassColor, getDeltaPesoColor, getBmiIcon, getFatIcon, getMileResultStyle, classifySMI, BADGE_STYLES, calculateAutoSmi } from "./pesagemMetrics";

interface PesagemRowProps {
    pesagem: Pesagem;
    gender: string;
    userAge?: number | null;
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
    userAge,
    previousPesagem,
    onEdit,
    onDelete
}) => {
    const metrics = calculatePesagemMetrics(p, gender, userAge, previousPesagem);

    return (
        <tr className="group hover:bg-gray-50/50 transition-colors duration-200 border-t border-solid border-gray-300 first:border-none">
            <td className="py-3 px-2 whitespace-nowrap font-medium text-gray-700">{new Date(p.date).toLocaleDateString('pt-PT')}</td>
            <td className="py-3 px-2 text-center font-bold text-gray-900">
                {p.peso ? (
                    <span className="flex items-center justify-center">
                        {p.peso}<sup className="text-[9px] ml-0.5">kg</sup>
                    </span>
                ) : '-'}
            </td>
            <td className={`py-3 px-2 text-center font-semibold ${getDeltaPesoColor(metrics.deltaPeso)}`}>
                {metrics.deltaPeso}
            </td>
            <td className="py-3 px-2 text-center font-bold text-gray-700">
                {p.height ? (
                    <div className="flex items-center justify-center">
                        <span>{p.height}</span>
                        <div className="flex flex-col items-start ml-0.5 leading-none gap-0.5">
                            <span className="text-xs text-black font-bold">cm</span>
                            <span className="text-[10px] text-gray-900 font-normal whitespace-nowrap">(m'{String(p.height % 100).padStart(2, '0')})</span>
                        </div>
                    </div>
                ) : '-'}
            </td>
            <td className="py-3 px-2 text-center font-semibold text-gray-700">{p.percentualMG ? `${p.percentualMG}%` : '-'}</td>
            <td className="py-3 px-2 text-center">
                <span className={BADGE_STYLES.PURPLE}>
                    {(p.mm ?? metrics.mm) ? (
                        <span className="flex items-center justify-center">
                            {p.mm ?? metrics.mm}<sup className="text-[9px] ml-0.5">kg</sup>
                        </span>
                    ) : '-'}
                </span>
            </td>
            <td className="py-3 px-2 text-center">
                {(p.h2o ?? metrics.h2o) ? (
                    <span className={`${BADGE_STYLES.BLUE} flex flex-col items-center leading-tight`}>
                        <span className="flex items-center gap-1">
                            <i className="fa-duotone fa-droplet text-xs" />
                            {p.h2o ?? metrics.h2o}%
                        </span>
                        {metrics.h2oKg && (
                            <span className="text-xs flex items-center">
                                ({metrics.h2oKg})<sup className="text-[9px] ml-0.5">kg</sup>
                            </span>
                        )}
                    </span>
                ) : (
                    <span className={BADGE_STYLES.BLUE}>-</span>
                )}
            </td>
            <td className="py-3 px-2 text-center">
                <span className={BADGE_STYLES.GREEN}>
                    {p.imc ?? metrics.bmi ?? '-'}
                </span>
            </td>
            <td className="py-3 px-2 text-center font-semibold text-gray-900">{p.gordVisceral || '-'}</td>
            <td className="py-3 px-2 text-center font-semibold text-gray-900">{p.idMetabolica || '-'}</td>
            <td className="py-3 px-2 text-center font-semibold text-gray-900">{p.massaOssea || '-'}</td>
            <td className="py-3 px-2 text-center">
                <span className={`${getBmiClassColor(isValidValue(p.resultadoIMC) ? p.resultadoIMC! : metrics.bmiClass)}`}>
                    <i className={`fa-duotone ${getBmiIcon(isValidValue(p.resultadoIMC) ? p.resultadoIMC! : metrics.bmiClass)} shrink-0 text-[12px]`}></i>
                    <span>{isValidValue(p.resultadoIMC) ? p.resultadoIMC : (metrics.bmiClass || '-')}</span>
                </span>
            </td>
            <td className="py-3 px-2 text-center">
                <span className={`${getFatClassColor(isValidValue(p.resultadoPercentMG) ? p.resultadoPercentMG! : metrics.fatClass)}`}>
                    <i className={`fa-duotone ${getFatIcon(isValidValue(p.resultadoPercentMG) ? p.resultadoPercentMG! : metrics.fatClass)} shrink-0 text-[12px]`}></i>
                    <span>{isValidValue(p.resultadoPercentMG) ? p.resultadoPercentMG : (metrics.fatClass || '-')}</span>
                </span>
            </td>
            <td className="py-3 px-2 text-center text-xs sm:text-sm">
                {(() => {
                    const { msRight, msLeft, miRight, miLeft, height } = p;

                    // Priority 1: Stored SMI value (from DB)
                    if (p.smi != null) {
                        return (
                            <span className={BADGE_STYLES.PURPLE}>{p.smi.toFixed(2).replace('.', ',')}</span>
                        );
                    }

                    // Priority 2 & 3: Calculate using shared logic (handles limbs & MM fallback & partial data)
                    const smiVal = calculateAutoSmi(msRight, msLeft, miRight, miLeft, height);

                    if (smiVal != null) {
                        return (
                            <span className={BADGE_STYLES.PURPLE}>
                                {smiVal.toFixed(2).replace('.', ',')}
                            </span>
                        );
                    }

                    return '-';
                })()}
            </td>
            <td className="py-3 px-2 text-center text-xs sm:text-sm">
                {(() => {
                    const { msRight, msLeft, miRight, miLeft, height, smi } = p;

                    let smiVal = smi;

                    if (smiVal == null) {
                        smiVal = calculateAutoSmi(msRight, msLeft, miRight, miLeft, height);
                    }

                    const smiRes = (smiVal != null && gender) ? classifySMI(smiVal, gender) : '';
                    return smiRes ? (
                        <span className={getMileResultStyle(smiRes)}>{smiRes}</span>
                    ) : '-';
                })()}
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
