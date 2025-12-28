"use client";

import React, { useState, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import NewButton from "@/app/components/newButton";
import { UserHeader } from "../../[id]/components/UserHeader";
import { UserData, Tab } from "../../[id]/types";

// Local components and hooks
import { BulkAddClientProps, TYPE_LABELS, TYPE_LABELS_PT, MAX_ROWS_PER_PAGE } from "./types";
import { useBulkState } from "./useBulkState";
import { BulkTableHeader } from "./BulkTableHeader";
import { BulkTableRow } from "./BulkTableRow";
import { BulkPagination } from "./BulkPagination";
import { getDescription } from "./BulkDescriptions";

export function BulkAddClient({ initialUser, type }: BulkAddClientProps) {
    const router = useRouter();
    const [user, setUser] = useState<UserData>(initialUser);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const {
        pages,
        currentPage,
        setCurrentPage,
        currentRows,
        totalPages,
        addRow,
        addFiveRows,
        removeRow,
        updateRow,
        addNewPage,
        getAllRows,
        newRecordsCount
    } = useBulkState(type, user.gender || '');

    const fetchUser = useCallback(async () => {
        try {
            const response = await fetch(`/api/admin/users/${user.id}`);
            if (response.ok) {
                const data = await response.json();
                setUser(data);
            }
        } catch (err) {
            console.error("Fetch error:", err);
        }
    }, [user.id]);

    const handleSave = useCallback(async () => {
        const allRows = getAllRows();
        const validRows = allRows.filter(r => r.date);
        if (validRows.length === 0) return;

        setIsSubmitting(true);
        try {
            // Prepare all records for bulk insert
            const records = validRows.map(record => {
                const payload: Record<string, any> = { ...record };
                delete payload.id;
                Object.keys(payload).forEach(key => {
                    if (key !== 'date' && key !== 'notas' && key !== 'notes' && key !== 'mile' && key !== 'mileResult' && payload[key]) {
                        const val = parseFloat(payload[key].toString());
                        if (!isNaN(val)) payload[key] = val;
                    }
                });
                return payload;
            });

            // Single bulk request - much faster than sequential
            const response = await fetch(`/api/admin/users/${user.id}/${type}/bulk`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(records)
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error || "Erro ao guardar registos");
            }

            router.push(`/admin/dashboard/users/${user.id}`);
        } catch (error: any) {
            console.error(error);
            alert(error.message || "Erro ao guardar alguns registos.");
        } finally {
            setIsSubmitting(false);
        }
    }, [getAllRows, user.id, type, router]);

    // Calculate evolution for pesagens
    const getEvolution = useCallback((rowIndex: number): number | null => {
        if (type !== 'pesagens') return null;
        const peso = parseFloat(currentRows[rowIndex]?.peso);
        if (!peso) return null;
        
        let prevPeso: number | null = null;
        if (rowIndex > 0) {
            prevPeso = parseFloat(currentRows[rowIndex - 1]?.peso);
        } else if (currentPage > 0) {
            const prevPageRows = pages[currentPage - 1];
            prevPeso = parseFloat(prevPageRows?.[prevPageRows.length - 1]?.peso);
        } else {
            const sorted = [...user.pesagens].sort((a, b) => 
                new Date(b.date).getTime() - new Date(a.date).getTime()
            );
            prevPeso = sorted[0]?.peso ?? null;
        }
        
        if (!prevPeso) return null;
        return peso - prevPeso;
    }, [type, currentRows, currentPage, pages, user.pesagens]);

    const tabs: { id: Tab; label: string; icon: string; count?: number }[] = useMemo(() => [
        { id: 'pesagens', label: 'Pesagens', icon: 'fa-weight-scale', count: user.pesagens.length },
        { id: 'perimetros', label: 'Perímetros', icon: 'fa-ruler-combined', count: user.perimetros.length },
        { id: 'avaliacoes', label: 'Avaliações', icon: 'fa-dumbbell', count: user.avaliacoes.length }
    ], [user.pesagens.length, user.perimetros.length, user.avaliacoes.length]);

    const typeLabel = TYPE_LABELS[type];
    const remainingSpace = MAX_ROWS_PER_PAGE - currentRows.length;
    const canAddFive = remainingSpace >= 5;
    const countToAdd = Math.min(5, remainingSpace);

    return (
        <div className="w-full">
            <UserHeader
                user={user}
                onUpdate={fetchUser}
                hidePaymentButtons={true}
                customIcon="fa-layer-plus"
                customTitle={`BULK MODE (${typeLabel.toUpperCase()})`}
                customDescription={getDescription(type)}
                backUrl={`/admin/dashboard/users/${user.id}`}
                backLabel="VOLTAR PERFIL CLIENTE"
            />

            {/* Tab Bar */}
            <div className="flex gap-2 mb-4 overflow-x-auto pb-2 scrollbar-none">
                {tabs.map(tab => {
                    const isTabActive = tab.id === type;
                    const existingCount = tab.count || 0;
                    const totalCount = isTabActive ? existingCount + newRecordsCount : existingCount;

                    return (
                        <NewButton
                            key={tab.id}
                            variant={isTabActive ? "new_primary_rounded" : "new_primary_no_bg_rounded"}
                            onClick={() => {
                                if (!isTabActive) {
                                    router.push(`/admin/dashboard/users/bulk/${tab.id}/${user.id}`);
                                }
                            }}
                            icon={<i className={`fa-duotone ${tab.icon}`}></i>}
                            className={`h-11 ${!isTabActive ? 'bg-white border-gray-200 hover:border-orange-400 hover:!bg-white hover:!text-gray-900' : ''}`}
                        >
                            <span className="mr-2">{tab.label}</span>
                            {isTabActive && newRecordsCount > 0 ? (
                                <span className="ml-1 px-2 py-0.5 rounded-full text-xs bg-white/20">
                                    {existingCount} + {newRecordsCount} = {totalCount}
                                </span>
                            ) : (
                                <span className={`ml-1 px-2 py-0.5 rounded-full text-xs ${isTabActive ? 'bg-white/20' : 'bg-gray-100 text-gray-600'}`}>
                                    {existingCount}
                                </span>
                            )}
                        </NewButton>
                    );
                })}
            </div>

            {/* Bulk Mode Info */}
            {newRecordsCount > 0 && (() => {
                const activeTab = tabs.find(t => t.id === type);
                const existingCount = activeTab?.count || 0;
                const label = TYPE_LABELS_PT[type];
                const recordLabel = newRecordsCount === 1 ? label.singular : label.plural;
                
                return (
                    <div className="mb-8 flex items-start gap-3 p-3 bg-blue-50 text-blue-800 rounded-lg border border-blue-100">
                        <i className="fa-duotone fa-layer-plus text-xl shrink-0 mt-0.5"></i>
                        <div className="flex-1">
                            <h5 className="text-xs font-bold uppercase tracking-wider mb-1">(BULK MODE)</h5>
                            <p className="text-xs leading-relaxed opacity-90">
                                Após adicionar <strong>{newRecordsCount}</strong> {recordLabel} que estão agora na coluna, o número total será <strong>{existingCount + newRecordsCount}</strong>.
                            </p>
                        </div>
                    </div>
                );
            })()}

            {/* Main Card */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 overflow-hidden">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                        <i className={`fa-duotone ${tabs.find(t => t.id === type)?.icon} text-primary`}></i>
                        {typeLabel} ({currentRows.length})
                    </h3>

                    <BulkPagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        currentRowsCount={currentRows.length}
                        onPrevPage={() => setCurrentPage(Math.max(0, currentPage - 1))}
                        onNextPage={() => setCurrentPage(Math.min(totalPages - 1, currentPage + 1))}
                        onNewPage={addNewPage}
                    />
                </div>

                <div className="custom-divider mb-6" />

                {/* Table */}
                <div className="w-full overflow-x-auto pb-4 custom-scrollbar">
                    <table className="w-full text-xs border-collapse table-auto">
                        <BulkTableHeader type={type} />
                        <tbody>
                            {currentRows.map((row, index) => (
                                <BulkTableRow
                                    key={row.id}
                                    row={row}
                                    index={index}
                                    type={type}
                                    evolution={getEvolution(index)}
                                    canDelete={currentRows.length > 1}
                                    onUpdate={updateRow}
                                    onDelete={removeRow}
                                />
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Footer */}
                <div className="mt-8 flex items-center justify-between">
                    <div className="flex gap-2">
                        <NewButton 
                            onClick={addRow} 
                            variant="new_primary_no_bg_rounded" 
                            className="font-medium" 
                            icon={<i className="fa-duotone fa-plus"></i>}
                            disabled={currentRows.length >= MAX_ROWS_PER_PAGE}
                        >
                            Linha
                        </NewButton>
                        <NewButton 
                            onClick={addFiveRows} 
                            variant="new_primary_no_bg_rounded" 
                            className="font-medium" 
                            icon={<i className="fa-duotone fa-layer-plus"></i>}
                            disabled={remainingSpace <= 0}
                        >
                            + {canAddFive ? 5 : countToAdd} Linhas {remainingSpace > 0 && `(${remainingSpace} restantes)`}
                        </NewButton>
                    </div>

                    <div className="flex items-center gap-4">
                        <Link href={`/admin/dashboard/users/${user.id}`}>
                            <NewButton variant="new_primary_no_bg_rounded" className="font-medium" icon={<i className="fa-duotone fa-xmark"></i>}>
                                Cancelar
                            </NewButton>
                        </Link>
                        <NewButton
                            onClick={handleSave}
                            disabled={isSubmitting}
                            variant="new_primary_rounded"
                            icon={isSubmitting ? <i className="fa-duotone fa-spinner-third animate-spin"></i> : <i className="fa-duotone fa-floppy-disk"></i>}
                            className="shadow-md shadow-primary/20 hover:shadow-primary/30 transition-all"
                        >
                            {isSubmitting ? 'A GUARDAR...' : `GUARDAR (${newRecordsCount}) REGISTOS`}
                        </NewButton>
                    </div>
                </div>
            </div>
        </div>
    );
}
