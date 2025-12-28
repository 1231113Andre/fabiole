import React, { memo } from "react";
import { MAX_ROWS_PER_PAGE } from "./types";

interface BulkPaginationProps {
    currentPage: number;
    totalPages: number;
    currentRowsCount: number;
    onPrevPage: () => void;
    onNextPage: () => void;
    onNewPage: () => void;
}

export const BulkPagination = memo(function BulkPagination({
    currentPage,
    totalPages,
    currentRowsCount,
    onPrevPage,
    onNextPage,
    onNewPage
}: BulkPaginationProps) {
    return (
        <div className="flex items-center gap-2 bg-gray-50 p-1 rounded-xl border border-gray-200">
            <button
                onClick={onPrevPage}
                disabled={currentPage === 0}
                className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-primary disabled:opacity-20 transition-all font-bold"
            >
                <i className="fa-solid fa-chevron-left text-xs"></i>
            </button>
            <span className="text-[10px] font-black min-w-[3rem] text-center uppercase tracking-widest text-gray-500">
                {currentPage + 1} / {totalPages}
            </span>
            <button
                onClick={onNextPage}
                disabled={currentPage === totalPages - 1}
                className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-primary disabled:opacity-20 transition-all font-bold"
            >
                <i className="fa-solid fa-chevron-right text-xs"></i>
            </button>
            <div className="w-px h-4 bg-gray-200 mx-1"></div>
            <button
                onClick={onNewPage}
                disabled={currentRowsCount < MAX_ROWS_PER_PAGE}
                className="px-3 py-1.5 text-[10px] font-bold cursor-pointer text-primary hover:bg-primary/5 disabled:opacity-30 disabled:cursor-not-allowed rounded-lg uppercase tracking-wider"
            >
                Nova Página
            </button>
        </div>
    );
});

