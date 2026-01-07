import { useState, useCallback, useMemo } from "react";
import { BulkRow, BulkType, MAX_ROWS_PER_PAGE } from "./types";
import { createNewRow } from "./utils";
import {
    calculateBMI,
    classifyBMI,
    classifyBodyFat,
    calculateMM,
    calculateH2O,
    calculateAge,
    classifyMileResult,
    classifyPushUps
} from "@/lib/body-metrics";

export function useBulkState(type: BulkType, userGender: string, userBirthDate?: Date | string | null) {
    // Calculate user age from birth date for Watson H2O formula
    const userAge = userBirthDate ? calculateAge(userBirthDate) : null;
    const [pages, setPages] = useState<Record<number, BulkRow[]>>(() => {
        const today = new Date().toISOString().split('T')[0];
        return {
            0: [
                { id: crypto.randomUUID(), date: today },
                { id: crypto.randomUUID(), date: today },
                { id: crypto.randomUUID(), date: today }
            ]
        };
    });
    const [currentPage, setCurrentPage] = useState(0);

    const currentRows = pages[currentPage] || [];
    const totalPages = Object.keys(pages).length;

    const calculateAutoFields = useCallback((row: BulkRow, field: string, value: string): BulkRow => {
        const newRow = { ...row, [field]: value };

        // Check overrides
        const isMmOverride = row.overrides?.mm;
        const isH2oOverride = row.overrides?.h2o;
        const isImcOverride = row.overrides?.imc;
        const isImcResultOverride = row.overrides?.resultadoIMC;
        const isPerOverride = row.overrides?.resultadoPercentMG;

        if (type === 'pesagens') {
            const peso = parseFloat(newRow.peso) || 0;
            const height = parseFloat(newRow.height) || 0;

            if ((field === 'peso' || field === 'height') && !isImcOverride) {
                const bmi = calculateBMI(peso, height);
                if (bmi) {
                    newRow.imc = bmi.toFixed(1);
                    if (!isImcResultOverride) {
                        newRow.resultadoIMC = classifyBMI(bmi);
                    }
                } else {
                    newRow.imc = '';
                    if (!isImcResultOverride) {
                        newRow.resultadoIMC = '';
                    }
                }
            }

            // Calculate MM (LBM) - only needs peso and %MG
            if ((field === 'peso' || field === 'percentualMG') && !isMmOverride) {
                const mg = parseFloat(newRow.percentualMG) || null;
                const mmValue = calculateMM(peso > 0 ? peso : null, mg);
                newRow.mm = mmValue ? mmValue.toFixed(2) : '';
            }

            // Calculate H2O using Watson formula - needs peso, height, age, gender
            if ((field === 'peso' || field === 'height') && !isH2oOverride) {
                const h2oValue = calculateH2O(peso > 0 ? peso : null, height > 0 ? height : null, userAge, userGender);
                newRow.h2o = h2oValue ? h2oValue.toFixed(2) : '';
            }

            if (field === 'percentualMG' && !isPerOverride) {
                const mg = parseFloat(newRow.percentualMG) || null;
                newRow.resultadoPercentMG = classifyBodyFat(mg, userGender);
            }
        }

        if (type === 'avaliacoes') {
            if (field === 'mile') {
                if (value.includes(':') && userAge && userGender) {
                    newRow.mileResult = classifyMileResult(value, userAge, userGender);
                } else {
                    newRow.mileResult = '';
                }
            }

            if (field === 'pushUps') {
                const count = parseInt(value);
                if (!isNaN(count) && userAge && userGender) {
                    newRow.pushUpsResult = classifyPushUps(count, userAge, userGender);
                } else {
                    newRow.pushUpsResult = '';
                }
            }
        }

        return newRow;
    }, [type, userGender, userAge]);

    const addRow = useCallback(() => {
        setPages(prev => {
            const rows = prev[currentPage] || [];
            if (rows.length >= MAX_ROWS_PER_PAGE) return prev;
            return { ...prev, [currentPage]: [...rows, createNewRow()] };
        });
    }, [currentPage]);

    const addFiveRows = useCallback(() => {
        setPages(prev => {
            const rows = prev[currentPage] || [];
            const remainingSpace = MAX_ROWS_PER_PAGE - rows.length;
            if (remainingSpace <= 0) return prev;
            const countToAdd = Math.min(5, remainingSpace);
            const newRows = Array(countToAdd).fill(null).map(() => createNewRow());
            return { ...prev, [currentPage]: [...rows, ...newRows] };
        });
    }, [currentPage]);

    const removeRow = useCallback((id: string) => {
        setPages(prev => {
            const rows = prev[currentPage] || [];
            if (rows.length <= 1) return prev;
            return { ...prev, [currentPage]: rows.filter(r => r.id !== id) };
        });
    }, [currentPage]);

    const updateRow = useCallback((id: string, field: string, value: string) => {
        setPages(prev => {
            const rows = prev[currentPage] || [];
            const row = rows.find(r => r.id === id);
            if (!row) return prev;
            const updatedRow = calculateAutoFields(row, field, value);
            return { ...prev, [currentPage]: rows.map(r => r.id === id ? updatedRow : r) };
        });
    }, [currentPage, calculateAutoFields]);

    const toggleOverride = useCallback((id: string, field: string) => {
        setPages(prev => {
            const rows = prev[currentPage] || [];
            const row = rows.find(r => r.id === id);
            if (!row) return prev;

            const currentOverrides = row.overrides || {};
            const isCurrentlyOverridden = !!currentOverrides[field];
            const newOverrides = { ...currentOverrides, [field]: !isCurrentlyOverridden };

            // If switching back to auto (!isCurrentlyOverridden means we are now overriding, so we only recalc if we are disabling override)
            // Wait, logic: toggling. If it WAS overridden, now it's NOT. So we should recalc.
            // If it WAS NOT overridden, now it IS. We don't recalc, just allow editing.

            let updatedRow: BulkRow = { ...row, overrides: newOverrides };

            if (isCurrentlyOverridden) {
                // Switching from Manual -> Auto. Trigger Recalc.
                // We trigger recalc by "updating" a dependency field with its current value.
                // Or simply re-run calculateAutoFields logic for this specific field?
                // Re-running calculateAutoFields is safer.
                // Actually, we can just call calculateAutoFields with a dummy update that triggers all checks, 
                // but calculateAutoFields is optimized to only check relevant fields for a change.
                // Let's just manually re-run the specific logic or trick it.
                // Simpler: iterate input fields relevant to this auto field and "re-apply" them?
                // Or: just call a full recalc helper.

                // Let's do a trick: we want to restore auto value.
                // We can construct a dummy row without the override and run calc.
                const rowForCalc = { ...updatedRow };
                // Ensure override is false in the row passed to calc so it proceeds
                rowForCalc.overrides = { ...newOverrides, [field]: false };

                // We need to trigger calc based on inputs.
                if (field === 'imc' || field === 'resultadoIMC') {
                    updatedRow = calculateAutoFields(rowForCalc, 'peso', row.peso);
                } else if (field === 'mm') {
                    updatedRow = calculateAutoFields(rowForCalc, 'peso', row.peso);
                } else if (field === 'h2o') {
                    updatedRow = calculateAutoFields(rowForCalc, 'peso', row.peso);
                } else if (field === 'resultadoPercentMG') {
                    updatedRow = calculateAutoFields(rowForCalc, 'percentualMG', row.percentualMG);
                }

                // Restore the overrides object (which should have [field]: false)
                updatedRow.overrides = newOverrides;
            }

            return { ...prev, [currentPage]: rows.map(r => r.id === id ? updatedRow : r) };
        });
    }, [currentPage, calculateAutoFields]);

    const addNewPage = useCallback(() => {
        setPages(prev => {
            const rows = prev[currentPage] || [];
            if (rows.length < MAX_ROWS_PER_PAGE) return prev;
            const newPageIndex = Object.keys(prev).length;
            return {
                ...prev,
                [newPageIndex]: [createNewRow()]
            };
        });
        setCurrentPage(prev => prev + 1);
    }, [currentPage]);

    const getAllRows = useCallback(() => {
        return Object.values(pages).flat();
    }, [pages]);

    const newRecordsCount = useMemo(() => {
        return Object.values(pages).flat().length;
    }, [pages]);

    return {
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
        newRecordsCount,
        toggleOverride
    };
}

