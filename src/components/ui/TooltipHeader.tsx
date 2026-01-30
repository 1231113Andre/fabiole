import React from "react";

interface TooltipHeaderProps {
    label: React.ReactNode;
    description: string;
    isAuto?: boolean;
}

export function TooltipHeader({ label, description, isAuto = true }: TooltipHeaderProps) {
    return (
        <div className="flex items-center justify-center gap-1.5 relative group/tooltip whitespace-nowrap">
            {isAuto && <span className="shrink-0">🤖</span>}
            <span className="shrink-0">{label}</span>
            <i className="fa-duotone fa-circle-info text-violet-500/60 text-xs cursor-help hover:text-violet-600 transition-colors"></i>
            <div className="absolute left-1/2 top-full mt-2 -translate-x-1/2 w-max max-w-[200px] p-2.5 bg-gray-900/95 backdrop-blur-sm text-white text-xs rounded-xl shadow-2xl opacity-0 invisible group-hover/tooltip:opacity-100 group-hover/tooltip:visible transition-all duration-200 z-[60] pointer-events-none border border-white/10">
                <div className="absolute top-0 left-1/2 transform -translate-y-1/2 -translate-x-1/2 rotate-45 w-2 h-2 bg-gray-900/95 border-t border-l border-white/10"></div>
                <div className="relative whitespace-normal">
                    <div className="font-bold mb-1 flex items-center gap-1.5 text-violet-300 uppercase tracking-tighter text-xs">
                        <i className="fa-duotone fa-robot"></i>
                        {isAuto ? 'Auto-Cálculo' : 'Classificação'}
                    </div>
                    <p className="text-gray-300 leading-snug">{description}</p>
                </div>
            </div>
        </div>
    );
}
