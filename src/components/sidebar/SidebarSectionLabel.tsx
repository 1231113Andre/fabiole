"use client";

import React, { memo } from "react";

interface SidebarSectionLabelProps {
    label: string;
    isCollapsed: boolean;
}

export const SidebarSectionLabel = memo(function SidebarSectionLabel({
    label,
    isCollapsed
}: SidebarSectionLabelProps) {
    if (isCollapsed) return null;

    return (
        <div className="px-4 mb-1 mt-1.5 text-[10px] font-bold uppercase tracking-widest text-gray-400">
            {label}
        </div>
    );
});
