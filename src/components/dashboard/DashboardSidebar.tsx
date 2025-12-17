"use client";

import React, { useState, useEffect, useCallback, memo } from "react";
import Link from "next/link";

// ============================================
// TYPES
// ============================================
interface MenuItem {
    id: string;
    label: string;
    icon: string;
    href?: string;
    onClick?: () => void;
}

interface DashboardSidebarProps {
    isOpen: boolean;
    onClose: () => void;
    activeTab: string;
    onTabChange: (tab: string) => void;
    menuItems: MenuItem[];
    brandName?: string;
    brandIcon?: string;
}

// ============================================
// CONSTANTS
// ============================================
const SIDEBAR_WIDTH_EXPANDED = "290px";
const SIDEBAR_WIDTH_COLLAPSED = "90px";

// ============================================
// COMPONENTS
// ============================================

/** Brand logo section */
const BrandSection = memo(function BrandSection({
    brandIcon,
    brandName,
    isCollapsed
}: {
    brandIcon: string;
    brandName: string;
    isCollapsed: boolean;
}) {
    return (
        <div className={`flex items-center gap-3 px-6 py-6 border-b border-gray-100 ${isCollapsed ? "justify-center" : ""}`}>
            <div className="w-11 h-11 min-w-11 rounded-xl bg-gradient-to-br from-primary to-primary-hover flex items-center justify-center text-white text-lg shadow-lg shadow-primary/25">
                <i className={`fa-duotone ${brandIcon}`} aria-hidden="true" />
            </div>
            {!isCollapsed && (
                <span className="text-xl font-bold text-gray-900 tracking-tight">
                    {brandName}
                </span>
            )}
        </div>
    );
});

/** Single menu item button */
const MenuItemButton = memo(function MenuItemButton({
    item,
    isActive,
    isCollapsed,
    onClick,
}: {
    item: MenuItem;
    isActive: boolean;
    isCollapsed: boolean;
    onClick: () => void;
}) {
    const iconClass = item.icon.includes("fa-duotone")
        ? item.icon
        : `fa-duotone ${item.icon.replace("fas ", "").replace("fa-", "fa-")}`;

    return (
        <button
            onClick={onClick}
            className={`
                group relative flex items-center gap-3.5 px-5 py-3 mx-3 rounded-xl 
                border-none text-[15px] font-medium text-left cursor-pointer 
                transition-all duration-200
                ${isActive
                    ? "bg-primary text-white shadow-lg shadow-primary/25"
                    : "bg-transparent text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                }
                ${isCollapsed ? "justify-center px-3 mx-2" : ""}
            `}
            title={isCollapsed ? item.label : ""}
        >
            <i
                className={`${iconClass} text-xl transition-colors duration-200 
                    ${isCollapsed ? "text-2xl" : "w-6 text-center"} 
                    ${isActive ? "text-white" : "text-gray-400 group-hover:text-primary"}`}
                aria-hidden="true"
            />
            {!isCollapsed && <span className="flex-1">{item.label}</span>}
        </button>
    );
});

/** Section label for menu groups */
const SectionLabel = memo(function SectionLabel({
    label,
    isCollapsed
}: {
    label: string;
    isCollapsed: boolean;
}) {
    if (isCollapsed) return null;

    return (
        <div className="px-6 mb-3 text-[11px] font-semibold uppercase tracking-widest text-gray-400">
            {label}
        </div>
    );
});

/** Collapse toggle button */
const CollapseToggle = memo(function CollapseToggle({
    isCollapsed,
    onToggle
}: {
    isCollapsed: boolean;
    onToggle: () => void;
}) {
    return (
        <div className="mt-auto px-4 pb-6 hidden lg:block">
            <button
                onClick={onToggle}
                className="flex items-center justify-center w-full h-10 border border-gray-200 rounded-xl bg-gray-50 text-gray-400 hover:bg-gray-100 hover:text-gray-600 hover:border-gray-300 transition-all cursor-pointer"
            >
                <i className={`fa-duotone ${isCollapsed ? "fa-chevrons-right" : "fa-chevrons-left"}`} aria-hidden="true" />
            </button>
        </div>
    );
});

// ============================================
// MAIN COMPONENT
// ============================================
export const DashboardSidebar: React.FC<DashboardSidebarProps> = ({
    isOpen,
    onClose,
    activeTab,
    onTabChange,
    menuItems,
    brandName = "Dashboard",
    brandIcon = "fa-chart-line",
}) => {
    const [isCollapsed, setIsCollapsed] = useState(false);

    // Load collapsed state from localStorage
    useEffect(() => {
        const stored = localStorage.getItem("sidebar-collapsed");
        if (stored) setIsCollapsed(stored === "true");
    }, []);

    // Update CSS variable when collapsed state changes
    useEffect(() => {
        if (typeof window === "undefined") return;

        const width = isCollapsed ? SIDEBAR_WIDTH_COLLAPSED : SIDEBAR_WIDTH_EXPANDED;
        document.documentElement.style.setProperty("--sidebar-width", width);

        return () => {
            document.documentElement.style.removeProperty("--sidebar-width");
        };
    }, [isCollapsed]);

    const toggleCollapse = useCallback(() => {
        setIsCollapsed(prev => {
            const newState = !prev;
            localStorage.setItem("sidebar-collapsed", String(newState));
            return newState;
        });
    }, []);

    const handleMenuClick = useCallback((item: MenuItem) => {
        if (item.onClick) {
            item.onClick();
        } else {
            onTabChange(item.id);
        }
        // Close mobile menu
        if (typeof window !== "undefined" && window.innerWidth < 1024) {
            onClose();
        }
    }, [onTabChange, onClose]);

    return (
        <>
            {/* Mobile Overlay */}
            <div
                className={`fixed inset-0 bg-black/40 backdrop-blur-sm z-[998] transition-all duration-300 lg:hidden ${isOpen ? "opacity-100 visible" : "opacity-0 invisible pointer-events-none"
                    }`}
                onClick={onClose}
                aria-hidden="true"
            />

            {/* Sidebar */}
            <aside
                className={`
                    fixed top-0 left-0 h-screen z-[999] flex flex-col 
                    transition-all duration-300 ease-in-out 
                    overflow-y-auto overflow-x-hidden
                    bg-white border-r border-gray-100 shadow-xl shadow-gray-200/50
                    ${isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
                    ${isCollapsed ? "w-[90px]" : "w-[290px]"}
                `}
            >
                {/* Brand */}
                <BrandSection
                    brandIcon={brandIcon}
                    brandName={brandName}
                    isCollapsed={isCollapsed}
                />

                {/* Navigation */}
                <nav className="py-6 flex-1 flex flex-col gap-1">
                    <SectionLabel label="Menu" isCollapsed={isCollapsed} />

                    {menuItems.map((item) => (
                        <MenuItemButton
                            key={item.id}
                            item={item}
                            isActive={activeTab === item.id}
                            isCollapsed={isCollapsed}
                            onClick={() => handleMenuClick(item)}
                        />
                    ))}

                    {/* Divider */}
                    <div className="h-px bg-gray-100 mx-6 my-4" />

                    {/* Settings Section */}
                    <SectionLabel label="Configurações" isCollapsed={isCollapsed} />

                    {/* Back to Site Link */}
                    <Link
                        href="/"
                        className={`
                            group flex items-center gap-3.5 px-5 py-3 mx-3 rounded-xl 
                            border-none text-[15px] font-medium text-left cursor-pointer 
                            transition-all duration-200 
                            bg-transparent text-gray-600 hover:bg-primary/10 hover:text-primary 
                            no-underline
                            ${isCollapsed ? "justify-center px-3 mx-2" : ""}
                        `}
                        title={isCollapsed ? "Voltar ao Site" : ""}
                    >
                        <i
                            className={`fa-duotone fa-house text-xl transition-colors duration-200 
                                ${isCollapsed ? "text-2xl" : "w-6 text-center"} 
                                text-gray-400 group-hover:text-primary`}
                            aria-hidden="true"
                        />
                        {!isCollapsed && <span className="flex-1">Voltar ao Site</span>}
                    </Link>

                    {/* Collapse Toggle */}
                    <CollapseToggle isCollapsed={isCollapsed} onToggle={toggleCollapse} />
                </nav>

                {/* Footer */}
                {!isCollapsed && (
                    <div className="p-6 border-t border-gray-100">
                        <div className="flex items-center gap-3 text-gray-400 text-xs">
                            <i className="fa-duotone fa-shield-check text-primary" aria-hidden="true" />
                            <span>Área Segura</span>
                        </div>
                    </div>
                )}
            </aside>
        </>
    );
};

export default DashboardSidebar;
