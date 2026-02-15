import React, { useState } from "react";
import NewButton from "@/app/components/newButton";

interface BulkAddModalProps {
    isOpen: boolean;
    onClose: () => void;
    type: 'pesagens' | 'perimetros' | 'avaliacoes';
    onSave: (data: any[]) => Promise<void>;
    isSubmitting: boolean;
}

interface BulkRow {
    id: string; // valid temp id
    [key: string]: any;
}

export function BulkAddModal({ isOpen, onClose, type, onSave, isSubmitting }: BulkAddModalProps) {
    // Pages of rows. Index 0 is page 1.
    const [pages, setPages] = useState<Record<number, BulkRow[]>>({
        0: [{ id: crypto.randomUUID(), date: new Date().toISOString().split('T')[0] }]
    });
    const [currentPage, setCurrentPage] = useState(0);
    // Track manual overrides per row: { rowId: Set<fieldName> }
    const [rowOverrides, setRowOverrides] = useState<Record<string, Set<string>>>({});

    const MAX_ROWS_PER_PAGE = 13;

    // Auto-calculated fields for pesagens
    const AUTO_FIELDS = ['mm', 'h2o', 'imc', 'resultadoIMC'];

    if (!isOpen) return null;

    const currentRows = pages[currentPage] || [];
    const totalPages = Object.keys(pages).length;

    const updatePage = (pageIndex: number, newRows: BulkRow[]) => {
        setPages(prev => ({ ...prev, [pageIndex]: newRows }));
    };

    const calculateAutoFields = (row: BulkRow, field: string, value: any): BulkRow => {
        const newRow = { ...row, [field]: value };
        const overrides = rowOverrides[row.id] || new Set<string>();

        if (type === 'pesagens') {
            const peso = parseFloat(newRow.peso) || 0;
            const height = parseFloat(newRow.height) || 0;
            const percentualMG = parseFloat(newRow.percentualMG) || 0;
            const massaOssea = parseFloat(newRow.massaOssea) || 0;

            // Auto-calculate IMC - only if not manually overridden
            if ((field === 'peso' || field === 'height') && !overrides.has('imc')) {
                if (peso > 0 && height > 0) {
                    const heightM = height / 100;
                    const imc = peso / (heightM * heightM);
                    newRow.imc = imc.toFixed(1);
                    // IMC Result Text
                    if (!overrides.has('resultadoIMC')) {
                        let result = "";
                        if (imc < 18.5) result = "Abaixo";
                        else if (imc < 24.9) result = "Normal";
                        else if (imc < 29.9) result = "Sobrepeso";
                        else if (imc < 34.9) result = "Obes. I";
                        else if (imc < 39.9) result = "Obes. II";
                        else result = "Obes. III";
                        newRow.resultadoIMC = result;
                    }
                } else {
                    newRow.imc = '';
                    if (!overrides.has('resultadoIMC')) {
                        newRow.resultadoIMC = '';
                    }
                }
            }

            // Auto-calculate MM (Muscle Mass) - only if not manually overridden
            if ((field === 'peso' || field === 'percentualMG' || field === 'massaOssea') && !overrides.has('mm')) {
                if (peso > 0 && percentualMG > 0) {
                    const mm = peso * (1 - percentualMG / 100) - massaOssea;
                    newRow.mm = mm > 0 ? mm.toFixed(2) : '';
                }
            }

            // Auto-calculate H2O - only if not manually overridden
            if (field === 'peso' && !overrides.has('h2o')) {
                if (peso > 0) {
                    // Simplified H2O calculation (approximately 60% for males, 55% for females)
                    // This is a rough estimate; the actual hook uses gender
                    const h2o = peso * 0.6; // Default to male approximation
                    newRow.h2o = h2o.toFixed(1);
                }
            }
        }
        return newRow;
    };

    const addRow = () => {
        if (currentRows.length >= MAX_ROWS_PER_PAGE) return;
        const newRow = { id: crypto.randomUUID(), date: new Date().toISOString().split('T')[0] };
        updatePage(currentPage, [...currentRows, newRow]);
    };

    const addFiveRows = () => {
        // Only add up to MAX_ROWS_PER_PAGE
        const remainingSpace = MAX_ROWS_PER_PAGE - currentRows.length;
        if (remainingSpace <= 0) return;

        const countToAdd = Math.min(5, remainingSpace);
        const newRows = Array(countToAdd).fill(null).map(() => ({
            id: crypto.randomUUID(),
            date: new Date().toISOString().split('T')[0]
        }));
        updatePage(currentPage, [...currentRows, ...newRows]);
    };

    const removeRow = (id: string) => {
        if (currentRows.length > 1) {
            updatePage(currentPage, currentRows.filter(r => r.id !== id));
        }
    };

    const updateRow = (id: string, field: string, value: any) => {
        const row = currentRows.find(r => r.id === id);
        if (!row) return;

        // If user is directly editing an auto-calculated field, mark it as manually overridden
        if (AUTO_FIELDS.includes(field)) {
            setRowOverrides(prev => {
                const existing = prev[id] || new Set<string>();
                const updated = new Set(existing);
                updated.add(field);
                return { ...prev, [id]: updated };
            });
        }

        const updatedRow = calculateAutoFields(row, field, value);
        updatePage(currentPage, currentRows.map(r => r.id === id ? updatedRow : r));
    };

    const addNewPage = () => {
        if (currentRows.length < MAX_ROWS_PER_PAGE) return; // Only allow if current page full

        const newPageIndex = totalPages;
        setPages(prev => ({
            ...prev,
            [newPageIndex]: [{ id: crypto.randomUUID(), date: new Date().toISOString().split('T')[0] }]
        }));
        setCurrentPage(newPageIndex);
    };

    const removePage = (pageIndex: number) => {
        if (totalPages <= 1) return;

        const newPages = { ...pages };
        delete newPages[pageIndex];

        // Re-index keys
        const reindexedPages: Record<number, BulkRow[]> = {};
        Object.values(newPages).forEach((rows, index) => {
            reindexedPages[index] = rows;
        });

        setPages(reindexedPages);
        if (currentPage >= Object.keys(reindexedPages).length) {
            setCurrentPage(Math.max(0, Object.keys(reindexedPages).length - 1));
        }
    };

    const handleSubmit = async () => {
        const allRows = Object.values(pages).flat();
        const validRows = allRows.filter(r => r.date);

        if (validRows.length === 0) return;

        // Attach manual overrides to each row
        const rowsWithOverrides = validRows.map(row => {
            const overrides = rowOverrides[row.id] ? Array.from(rowOverrides[row.id]) : [];
            return { ...row, manualOverrides: overrides };
        });

        await onSave(rowsWithOverrides);
        setPages({ 0: [{ id: crypto.randomUUID(), date: new Date().toISOString().split('T')[0] }] });
        setCurrentPage(0);
        setRowOverrides({});
    };

    const inputClass = "w-full px-2 py-2 text-xs border border-gray-200 rounded focus:ring-1 focus:ring-primary focus:border-primary outline-none transition-all";
    const autoInputClass = "w-full px-2 py-2 text-xs border border-violet-200 bg-violet-50 text-violet-700 font-bold rounded outline-none focus:ring-1 focus:ring-violet-500 focus:border-violet-500 transition-all";
    const manualInputClass = "w-full px-2 py-2 text-xs border border-amber-200 bg-amber-50 text-amber-700 font-bold rounded outline-none focus:ring-1 focus:ring-amber-500 focus:border-amber-500 transition-all";
    const readOnlyClass = "w-full px-2 py-2 text-xs border border-transparent bg-gray-50 text-gray-500 font-medium rounded outline-none cursor-default";

    // Helper to get appropriate class for auto fields
    const getAutoFieldClass = (rowId: string, field: string, hasValue: boolean) => {
        const isOverridden = rowOverrides[rowId]?.has(field);
        if (isOverridden) return manualInputClass;
        if (hasValue) return inputClass;
        return autoInputClass;
    };

    const renderHeader = () => {
        switch (type) {
            case 'pesagens':
                return (
                    <div className="grid grid-cols-[110px_70px_60px_60px_70px_70px_60px_60px_60px_50px_70px_1fr_40px] gap-2 mb-2 pr-2 font-bold text-xs text-gray-500 uppercase tracking-wider items-end">
                        <div className="flex items-center gap-1.5"><i className="fa-duotone fa-calendar"></i> Data</div>
                        <div className="flex items-center gap-1.5"><i className="fa-duotone fa-weight-scale"></i> Peso</div>
                        <div className="flex items-center gap-1.5"><i className="fa-duotone fa-ruler-vertical"></i> Alt.</div>
                        <div className="flex items-center gap-1.5"><i className="fa-duotone fa-percent"></i> %MG</div>

                        {/* Composition */}
                        <div className="flex items-center gap-1.5"><i className="fa-duotone fa-dumbbell"></i> MM <span className="text-[10px] text-violet-600 bg-violet-100 px-1 rounded ml-1">Auto</span></div>
                        <div className="flex items-center gap-1.5"><i className="fa-duotone fa-droplet"></i> H2O <span className="text-[10px] text-violet-600 bg-violet-100 px-1 rounded ml-1">Auto</span></div>
                        <div className="flex items-center gap-1.5"><i className="fa-duotone fa-heart-pulse"></i> G.Vis</div>
                        <div className="flex items-center gap-1.5"><i className="fa-duotone fa-clock"></i> I.Met</div>
                        <div className="flex items-center gap-1.5"><i className="fa-duotone fa-bone"></i> M.Ós</div>

                        {/* Calculated Results */}
                        <div className="flex items-center gap-1.5 text-violet-600"><i className="fa-duotone fa-calculator"></i> IMC</div>
                        <div className="flex items-center gap-1.5 text-violet-600"><i className="fa-duotone fa-chart-line"></i> Res</div>

                        <div className="flex items-center gap-1.5"><i className="fa-duotone fa-note-sticky"></i> Notas</div>
                        <div></div>
                    </div>
                );
            case 'perimetros':
                return (
                    // 9 measure fields + date + actions = 11 cols
                    <div className="grid grid-cols-[130px_75px_75px_75px_75px_75px_75px_75px_75px_75px_1fr_40px] gap-2 mb-2 pr-2 font-bold text-xs text-gray-500 uppercase tracking-wider items-end">
                        <div className="flex items-center gap-1.5"><i className="fa-duotone fa-calendar"></i> Data</div>
                        <div className="flex items-center gap-1.5"><i className="fa-regular fa-circle"></i> Peito</div>
                        <div className="flex items-center gap-1.5"><i className="fa-regular fa-circle"></i> Cintura</div>
                        <div className="flex items-center gap-1.5"><i className="fa-regular fa-circle"></i> Abdóm.</div>
                        <div className="flex items-center gap-1.5"><i className="fa-regular fa-circle"></i> Anca</div>
                        <div className="flex items-center gap-1.5"><i className="fa-duotone fa-hand"></i> MS Dir</div>
                        <div className="flex items-center gap-1.5"><i className="fa-duotone fa-hand"></i> MS Esq</div>
                        <div className="flex items-center gap-1.5"><i className="fa-duotone fa-person-walking"></i> Cx Dir</div>
                        <div className="flex items-center gap-1.5"><i className="fa-duotone fa-person-walking"></i> Cx Esq</div>
                        {/* Twin columns for legs to match perimetro modal usually having pairs but let's stick to standard if keys are just thighR/L */}
                        <div className="flex items-center gap-1.5 text-transparent">.</div>  {/* Spacer if needed or just remove extra col */}

                        <div className="flex items-center gap-1.5"><i className="fa-duotone fa-note-sticky"></i> Notas</div>
                        <div></div>
                    </div>
                );
            case 'avaliacoes':
                return (
                    <div className="grid grid-cols-[130px_100px_100px_100px_1fr_40px] gap-2 mb-2 pr-2 font-bold text-xs text-gray-500 uppercase tracking-wider items-end">
                        <div className="flex items-center gap-1.5"><i className="fa-duotone fa-calendar"></i> Data</div>
                        <div className="flex items-center gap-1.5"><i className="fa-duotone fa-person-running"></i> Flexões</div>
                        <div className="flex items-center gap-1.5"><i className="fa-duotone fa-person-running"></i> Abdominais</div>
                        <div className="flex items-center gap-1.5"><i className="fa-duotone fa-stopwatch"></i> Milha</div>
                        <div className="flex items-center gap-1.5"><i className="fa-duotone fa-note-sticky"></i> Notas</div>
                        <div></div>
                    </div>
                );
        }
    };

    const renderRow = (row: BulkRow) => {
        switch (type) {
            case 'pesagens':
                return (
                    <>
                        {/* Manual */}
                        <input type="date" value={row.date} onChange={(e) => updateRow(row.id, 'date', e.target.value)} className={inputClass} />
                        <input type="number" step="0.01" placeholder="kg" value={row.peso || ''} onChange={(e) => updateRow(row.id, 'peso', e.target.value)} className={inputClass} />
                        <input type="number" step="0.1" placeholder="cm" value={row.height || ''} onChange={(e) => updateRow(row.id, 'height', e.target.value)} className={inputClass} />
                        <input type="number" step="0.01" placeholder="%" value={row.percentualMG || ''} onChange={(e) => updateRow(row.id, 'percentualMG', e.target.value)} className={inputClass} />

                        {/* Composition */}
                        <div className="relative">
                            <input
                                type="number"
                                step="0.01"
                                placeholder="kg"
                                value={row.mm || ''}
                                onChange={(e) => updateRow(row.id, 'mm', e.target.value)}
                                className={getAutoFieldClass(row.id, 'mm', !!row.mm)}
                            />
                            {rowOverrides[row.id]?.has('mm') ? (
                                <i className="fa-duotone fa-pen-to-square absolute right-2 top-1/2 -translate-y-1/2 text-amber-400 text-xs" title="Manual"></i>
                            ) : (
                                <i className="fa-duotone fa-robot absolute right-2 top-1/2 -translate-y-1/2 text-violet-400 text-xs" title="Auto"></i>
                            )}
                        </div>
                        <div className="relative">
                            <input
                                type="number"
                                step="0.01"
                                placeholder="%"
                                value={row.h2o || ''}
                                onChange={(e) => updateRow(row.id, 'h2o', e.target.value)}
                                className={getAutoFieldClass(row.id, 'h2o', !!row.h2o)}
                            />
                            {rowOverrides[row.id]?.has('h2o') ? (
                                <i className="fa-duotone fa-pen-to-square absolute right-2 top-1/2 -translate-y-1/2 text-amber-400 text-xs" title="Manual"></i>
                            ) : (
                                <i className="fa-duotone fa-robot absolute right-2 top-1/2 -translate-y-1/2 text-violet-400 text-xs" title="Auto"></i>
                            )}
                        </div>

                        <input type="number" step="0.1" placeholder="Nív" value={row.gordVisceral || ''} onChange={(e) => updateRow(row.id, 'gordVisceral', e.target.value)} className={inputClass} />
                        <input type="number" step="0.1" placeholder="Anos" value={row.idMetabolica || ''} onChange={(e) => updateRow(row.id, 'idMetabolica', e.target.value)} className={inputClass} />
                        <input type="number" step="0.01" placeholder="kg" value={row.massaOssea || ''} onChange={(e) => updateRow(row.id, 'massaOssea', e.target.value)} className={inputClass} />

                        {/* Results (Auto Readonly) */}
                        <div className="bg-gray-50 rounded border border-gray-200 flex items-center justify-center text-xs font-semibold text-gray-600 h-[34px]">
                            {row.imc || '-'}
                        </div>
                        <div className="bg-gray-50 rounded border border-gray-200 flex items-center px-2 text-[10px] font-medium text-gray-500 overflow-hidden h-[34px] whitespace-nowrap" title={row.resultadoIMC}>
                            {row.resultadoIMC || '-'}
                        </div>

                        <input type="text" placeholder="Obs..." value={row.notas || ''} onChange={(e) => updateRow(row.id, 'notas', e.target.value)} className={inputClass} />
                    </>
                );
            case 'perimetros':
                return (
                    <>
                        <input type="date" value={row.date} onChange={(e) => updateRow(row.id, 'date', e.target.value)} className={inputClass} />
                        <input type="number" step="0.1" placeholder="cm" value={row.chest || ''} onChange={(e) => updateRow(row.id, 'chest', e.target.value)} className={inputClass} />
                        <input type="number" step="0.1" placeholder="cm" value={row.waist || ''} onChange={(e) => updateRow(row.id, 'waist', e.target.value)} className={inputClass} />
                        <input type="number" step="0.1" placeholder="cm" value={row.abdomen || ''} onChange={(e) => updateRow(row.id, 'abdomen', e.target.value)} className={inputClass} />
                        <input type="number" step="0.1" placeholder="cm" value={row.hips || ''} onChange={(e) => updateRow(row.id, 'hips', e.target.value)} className={inputClass} />
                        <input type="number" step="0.1" placeholder="cm" value={row.msRight || ''} onChange={(e) => updateRow(row.id, 'msRight', e.target.value)} className={inputClass} />
                        <input type="number" step="0.1" placeholder="cm" value={row.msLeft || ''} onChange={(e) => updateRow(row.id, 'msLeft', e.target.value)} className={inputClass} />
                        <input type="number" step="0.1" placeholder="cm" value={row.thighR || ''} onChange={(e) => updateRow(row.id, 'thighR', e.target.value)} className={inputClass} />
                        <input type="number" step="0.1" placeholder="cm" value={row.thighL || ''} onChange={(e) => updateRow(row.id, 'thighL', e.target.value)} className={inputClass} />
                        <div></div> {/* Empty spacer col */}
                    </>
                );
            case 'avaliacoes':
                return (
                    <>
                        <input type="date" value={row.date} onChange={(e) => updateRow(row.id, 'date', e.target.value)} className={inputClass} />
                        <input type="number" placeholder="Qtd" value={row.pushUps || ''} onChange={(e) => updateRow(row.id, 'pushUps', e.target.value)} className={inputClass} />
                        <input type="number" placeholder="Qtd" value={row.sitUps || ''} onChange={(e) => updateRow(row.id, 'sitUps', e.target.value)} className={inputClass} />
                        <input type="text" placeholder="Tempo/Dist" value={row.mile || ''} onChange={(e) => updateRow(row.id, 'mile', e.target.value)} className={inputClass} />
                        <input type="text" placeholder="Obs..." value={row.notes || ''} onChange={(e) => updateRow(row.id, 'notes', e.target.value)} className={inputClass} />
                    </>
                );
        }
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4 animate-in fade-in duration-200"
            onClick={onClose}
        >
            <div
                className="bg-white rounded-xl shadow-2xl w-[95%] sm:max-w-[95%] md:max-w-screen-md lg:max-w-screen-lg xl:max-w-screen-xl 2xl:max-w-screen-2xl max-h-[95vh] overflow-hidden animate-in fade-in zoom-in-95 duration-300 flex flex-col"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="px-5 py-3 border-b border-gray-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-gradient-to-r from-primary/5 via-primary/3 to-transparent">
                    <div className="flex items-center gap-2">
                        <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-primary to-orange-600 flex items-center justify-center shadow-md">
                            <i className="fa-duotone fa-layer-plus text-white text-sm"></i>
                        </div>
                        <div>
                            <h3 className="font-bold text-lg text-gray-900 flex items-center gap-2">
                                Adicionar em Massa: {type === 'pesagens' ? 'Pesagens' : type === 'perimetros' ? 'Perímetros' : 'Avaliações'}
                            </h3>
                            <p className="text-[10px] text-gray-600">Adicione até {MAX_ROWS_PER_PAGE} registos por página.</p>
                        </div>
                    </div>

                    {/* Pagination Controls */}
                    <div className="flex items-center gap-1 bg-white rounded-md p-0.5 border border-gray-200 shadow-sm">
                        <button
                            onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
                            disabled={currentPage === 0}
                            className="w-7 h-7 flex items-center justify-center text-gray-500 hover:text-primary hover:bg-primary/5 disabled:opacity-30 disabled:hover:bg-transparent rounded transition-colors cursor-pointer"
                        >
                            <i className="fa-solid fa-chevron-left text-[10px]"></i>
                        </button>
                        <span className="text-[10px] font-bold text-gray-700 min-w-[2.5rem] text-center">
                            {currentPage + 1} / {totalPages}
                        </span>
                        <button
                            onClick={() => setCurrentPage(Math.min(totalPages - 1, currentPage + 1))}
                            disabled={currentPage === totalPages - 1}
                            className="w-7 h-7 flex items-center justify-center text-gray-500 hover:text-primary hover:bg-primary/5 disabled:opacity-30 disabled:hover:bg-transparent rounded transition-colors cursor-pointer"
                        >
                            <i className="fa-solid fa-chevron-right text-[10px]"></i>
                        </button>
                        <div className="w-px h-3 bg-gray-200 mx-0.5"></div>
                        <button
                            onClick={addNewPage}
                            disabled={currentRows.length < MAX_ROWS_PER_PAGE}
                            className="w-7 h-7 flex items-center justify-center text-primary hover:bg-primary/5 disabled:opacity-30 disabled:hover:bg-transparent rounded transition-colors cursor-pointer"
                            title={currentRows.length < MAX_ROWS_PER_PAGE ? "Preencha a página atual para adicionar nova" : "Nova Página"}
                        >
                            <i className="fa-duotone fa-file-plus text-xs"></i>
                        </button>
                        {totalPages > 1 && (
                            <button
                                onClick={() => removePage(currentPage)}
                                className="w-7 h-7 flex items-center justify-center text-red-500 hover:bg-red-50 rounded transition-colors cursor-pointer"
                                title="Remover Página"
                            >
                                <i className="fa-duotone fa-trash-xmark text-xs"></i>
                            </button>
                        )}
                    </div>
                </div>

                {/* Content - Scrollable horizontally for table, vertically for rows */}
                <div className="flex-1 overflow-auto bg-white relative">
                    <div className="min-w-[1400px] p-4 pt-2">
                        {renderHeader()}

                        <div className="space-y-1.5">
                            {currentRows.map((row) => (
                                <div key={row.id} className={`grid gap-2 items-center ${type === 'pesagens' ? 'grid-cols-[110px_70px_60px_60px_70px_70px_60px_60px_60px_50px_70px_1fr_40px]' :
                                    type === 'perimetros' ? 'grid-cols-[130px_75px_75px_75px_75px_75px_75px_75px_75px_75px_1fr_40px]' :
                                        'grid-cols-[130px_100px_100px_100px_1fr_40px]'
                                    }`}>
                                    {renderRow(row)}
                                    <button
                                        onClick={() => removeRow(row.id)}
                                        className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors cursor-pointer"
                                        disabled={currentRows.length === 1}
                                    >
                                        <i className="fa-duotone fa-trash text-sm"></i>
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-3 border-t border-gray-100 bg-gray-50 flex flex-col sm:flex-row justify-between items-center gap-2">
                    <div className="flex gap-2 w-full sm:w-auto">
                        <NewButton
                            onClick={addRow}
                            variant="new_primary_no_bg_rounded"
                            className="text-gray-600 hover:text-primary hover:bg-primary/10 flex-1 sm:flex-none cursor-pointer h-8 text-xs"
                            icon={<i className="fa-duotone fa-plus"></i>}
                            disabled={currentRows.length >= MAX_ROWS_PER_PAGE}
                        >
                            <span className="truncate">Adicionar Linha</span>
                        </NewButton>
                        <NewButton
                            onClick={addFiveRows}
                            variant="new_primary_no_bg_rounded"
                            className="text-gray-600 hover:text-primary hover:bg-primary/10 flex-1 sm:flex-none cursor-pointer h-8 text-xs"
                            icon={<i className="fa-duotone fa-layer-plus"></i>}
                            disabled={currentRows.length >= MAX_ROWS_PER_PAGE}
                        >
                            <span className="truncate">+ 5 Linhas</span>
                        </NewButton>
                    </div>

                    <div className="flex gap-2 w-full sm:w-auto">
                        <NewButton
                            onClick={onClose}
                            variant="new_primary_no_bg_rounded"
                            className="flex-1 sm:flex-none text-gray-500 hover:text-gray-800 cursor-pointer h-8 text-xs"
                        >
                            Cancelar
                        </NewButton>
                        <NewButton
                            onClick={handleSubmit}
                            disabled={isSubmitting}
                            variant="new_primary_rounded"
                            icon={isSubmitting ? <i className="fa-duotone fa-spinner-third animate-spin"></i> : <i className="fa-duotone fa-save"></i>}
                            className="flex-1 sm:flex-none cursor-pointer h-8 text-xs"
                        >
                            {isSubmitting ? 'A Guardar...' : `Guardar Todos (${Object.values(pages).flat().length})`}
                        </NewButton>
                    </div>
                </div>
            </div>
        </div>
    );
}
