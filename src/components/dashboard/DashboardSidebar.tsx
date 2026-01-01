"use client";

import React, { useState, useEffect, useCallback, memo } from "react";
import Link from "next/link";
import Image from "next/image";

// ============================================
// TYPES
import { ASSETS } from "@/lib/constants/assets";

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
    onTabChange?: (tab: string) => void; // Optional - not used with Link prefetch
    menuItems: MenuItem[];
    brandName?: string;
    brandIcon?: string;
    brandLogo?: string;
    userName?: string;
    userSurname?: string;
    backLink?: string;
    backLabel?: string;
}

// ============================================
// CONSTANTS
// ============================================
const SIDEBAR_WIDTH_EXPANDED = "290px";
const SIDEBAR_WIDTH_COLLAPSED = "90px";

const BrandSection = memo(function BrandSection({
    isCollapsed
}: {
    brandIcon?: string;
    brandLogo?: string;
    brandName?: string;
    isCollapsed: boolean;
}) {
    return (
        <Link
            href="/"
            className={`flex items-center px-6 py-2 border-b border-gray-100 no-underline transition-all duration-300 hover:bg-gray-50 group ${isCollapsed ? "justify-center" : ""}`}
        >
            {/* Logo Anchor */}
            <div className={`relative flex h-14 w-14 flex-shrink-0 items-center justify-center transition-transform duration-300 group-hover:scale-105`}>
                <Image
                    src={ASSETS.logo}
                    alt="Fábio Lé Logo"
                    width={600}
                    height={600}
                    quality={100}
                    priority
                    className="absolute left-1/2 top-[65%] h-32 w-32 -translate-x-1/2 -translate-y-1/2 object-contain drop-shadow-md max-w-none"
                />
            </div>

            {/* Text */}
            {!isCollapsed && (
                <div className="flex flex-col justify-center ml-4 -mt-1 transition-transform duration-300 group-hover:translate-x-1">
                    <span className="font-montserrat text-lg font-bold leading-none tracking-wide text-gray-900 whitespace-nowrap">
                        FÁBIO LÉ
                    </span>
                    <span className="font-montserrat text-[10px] font-bold leading-none tracking-[0.35em] text-primary mt-1 whitespace-nowrap">
                        PERSONAL TRAINER
                    </span>
                </div>
            )}
        </Link>
    );
});

/** Single menu item - uses Link with prefetch for fast navigation */
const MenuItemLink = memo(function MenuItemLink({
    item,
    isActive,
    isCollapsed,
    onNavigate,
}: {
    item: MenuItem;
    isActive: boolean;
    isCollapsed: boolean;
    onNavigate?: () => void;
}) {
    const iconClass = item.icon.includes("fa-duotone")
        ? item.icon
        : `fa-duotone ${item.icon.replace("fas ", "").replace("fa-", "fa-")}`;

    const className = `
        group relative flex items-center gap-3.5 px-5 py-3 mx-3 rounded-xl 
        border-none text-[15px] font-semibold text-left cursor-pointer 
        transition-all duration-200 no-underline
        ${isActive
            ? "bg-primary text-white shadow-lg shadow-primary/25"
            : "bg-transparent text-gray-700 hover:bg-gray-100 hover:text-gray-900"
        }
        ${isCollapsed ? "justify-center px-3 mx-2" : ""}
    `;

    const content = (
        <>
            <i
                className={`${iconClass} text-xl transition-colors duration-200 
                    ${isCollapsed ? "text-2xl" : "w-6 text-center"} 
                    ${isActive ? "text-white" : "text-gray-500 group-hover:text-primary"}`}
                aria-hidden="true"
            />
            {!isCollapsed && <span className="flex-1">{item.label}</span>}
        </>
    );

    // Use Link with prefetch for href items (prefetches on hover/viewport)
    if (item.href) {
        return (
            <Link
                href={item.href}
                prefetch={true}
                className={className}
                title={isCollapsed ? item.label : ""}
                onClick={onNavigate}
            >
                {content}
            </Link>
        );
    }

    // Fallback to button for onClick items
    return (
        <button
            onClick={() => {
                item.onClick?.();
                onNavigate?.();
            }}
            className={className}
            title={isCollapsed ? item.label : ""}
        >
            {content}
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
        <div className="px-6 mb-3 text-[11px] font-bold uppercase tracking-widest text-gray-500">
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
                className="flex items-center justify-center w-full h-10 border border-gray-300 rounded-xl bg-gray-50 text-gray-500 hover:bg-gray-100 hover:text-gray-700 hover:border-gray-400 transition-all cursor-pointer"
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
    brandLogo,
    userName,
    userSurname,
    backLink = "/",
    backLabel = "Voltar ao Overview"
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

    // Close mobile menu on navigation
    const handleNavigate = useCallback(() => {
        if (typeof window !== "undefined" && window.innerWidth < 1024) {
            onClose();
        }
    }, [onClose]);

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
                    bg-white border-r border-gray-200 shadow-xl shadow-gray-200/50
                    ${isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
                    ${isCollapsed ? "w-[90px]" : "w-[290px]"}
                `}
            >
                {/* Brand */}
                <BrandSection
                    brandIcon={brandIcon}
                    brandLogo={brandLogo}
                    brandName={brandName}
                    isCollapsed={isCollapsed}
                />

                {/* Navigation */}
                <nav className="py-6 flex-1 flex flex-col gap-1">
                    <SectionLabel label="Menu" isCollapsed={isCollapsed} />

                    {menuItems.map((item) => (
                        <MenuItemLink
                            key={item.id}
                            item={item}
                            isActive={activeTab === item.id}
                            isCollapsed={isCollapsed}
                            onNavigate={handleNavigate}
                        />
                    ))}

                    {/* Divider */}
                    <div className="h-px bg-gray-100 mx-6 my-4" />

                    {/* Settings Section */}
                    <SectionLabel label="Configurações" isCollapsed={isCollapsed} />

                    {/* Back to Site Link */}
                    <Link
                        href={backLink}
                        className={`
                            group flex items-center gap-3.5 px-5 py-3 mx-3 rounded-xl 
                            border-none text-[15px] font-semibold text-left cursor-pointer 
                            transition-all duration-200 
                            bg-transparent text-gray-700 hover:bg-primary/10 hover:text-primary 
                            no-underline
                            ${isCollapsed ? "justify-center px-3 mx-2" : ""}
                        `}
                        title={isCollapsed ? backLabel : ""}
                    >
                        <i
                            className={`fa-duotone fa-house text-xl transition-colors duration-200 
                                ${isCollapsed ? "text-2xl" : "w-6 text-center"} 
                                text-gray-500 group-hover:text-primary`}
                            aria-hidden="true"
                        />
                        {!isCollapsed && <span className="flex-1">{backLabel}</span>}
                    </Link>

                    {/* Beta Notice with Version */}
                    {!isCollapsed && (
                        <div className="mx-3 mt-4 p-2.5 rounded-xl bg-gradient-to-br from-violet-500/10 via-purple-500/10 to-fuchsia-500/10 border border-violet-200/50 backdrop-blur-sm">
                            <div className="flex items-center gap-2">
                                <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-md shadow-violet-500/25">
                                    <i className="fa-duotone fa-flask-vial text-white text-[10px]" aria-hidden="true" />
                                </div>
                                <div className="flex-1">
                                    <p className="text-[10px] font-bold text-violet-700 uppercase tracking-wide leading-none">Beta</p>
                                    <p className="text-[9px] text-violet-600/90 leading-tight font-medium mt-0.5">
                                        v{process.env.NEXT_PUBLIC_VERSION || "0.1.0"}
                                        <span className="text-violet-400 mx-1">•</span>
                                        <span className="font-mono">{process.env.NEXT_PUBLIC_COMMIT_ID || "dev"}</span>
                                    </p>
                                </div>
                            </div>
                            <div className="mt-2 pt-2 border-t border-violet-200/30">
                                <p className="text-[9px] text-violet-600/70">
                                    <i className="fa-duotone fa-envelope text-violet-500 mr-1" aria-hidden="true" />
                                    <a href="mailto:kamszotlol@proton.me" className="font-bold text-violet-700 hover:text-violet-800">kamszotlol@proton.me</a>
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Collapse Toggle */}
                    <CollapseToggle isCollapsed={isCollapsed} onToggle={toggleCollapse} />
                </nav>

                {/* Footer - User Panel */}
                {!isCollapsed && (
                    <div className="p-5 border-t border-gray-100">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-primary-hover flex items-center justify-center shadow-lg shadow-primary/25">
                                <i className="fa-duotone fa-user-shield text-white text-xl" aria-hidden="true" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-bold text-gray-900 uppercase tracking-wide">User Panel</p>
                                <p className="text-xs text-gray-500 truncate" title={userName && userSurname ? `${userName} ${userSurname}` : 'Not logged in'}>
                                    {userName && userSurname ? `${userName} ${userSurname}` : 'Not logged in'}
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </aside>
        </>
    );
};

export default DashboardSidebar;
