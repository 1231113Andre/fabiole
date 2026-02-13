"use client";

import React, { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";

interface TooltipHeaderProps {
    label: React.ReactNode;
    description: string;
    isAuto?: boolean;
}

export function TooltipHeader({ label, description, isAuto = true }: TooltipHeaderProps) {
    const [visible, setVisible] = useState(false);
    const [coords, setCoords] = useState({ top: 0, left: 0 });
    const triggerRef = useRef<HTMLDivElement>(null);

    const updatePosition = () => {
        const el = triggerRef.current;
        if (!el) return;
        const rect = el.getBoundingClientRect();
        setCoords({
            top: rect.bottom + 8,
            left: rect.left + rect.width / 2,
        });
    };

    const handleMouseEnter = () => {
        updatePosition();
        setVisible(true);
    };

    const handleMouseLeave = () => {
        setVisible(false);
    };

    useEffect(() => {
        if (!visible || typeof window === "undefined") return;
        const onScrollOrResize = () => updatePosition();
        window.addEventListener("scroll", onScrollOrResize, true);
        window.addEventListener("resize", onScrollOrResize);
        return () => {
            window.removeEventListener("scroll", onScrollOrResize, true);
            window.removeEventListener("resize", onScrollOrResize);
        };
    }, [visible]);

    const tooltipContent = visible && typeof document !== "undefined" && (
        createPortal(
            <div
                className="fixed w-max max-w-[260px] p-2.5 bg-gray-900/95 backdrop-blur-sm text-white text-xs rounded-xl shadow-2xl border border-white/10 z-[9999] pointer-events-none"
                style={{
                    left: coords.left,
                    top: coords.top,
                    transform: "translate(-50%, 0)",
                }}
                role="tooltip"
            >
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 border-4 border-transparent border-b-gray-900/95" />
                <div className="relative whitespace-normal">
                    <div className="font-bold mb-1 flex items-center gap-1.5 text-violet-300 uppercase tracking-tighter text-xs">
                        <i className="fa-duotone fa-robot" />
                        {isAuto ? "Auto-Cálculo" : "Classificação"}
                    </div>
                    <p className="text-gray-300 leading-snug">{description}</p>
                </div>
            </div>,
            document.body
        )
    );

    return (
        <>
            <div
                ref={triggerRef}
                className="flex items-center justify-center gap-1.5 whitespace-nowrap"
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
            >
                {isAuto && <span className="shrink-0">🤖</span>}
                <span className="shrink-0">{label}</span>
                <i className="fa-duotone fa-circle-info text-violet-500/60 text-xs cursor-help hover:text-violet-600 transition-colors" />
            </div>
            {tooltipContent}
        </>
    );
}
