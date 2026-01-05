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
        <div className="px-6 mb-1 mt-2 text-[11px] font-bold uppercase tracking-widest text-gray-500">
            {label}
        </div>
    );
});
