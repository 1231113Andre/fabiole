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

// Auto-calculated field display
const AutoField = memo(function AutoField({ value }: { value: string }) {
    return (
        <span className="bg-violet-100 text-violet-700 px-2 py-0.5 rounded text-[10px] font-bold inline-block min-w-[3rem]">
            {value || '-'}
        </span>
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
    onUpdate
}: {
    row: BulkRow;
    evolution: number | null;
    onUpdate: (field: string, value: string) => void;
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
            <td className="py-3 px-2 text-center"><AutoField value={row.mm} /></td>
            <td className="py-3 px-2 text-center"><AutoField value={row.h2o} /></td>
            <td className="py-3 px-2 text-center"><AutoField value={row.imc} /></td>
            <td className="py-3 px-2">
                <RowInput type="number" step="1" value={row.gordVisceral || ''} onChange={(v) => onUpdate('gordVisceral', v)} className="text-center !text-gray-600" />
            </td>
            <td className="py-3 px-2">
                <RowInput type="number" step="0.1" value={row.idMetabolica || ''} onChange={(v) => onUpdate('idMetabolica', v)} className="text-center !text-gray-600" />
            </td>
            <td className="py-3 px-2">
                <RowInput type="number" step="0.01" value={row.massaOssea || ''} onChange={(v) => onUpdate('massaOssea', v)} className="text-center !text-gray-600" />
            </td>
            <td className="py-3 px-2 text-center"><ClassBadge value={row.resultadoIMC} colorFn={getBmiClassColor} /></td>
            <td className="py-3 px-2 text-center"><ClassBadge value={row.resultadoPercentMG} colorFn={getFatClassColor} /></td>
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
    onDelete
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

            {type === 'pesagens' && <PesagensRow row={row} evolution={evolution} onUpdate={handleFieldUpdate} />}
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

