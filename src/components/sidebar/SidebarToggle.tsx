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
        <div className="mt-auto px-4 pb-3 hidden lg:block">
            <button
                onClick={onToggle}
                type="button"
                className="flex items-center justify-center w-full h-10 border border-gray-300 rounded-xl bg-gray-50 text-gray-500 hover:bg-gray-100 hover:text-gray-700 hover:border-gray-400 transition-all cursor-pointer"
                aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
                <i
                    className={`fa-duotone ${isCollapsed ? "fa-chevrons-right" : "fa-chevrons-left"}`}
                    aria-hidden="true"
                />
            </button>
        </div>
    );
});
