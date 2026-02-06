"use client";

import React, { memo } from "react";

interface SidebarToggleProps {
    isCollapsed: boolean;
    onToggle: () => void;
}

export const SidebarToggle = memo(function SidebarToggle({
    isCollapsed,
    onToggle
}: SidebarToggleProps) {
    return (
        <div className="mt-auto px-3 pb-2 hidden lg:block">
            <button
                onClick={onToggle}
                type="button"
                className="flex items-center justify-center w-full h-9 border border-gray-200 rounded-lg bg-white text-gray-500 hover:bg-primary/5 hover:text-primary hover:border-primary/30 transition-all cursor-pointer shadow-sm active:scale-95"
                aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
                <i
                    className={`fa-duotone ${isCollapsed ? "fa-chevrons-right" : "fa-chevrons-left"} text-sm`}
                    aria-hidden="true"
                />
            </button>
        </div>
    );
});
