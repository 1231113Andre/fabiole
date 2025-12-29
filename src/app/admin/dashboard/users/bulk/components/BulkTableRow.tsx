import React, { memo, useCallback } from "react";
import { BulkRow, BulkType } from "./types";
import { INPUT_CLASS, getBmiClassColor, getFatClassColor, getDeltaPesoColor, formatDelta } from "./utils";

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

// Overridable field display
const OverridableField = memo(function OverridableField({
    value,
    isOverride,
    onToggle,
    onChange
}: {
    value: string;
    isOverride?: boolean;
    onToggle: () => void;
    onChange: (val: string) => void;
}) {
    return (
        <div className="flex items-center justify-center gap-1 group relative">
            {isOverride ? (
                <input
                    type="number"
                    step="0.01"
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    className="w-16 text-center border border-emerald-300 rounded px-1 py-0.5 text-xs font-bold text-emerald-700 bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
            ) : (
                <span className="bg-violet-100 text-violet-700 px-2 py-0.5 rounded text-[10px] font-bold inline-block min-w-[3rem]">
                    {value || '-'}
                </span>
            )}

            <button
                onClick={onToggle}
                className={`w-4 h-4 rounded-full flex items-center justify-center text-[8px] transition-all cursor-pointer absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 ${isOverride
                    ? 'bg-emerald-500 text-white hover:bg-emerald-600'
                    : 'bg-violet-200 text-violet-700 hover:bg-violet-300'
                    }`}
                title={isOverride ? "Voltar para Auto" : "Mudar para Manual"}
            >
                <i className={`fa-solid ${isOverride ? 'fa-rotate-right' : 'fa-pen'}`}></i>
            </button>
            {isOverride && (
                <div className="absolute -top-2 -right-2 w-4 h-4 rounded-full flex items-center justify-center text-[8px] bg-emerald-500 text-white pointer-events-none group-hover:opacity-0 transition-opacity">
                    <i className="fa-solid fa-pen"></i>
                </div>
            )}
        </div>
    );
});

// Classification badge
const ClassBadge = memo(function ClassBadge({
    value,
    colorFn
}: {
    value: string;
    colorFn: (v: string) => string;
}) {
    return (
        <span className={`px-2 py-0.5 rounded text-[10px] font-bold inline-block min-w-[5rem] ${colorFn(value || "")}`}>
            {value || '-'}
        </span>
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
            <td className="py-3 px-2 font-bold text-center">
                <RowInput type="number" step="0.01" value={row.peso || ''} onChange={(v) => onUpdate('peso', v)} className="text-center font-bold !text-gray-900" />
            </td>
            <td className={`py-3 px-2 text-center font-semibold text-xs ${getDeltaPesoColor(evolution)}`}>
                {formatDelta(evolution)}
            </td>
            <td className="py-3 px-2">
                <RowInput type="number" step="0.1" value={row.height || ''} onChange={(v) => onUpdate('height', v)} className="text-center !text-gray-600" />
            </td>
            <td className="py-3 px-2">
                <RowInput type="number" step="0.1" value={row.percentualMG || ''} onChange={(v) => onUpdate('percentualMG', v)} className="text-center font-semibold !text-gray-900" />
            </td>
            <td className="py-3 px-2 text-center">
                <OverridableField
                    value={row.mm || ''}
                    isOverride={row.overrides?.mm}
                    onToggle={() => onToggleOverride('mm')}
                    onChange={(v) => onUpdate('mm', v)}
                />
            </td>
            <td className="py-3 px-2 text-center">
                <OverridableField
                    value={row.h2o || ''}
                    isOverride={row.overrides?.h2o}
                    onToggle={() => onToggleOverride('h2o')}
                    onChange={(v) => onUpdate('h2o', v)}
                />
            </td>
            <td className="py-3 px-2 text-center">
                <OverridableField
                    value={row.imc || ''}
                    isOverride={row.overrides?.imc}
                    onToggle={() => onToggleOverride('imc')}
                    onChange={(v) => onUpdate('imc', v)}
                />
            </td>
            <td className="py-3 px-2">
                <RowInput type="number" step="1" value={row.gordVisceral || ''} onChange={(v) => onUpdate('gordVisceral', v)} className="text-center !text-gray-600" />
            </td>
            <td className="py-3 px-2">
                <RowInput type="number" step="0.1" value={row.idMetabolica || ''} onChange={(v) => onUpdate('idMetabolica', v)} className="text-center !text-gray-600" />
            </td>
            <td className="py-3 px-2">
                <RowInput type="number" step="0.01" value={row.massaOssea || ''} onChange={(v) => onUpdate('massaOssea', v)} className="text-center !text-gray-600" />
            </td>
            <td className="py-3 px-2 text-center">
                {row.overrides?.resultadoIMC ? (
                    <OverridableField
                        value={row.resultadoIMC || ''}
                        isOverride={true}
                        onToggle={() => onToggleOverride('resultadoIMC')}
                        onChange={(v) => onUpdate('resultadoIMC', v)}
                    />
                ) : (
                    <div className="relative group">
                        <ClassBadge value={row.resultadoIMC} colorFn={getBmiClassColor} />
                        <button onClick={() => onToggleOverride('resultadoIMC')} className="absolute -top-1 -right-1 w-3 h-3 bg-violet-200 text-violet-700 rounded-full text-[8px] opacity-0 group-hover:opacity-100 flex items-center justify-center hover:bg-violet-300">
                            <i className="fa-solid fa-pen"></i>
                        </button>
                    </div>
                )}
            </td>
            <td className="py-3 px-2 text-center">
                {row.overrides?.resultadoPercentMG ? (
                    <OverridableField
                        value={row.resultadoPercentMG || ''}
                        isOverride={true}
                        onToggle={() => onToggleOverride('resultadoPercentMG')}
                        onChange={(v) => onUpdate('resultadoPercentMG', v)}
                    />
                ) : (
                    <div className="relative group">
                        <ClassBadge value={row.resultadoPercentMG} colorFn={getFatClassColor} />
                        <button onClick={() => onToggleOverride('resultadoPercentMG')} className="absolute -top-1 -right-1 w-3 h-3 bg-violet-200 text-violet-700 rounded-full text-[8px] opacity-0 group-hover:opacity-100 flex items-center justify-center hover:bg-violet-300">
                            <i className="fa-solid fa-pen"></i>
                        </button>
                    </div>
                )}
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
            <td className="py-3 px-2"><RowInput type="number" step="0.1" value={row.msRight || ''} onChange={(v) => onUpdate('msRight', v)} className="text-center !text-gray-600" /></td>
            <td className="py-3 px-2"><RowInput type="number" step="0.1" value={row.msLeft || ''} onChange={(v) => onUpdate('msLeft', v)} className="text-center !text-gray-600" /></td>
            <td className="py-3 px-2"><RowInput type="number" step="0.1" value={row.chest || ''} onChange={(v) => onUpdate('chest', v)} className="text-center !text-gray-600" /></td>
            <td className="py-3 px-2"><RowInput type="number" step="0.1" value={row.waist || ''} onChange={(v) => onUpdate('waist', v)} className="text-center font-bold !text-gray-800" /></td>
            <td className="py-3 px-2"><RowInput type="number" step="0.1" value={row.abdomen || ''} onChange={(v) => onUpdate('abdomen', v)} className="text-center font-bold !text-gray-800" /></td>
            <td className="py-3 px-2"><RowInput type="number" step="0.1" value={row.hips || ''} onChange={(v) => onUpdate('hips', v)} className="text-center !text-gray-600" /></td>
            <td className="py-3 px-2"><RowInput type="number" step="0.1" value={row.thighR || ''} onChange={(v) => onUpdate('thighR', v)} className="text-center !text-gray-600" /></td>
            <td className="py-3 px-2"><RowInput type="number" step="0.1" value={row.thighL || ''} onChange={(v) => onUpdate('thighL', v)} className="text-center !text-gray-600" /></td>
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
            <td className="py-3 px-2 font-bold text-center"><RowInput type="number" value={row.pushUps || ''} onChange={(v) => onUpdate('pushUps', v)} className="text-center font-bold !text-gray-800" /></td>
            <td className="py-3 px-2 font-bold text-center"><RowInput type="number" value={row.sitUps || ''} onChange={(v) => onUpdate('sitUps', v)} className="text-center font-bold !text-gray-800" /></td>
            <td className="py-3 px-2 text-center"><RowInput type="text" value={row.mile || ''} onChange={(v) => onUpdate('mile', v)} className="text-center !text-gray-600" /></td>
            <td className="py-3 px-2 text-center font-bold text-primary text-[10px]">{row.mileResult || '-'}</td>
            <td className="py-3 px-2"><RowInput type="text" value={row.notes || ''} onChange={(v) => onUpdate('notes', v)} className="!text-gray-600" placeholder="..." /></td>
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
        <tr className="border-b border-gray-300 hover:bg-gray-50 transition-colors items-center">
            <td className="py-3 px-2 whitespace-nowrap">
                <RowInput
                    type="date"
                    value={row.date || ''}
                    onChange={(v) => handleFieldUpdate('date', v)}
                    className="font-bold"
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

