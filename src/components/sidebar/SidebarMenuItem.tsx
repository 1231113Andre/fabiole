"use client";

import React, { memo } from "react";
import Link from "next/link";

export interface MenuItem {
    id: string;
    label: string;
    icon: string;
    href?: string;
    onClick?: () => void;
    // Optional divider label text (e.g., "Meu Corpo") - replaces boolean flag
    dividerLabel?: string;
}

interface SidebarMenuItemProps {
    item: MenuItem;
    isActive: boolean;
    isCollapsed: boolean;
    onNavigate?: () => void;
}

export const SidebarMenuItem = memo(function SidebarMenuItem({
    item,
    isActive,
    isCollapsed,
    onNavigate,
}: SidebarMenuItemProps) {
    // Process icon class (handle 'fas ' legacy format if present)
    const iconClass = item.icon.includes("fa-duotone")
        ? item.icon
        : `fa-duotone ${item.icon.replace("fas ", "").replace("fa-", "fa-")}`;

    // Conditional styling
    const baseClassName = isCollapsed
        ? "justify-center mx-auto w-12 h-12 px-0"
        : "px-5 mx-3";

    const activeClassName = isActive
        ? "bg-primary text-white shadow-lg shadow-primary/25"
        : "bg-transparent text-gray-700 hover:bg-gray-100 hover:text-gray-900";

    const className = `
        group relative flex items-center gap-3.5 rounded-xl 
        border-none text-[15px] font-semibold text-left cursor-pointer 
        transition-all duration-200 no-underline
        ${isCollapsed ? "py-0" : "py-2"}
        ${baseClassName}
        ${activeClassName}
    `;

    const Icon = (
        <i
            className={`${iconClass} text-xl transition-colors duration-200 
                ${isCollapsed ? "text-2xl" : "w-6 text-center"} 
                ${isActive ? "text-white" : "text-gray-500 group-hover:text-primary"}`}
            aria-hidden="true"
        />
    );

    const Label = !isCollapsed && <span className="flex-1">{item.label}</span>;

    // Render as Link
    if (item.href) {
        return (
            <Link
                href={item.href}
                prefetch={true}
                className={className}
                title={isCollapsed ? item.label : ""}
                onClick={onNavigate}
            >
                {Icon}
                {Label}
            </Link>
        );
    }

    // Render as Button
    return (
        <button
            onClick={() => {
                item.onClick?.();
                onNavigate?.();
            }}
            className={className}
            title={isCollapsed ? item.label : ""}
            type="button"
        >
            {Icon}
            {Label}
        </button>
    );
});
