"use client";

import React from 'react';

interface LoadingSpinnerProps {
    className?: string;
}

/**
 * Full-page loading state (e.g. dashboard F5).
 * Minimal, centered: spinner + label, no effects – classic loading page pattern.
 */
export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ className }) => {
    return (
        <div
            className={`fixed inset-0 flex flex-col items-center justify-center gap-4 bg-boxdark-2 z-50 ${className ?? ''}`}
            aria-live="polite"
            aria-busy="true"
        >
            <i
                className="fa-solid fa-spinner fa-spin text-4xl text-[var(--primary)]"
                aria-hidden
            />
            <span className="text-sm text-bodydark2">A carregar...</span>
        </div>
    );
}
