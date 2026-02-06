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

    // Conditional styling - More compact
    const baseClassName = isCollapsed
        ? "justify-center mx-auto w-11 h-11 px-0"
        : "px-4 mx-2.5";

    const activeClassName = isActive
        ? "bg-gradient-to-r from-primary to-primary-hover text-white shadow-md shadow-primary/25"
        : "bg-transparent text-gray-700 hover:bg-primary/10 hover:text-primary";

    const className = `
        group relative flex items-center gap-3 rounded-lg 
        border-none text-sm font-semibold text-left cursor-pointer 
        transition-all duration-200 no-underline
        ${isCollapsed ? "py-0" : "py-2"}
        ${baseClassName}
        ${activeClassName}
    `;

    const Icon = (
        <i
            className={`${iconClass} text-lg transition-colors duration-200 
                ${isCollapsed ? "text-xl" : "w-5 text-center"} 
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
