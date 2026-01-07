import React, { memo, useCallback } from "react";
import { BulkRow, BulkType } from "./types";
import { INPUT_CLASS, BOX_CLASS, getBmiClassColor, getFatClassColor, getDeltaPesoColor, formatDelta, getMileResultStyle } from "./utils";
import { parseNumber } from "@/lib/body-metrics";

interface BulkTableRowProps {
    row: BulkRow;
    index: number;
    type: BulkType;
    evolution: number | null;
    canDelete: boolean;
    onUpdate: (id: string, field: string, value: string) => void;
    onDelete: (id: string) => void;
    onToggleOverride: (id: string, field: string) => void;
}

// Memoized input component for better performance
const RowInput = memo(function RowInput({
    type,
    value,
    onChange,
    className = "",
    step,
    placeholder
}: {
    type: "text" | "number" | "date";
    value: string;
    onChange: (value: string) => void;
    className?: string;
    step?: string;
    placeholder?: string;
}) {
    return (
        <input
            type={type}
            step={step}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className={`${INPUT_CLASS} ${className}`}
            placeholder={placeholder}
        />
    );
});

const OverridableField = memo(function OverridableField({
    value,
    isOverride,
    onToggle,
    onChange,
    suffix,
    prefixIcon,
    iconColor = "text-violet-400",
    secondaryValue
}: {
    value: string;
    isOverride?: boolean;
    onToggle: () => void;
    onChange: (val: string) => void;
    suffix?: React.ReactNode;
    prefixIcon?: string;
    iconColor?: string;
    secondaryValue?: React.ReactNode;
}) {
    return (
        <div className="flex flex-col items-center justify-center relative group w-full min-w-[3.5rem]">
            <div className="w-full relative">
                {isOverride ? (
                    <div className={`flex flex-col items-center justify-center bg-white border border-gray-200 hover:border-emerald-400 rounded-md shadow-sm px-1 focus-within:ring-2 focus-within:ring-emerald-500/20 focus-within:border-emerald-500 transition-all relative z-10 w-full ${secondaryValue ? 'h-10 py-0.5' : 'h-8'}`}>
                        <div className="flex items-center justify-center w-full">
                            {prefixIcon && <i className={`fa-duotone ${prefixIcon} ${iconColor} mr-1.5 text-[10px]`} />}
                            <input
                                type="number"
                                step="0.01"
                                value={value}
                                onChange={(e) => onChange(e.target.value)}
                                className="w-full text-center text-xs font-bold text-emerald-700 bg-transparent focus:outline-none p-0 leading-none"
                            />
                            {/* Show suffix in input mode if provided */}
                            {suffix && <span className="text-[10px] text-emerald-600 ml-px shrink-0 leading-none">{suffix}</span>}
                        </div>
                        {/* Secondary Value inside input container */}
                        {secondaryValue && (
                            <div className="text-[9px] text-gray-400 leading-none mt-0.5 font-medium whitespace-nowrap">
                                {secondaryValue}
                            </div>
                        )}
                    </div>
                ) : (
                    <div className={`flex flex-col items-center justify-center w-full px-1 bg-white border border-gray-200 rounded-md shadow-sm text-xs font-medium text-gray-700 relative ${secondaryValue ? 'h-10 py-1' : 'h-8'}`}>
                        <div className="flex items-center justify-center w-full leading-none">
                            {prefixIcon && <i className={`fa-duotone ${prefixIcon} ${iconColor} mr-1.5 text-[10px]`} />}
                            <span className="truncate text-center">{value || '-'}</span>
                            {value && suffix && <span className="text-[10px] text-gray-500 ml-0.5">{suffix}</span>}
                        </div>
                        {/* Secondary Value inside display container */}
                        {secondaryValue && value && (
                            <div className="text-[9px] text-gray-400 leading-none mt-0.5 font-medium whitespace-nowrap">
                                {secondaryValue}
                            </div>
                        )}
                    </div>
                )}

                <button
                    onClick={onToggle}
                    className={`w-5 h-5 rounded-full flex items-center justify-center text-[9px] transition-all cursor-pointer absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 z-20 shadow-sm border border-white ${isOverride
                        ? 'bg-emerald-500 text-white hover:bg-emerald-600'
                        : 'bg-violet-500 text-white hover:bg-violet-600'
                        }`}
                    title={isOverride ? "Voltar para Auto" : "Mudar para Manual"}
                >
                    <i className={`fa-solid ${isOverride ? 'fa-rotate-right' : 'fa-pen'}`}></i>
                </button>
            </div>
        </div>
    );
});

// Classification badge - Standalone style without refined input look
const ClassBadge = memo(function ClassBadge({
    value,
    colorFn
}: {
    value: string;
    colorFn: (v: string) => string;
}) {
    if (!value) {
        return (
            <div className="flex items-center justify-center w-full px-1">
                <span className="text-xs text-gray-400 font-medium">-</span>
            </div>
        );
    }

    // Extract text color class from colorFn or map it
    const colorClass = colorFn(value);

    return (
        <div className="flex items-center justify-center w-full px-1">
            <span className={`text-xs font-bold truncate py-1 px-2 rounded-full ${colorClass}`}>
                {value}
            </span>
        </div>
    );
});

// Delete button
const DeleteButton = memo(function DeleteButton({
    disabled,
    onClick
}: {
    disabled: boolean;
    onClick: () => void;
}) {
    return (
        <button
            onClick={onClick}
            className="p-1.5 text-gray-300 hover:text-red-500 rounded-lg group transition-all cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
            disabled={disabled}
        >
            <i className="fa-duotone fa-trash-can group-hover:scale-110"></i>
        </button>
    );
});

// Pesagens row cells
const PesagensRow = memo(function PesagensRow({
    row,
    evolution,
    onUpdate,
    onToggleOverride
}: {
    row: BulkRow;
    evolution: number | null;
    onUpdate: (field: string, value: string) => void;
    onToggleOverride: (field: string) => void;
}) {
    return (
        <>
            <td className="py-3 px-1 font-bold text-center">
                <div className="flex items-center justify-center">
                    <RowInput type="number" step="0.01" value={row.peso || ''} onChange={(v) => onUpdate('peso', v)} className="text-center font-bold !text-gray-900 w-16" />
                </div>
            </td>
            <td className={`py-3 px-1 text-center font-semibold text-xs ${getDeltaPesoColor(evolution)}`}>
                {formatDelta(evolution)}
            </td>
            <td className="py-3 px-1">
                <RowInput type="number" step="0.1" value={row.height || ''} onChange={(v) => onUpdate('height', v)} className="text-center !text-gray-600" />
            </td>
            <td className="py-3 px-1">
                <RowInput type="number" step="0.1" value={row.percentualMG || ''} onChange={(v) => onUpdate('percentualMG', v)} className="text-center font-semibold !text-gray-900" />
            </td>
            <td className="py-3 px-1 text-center">
                <div className="flex flex-col items-center justify-center">
                    <OverridableField
                        value={row.mm || ''}
                        isOverride={row.overrides?.mm}
                        onToggle={() => onToggleOverride('mm')}
                        onChange={(v) => onUpdate('mm', v)}
                    />
                </div>
            </td>
            <td className="py-3 px-1 text-center">
                <div className="flex flex-col items-center justify-center gap-0.5">
                    <div className="flex items-center justify-center gap-1 w-full">
                        <OverridableField
                            value={row.h2o || ''}
                            isOverride={row.overrides?.h2o}
                            onToggle={() => onToggleOverride('h2o')}
                            onChange={(v) => onUpdate('h2o', v)}
                            suffix="%"
                            prefixIcon="fa-droplet"
                            iconColor="text-blue-400"
                            secondaryValue={(() => {
                                const h2oVal = parseNumber(row.h2o);
                                const pesoVal = parseNumber(row.peso);
                                if (h2oVal === null || pesoVal === null) return null;
                                const kgValue = ((h2oVal / 100) * pesoVal).toFixed(1);
                                return (
                                    <span className="font-bold whitespace-nowrap">
                                        ({kgValue})kg
                                    </span>
                                );
                            })()}
                        />
                    </div>
                </div>
            </td>
            <td className="py-3 px-1 text-center">
                <OverridableField
                    value={row.imc || ''}
                    isOverride={row.overrides?.imc}
                    onToggle={() => onToggleOverride('imc')}
                    onChange={(v) => onUpdate('imc', v)}
                />
            </td>
            <td className="py-3 px-1">
                <RowInput type="number" step="1" value={row.gordVisceral || ''} onChange={(v) => onUpdate('gordVisceral', v)} className={`text-center !text-gray-600 ${BOX_CLASS}`} />
            </td>
            <td className="py-3 px-1">
                <RowInput type="number" step="0.1" value={row.idMetabolica || ''} onChange={(v) => onUpdate('idMetabolica', v)} className={`text-center !text-gray-600 ${BOX_CLASS}`} />
            </td>
            <td className="py-3 px-1">
                <RowInput type="number" step="0.01" value={row.massaOssea || ''} onChange={(v) => onUpdate('massaOssea', v)} className={`text-center !text-gray-600 ${BOX_CLASS}`} />
            </td>
            <td className="py-3 px-1 text-center">
                <ClassBadge value={row.resultadoIMC} colorFn={getBmiClassColor} />
            </td>
            <td className="py-3 px-1 text-center">
                <ClassBadge value={row.resultadoPercentMG} colorFn={getFatClassColor} />
            </td>
        </>
    );
});

// Perimetros row cells
const PerimetrosRow = memo(function PerimetrosRow({
    row,
    onUpdate
}: {
    row: BulkRow;
    onUpdate: (field: string, value: string) => void;
}) {
    return (
        <>
            <td className="py-3 px-1"><RowInput type="number" step="0.1" value={row.msRight || ''} onChange={(v) => onUpdate('msRight', v)} className="text-center !text-gray-600" /></td>
            <td className="py-3 px-1"><RowInput type="number" step="0.1" value={row.msLeft || ''} onChange={(v) => onUpdate('msLeft', v)} className="text-center !text-gray-600" /></td>
            <td className="py-3 px-1"><RowInput type="number" step="0.1" value={row.chest || ''} onChange={(v) => onUpdate('chest', v)} className="text-center !text-gray-600" /></td>
            <td className="py-3 px-1"><RowInput type="number" step="0.1" value={row.waist || ''} onChange={(v) => onUpdate('waist', v)} className="text-center font-bold !text-gray-800" /></td>
            <td className="py-3 px-1"><RowInput type="number" step="0.1" value={row.abdomen || ''} onChange={(v) => onUpdate('abdomen', v)} className="text-center font-bold !text-gray-800" /></td>
            <td className="py-3 px-1"><RowInput type="number" step="0.1" value={row.hips || ''} onChange={(v) => onUpdate('hips', v)} className="text-center !text-gray-600" /></td>
            <td className="py-3 px-1"><RowInput type="number" step="0.1" value={row.thighR || ''} onChange={(v) => onUpdate('thighR', v)} className="text-center !text-gray-600" /></td>
            <td className="py-3 px-1"><RowInput type="number" step="0.1" value={row.thighL || ''} onChange={(v) => onUpdate('thighL', v)} className="text-center !text-gray-600" /></td>
        </>
    );
});

// Avaliacoes row cells
const AvaliacoesRow = memo(function AvaliacoesRow({
    row,
    onUpdate
}: {
    row: BulkRow;
    onUpdate: (field: string, value: string) => void;
}) {
    return (
        <>
            <td className="py-3 px-1 font-bold text-center"><RowInput type="number" value={row.pushUps || ''} onChange={(v) => onUpdate('pushUps', v)} className="text-center font-bold !text-gray-800" /></td>
            <td className="py-3 px-1 text-center">
                <ClassBadge value={row.pushUpsResult} colorFn={getMileResultStyle} />
            </td>
            <td className="py-3 px-1 font-bold text-center"><RowInput type="number" value={row.sitUps || ''} onChange={(v) => onUpdate('sitUps', v)} className="text-center font-bold !text-gray-800" /></td>
            <td className="py-3 px-1 text-center"><RowInput type="text" value={row.mile || ''} onChange={(v) => onUpdate('mile', v)} className="text-center !text-gray-600" /></td>
            <td className="py-3 px-1 text-center">
                <ClassBadge value={row.mileResult} colorFn={getMileResultStyle} />
            </td>
            <td className="py-3 px-1"><RowInput type="text" value={row.notes || ''} onChange={(v) => onUpdate('notes', v)} className="!text-gray-600" placeholder="..." /></td>
        </>
    );
});

export const BulkTableRow = memo(function BulkTableRow({
    row,
    index,
    type,
    evolution,
    canDelete,
    onUpdate,
    onDelete,
    onToggleOverride
}: BulkTableRowProps) {
    const handleFieldUpdate = useCallback((field: string, value: string) => {
        onUpdate(row.id, field, value);
    }, [row.id, onUpdate]);

    const handleDelete = useCallback(() => {
        onDelete(row.id);
    }, [row.id, onDelete]);

    return (
        <tr className="border-b border-gray-300 hover:bg-gray-50 transition-colors items-center even:bg-gray-50/30">
            <td className="sticky left-0 z-10 bg-white group-hover:bg-gray-50 group-even:bg-gray-50/30 py-3 px-2 whitespace-nowrap shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">
                <RowInput
                    type="date"
                    value={row.date || ''}
                    onChange={(v) => handleFieldUpdate('date', v)}
                    className="font-bold bg-transparent !w-[105px] px-0 text-right cursor-pointer"
                />
            </td>

            {type === 'pesagens' && (
                <PesagensRow
                    row={row}
                    evolution={evolution}
                    onUpdate={handleFieldUpdate}
                    onToggleOverride={(field) => onToggleOverride(row.id, field)}
                />
            )}
            {type === 'perimetros' && <PerimetrosRow row={row} onUpdate={handleFieldUpdate} />}
            {type === 'avaliacoes' && <AvaliacoesRow row={row} onUpdate={handleFieldUpdate} />}

            <td className="py-3 px-2 text-right">
                <div className="flex justify-end pr-1">
                    <DeleteButton disabled={!canDelete} onClick={handleDelete} />
                </div>
            </td>
        </tr>
    );
});

