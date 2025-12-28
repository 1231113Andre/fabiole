import { useState, useCallback, useMemo } from "react";
import { BulkRow, BulkType, MAX_ROWS_PER_PAGE } from "./types";
import { createNewRow } from "./utils";
import {
    calculateBMI,
    classifyBMI,
    classifyBodyFat,
    calculateMM,
    calculateH2O
} from "@/lib/utils/bodyMetrics";

export function useBulkState(type: BulkType, userGender: string) {
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

        if (type === 'pesagens') {
            const peso = parseFloat(newRow.peso) || 0;
            const height = parseFloat(newRow.height) || 0;

            if (field === 'peso' || field === 'height') {
                const bmi = calculateBMI(peso, height);
                if (bmi) {
                    newRow.imc = bmi.toFixed(1);
                    newRow.resultadoIMC = classifyBMI(bmi);
                } else {
                    newRow.imc = '';
                    newRow.resultadoIMC = '';
                }
            }

            if (field === 'peso' || field === 'percentualMG' || field === 'massaOssea') {
                const mg = parseFloat(newRow.percentualMG) || null;
                const mo = parseFloat(newRow.massaOssea) || null;
                const mmValue = calculateMM(peso > 0 ? peso : null, mg, mo);
                newRow.mm = mmValue ? mmValue.toFixed(2) : '';
            }

            if (field === 'peso') {
                const h2oValue = calculateH2O(peso > 0 ? peso : null, userGender);
                newRow.h2o = h2oValue ? h2oValue.toFixed(2) : '';
            }

            if (field === 'percentualMG') {
                const mg = parseFloat(newRow.percentualMG) || null;
                newRow.resultadoPercentMG = classifyBodyFat(mg, userGender);
            }
        }

        return newRow;
    }, [type, userGender]);

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
        newRecordsCount
    };
}

