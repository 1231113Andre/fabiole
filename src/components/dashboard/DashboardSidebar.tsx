"use client";

import React, { useCallback, useMemo, memo } from "react";
import Link from "next/link";

// Child Components
import { SidebarBrand } from "@/components/sidebar/SidebarBrand";
import { SidebarMenuItem, MenuItem } from "@/components/sidebar/SidebarMenuItem";
import { SidebarSectionLabel } from "@/components/sidebar/SidebarSectionLabel";
import { SidebarToggle } from "@/components/sidebar/SidebarToggle";
import { SidebarFooter } from "@/components/sidebar/SidebarFooter";

// ============================================
// TYPES
// ============================================
interface DashboardSidebarProps {
    isOpen: boolean;
    onClose: () => void;
    activeTab: string;
    onTabChange?: (tab: string) => void;
    menuItems: MenuItem[];
    /** Called when user hovers a sidebar link (e.g. to prefetch data) */
    onLinkHover?: () => void;
    brandName?: string;
    brandIcon?: string;
    brandLogo?: string;
    userName?: string;
    userSurname?: string;
    avatarUrl?: string | null;
    backLink?: string;
    backLabel?: string;
    isCollapsed: boolean;
    onToggle: () => void;
    footerTitle?: string;
}

// ============================================
// CONSTANTS - More compact widths
// ============================================
const SIDEBAR_WIDTH_EXPANDED = "260px";
const SIDEBAR_WIDTH_COLLAPSED = "72px";

// ============================================
// MAIN COMPONENT
// ============================================
export const DashboardSidebar = memo<DashboardSidebarProps>(({
    isOpen,
    onClose,
    activeTab,
    menuItems,
    onLinkHover,
    brandName = "Dashboard",
    brandLogo,
    userName,
    userSurname,
    avatarUrl,
    backLink = "/",
    backLabel = "Voltar ao Overview",
    isCollapsed,
    onToggle,
    footerTitle
}) => {

    const handleNavigate = useCallback(() => {
        if (typeof window !== "undefined" && window.innerWidth < 768) {
            onClose();
        }
    }, [onClose]);

    // Memoize menu items rendering to prevent unnecessary re-renders
    const menuItemsElements = useMemo(() => {
        return menuItems.map((item) => (
            <React.Fragment key={item.id}>
                {item.dividerLabel && (
                    isCollapsed ? (
                        <div className="mx-4 my-1.5 border-t border-gray-200" />
                    ) : (
                        <div className="flex items-center gap-2 my-1 px-3">
                            <div className="h-px bg-gray-200 flex-1" />
                            <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest whitespace-nowrap">
                                {item.dividerLabel}
                            </span>
                            <div className="h-px bg-gray-200 flex-1" />
                        </div>
                    )
                )}
                <SidebarMenuItem
                    item={item}
                    isActive={activeTab === item.id}
                    isCollapsed={isCollapsed}
                    onNavigate={handleNavigate}
                    onLinkHover={onLinkHover}
                />
            </React.Fragment>
        ));
    }, [menuItems, activeTab, isCollapsed, handleNavigate, onLinkHover]);

    // Render
    return (
        <>
            {/* Mobile Overlay */}
            <div
                className={`fixed inset-0 bg-black/40 backdrop-blur-sm z-[998] transition-all duration-300 md:hidden ${isOpen ? "opacity-100 visible" : "opacity-0 invisible pointer-events-none"
                    }`}
                onClick={onClose}
                aria-hidden="true"
            />


            {/* Sidebar Container - More compact */}
            <aside
                className={`
                    fixed md:sticky top-0 left-0 h-screen z-[999] md:z-auto flex flex-col 
                    transition-transform duration-300 ease-in-out 
                    overflow-y-auto overflow-x-hidden
                    bg-white/95 backdrop-blur-md border-r border-gray-100 shadow-lg md:shadow-none
                    ${isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
                    ${isCollapsed ? "md:w-[72px]" : "md:w-[260px]"}
                    w-[260px]
                `}
            >
                {/* Brand */}
                <SidebarBrand
                    isCollapsed={isCollapsed}
                    brandLogo={brandLogo}
                    brandName={brandName}
                />

                {/* Navigation Scroll Area - More compact padding */}
                <nav className="py-1.5 flex-1 flex flex-col gap-0.5 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-200">
                    <SidebarSectionLabel label="Menu" isCollapsed={isCollapsed} />

                    {menuItemsElements}

                    {/* Back Link Group */}
                    {isCollapsed ? (
                        <div className="mx-4 my-1.5 border-t border-gray-200" />
                    ) : (
                        <div className="flex items-center gap-2 my-1 px-3">
                            <div className="h-px bg-gray-200 flex-1" />
                            <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest whitespace-nowrap">
                                Navegação
                            </span>
                            <div className="h-px bg-gray-200 flex-1" />
                        </div>
                    )}

                    <Link
                        href={backLink}
                        onClick={handleNavigate}
                        className={`
                            group flex items-center gap-3 px-4 py-2 mx-2.5 rounded-lg 
                            border-none text-sm font-semibold text-left cursor-pointer 
                            transition-all duration-200 
                            bg-transparent text-gray-700 hover:bg-primary/10 hover:text-primary 
                            no-underline
                            ${isCollapsed ? "justify-center px-2.5 mx-2" : ""}
                        `}
                        title={isCollapsed ? backLabel : ""}
                    >
                        <i
                            className={`fa-duotone fa-house text-lg transition-colors duration-200 
                                ${isCollapsed ? "text-xl" : "w-5 text-center"} 
                                text-gray-500 group-hover:text-primary`}
                            aria-hidden="true"
                        />
                        {!isCollapsed && <span className="flex-1">{backLabel}</span>}
                    </Link>

                </nav>

                <div className="flex flex-col">
                    {/* Beta Notice (Only when expanded) - More compact */}
                    {!isCollapsed && (
                        <div className="mx-2.5 mb-2 p-2 rounded-lg bg-gradient-to-br from-primary/10 via-primary/5 to-primary/10 border border-primary/20 backdrop-blur-sm">
                            <div className="flex items-center gap-2">
                                <div className="w-6 h-6 rounded-md bg-gradient-to-br from-primary to-primary-hover flex items-center justify-center shadow-md shadow-primary/25">
                                    <i className="fa-duotone fa-flask-vial text-white text-[9px]" aria-hidden="true" />
                                </div>
                                <div className="flex-1">
                                    <p className="text-[10px] font-bold text-primary uppercase tracking-wide leading-none">Beta</p>
                                    <p className="text-[11px] font-semibold text-primary/80 leading-tight font-medium mt-0.5">
                                        v{process.env.NEXT_PUBLIC_VERSION || "0.1.0"}
                                        <span className="text-primary/40 mx-1">•</span>
                                        <span className="font-mono text-[10px]">{process.env.NEXT_PUBLIC_COMMIT_ID || "dev"}</span>
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Toggle Button */}
                    <SidebarToggle isCollapsed={isCollapsed} onToggle={onToggle} />
                </div>

                {/* Footer */}
                <SidebarFooter
                    isCollapsed={isCollapsed}
                    userName={userName}
                    userSurname={userSurname}
                    avatarUrl={avatarUrl}
                    footerTitle={footerTitle}
                />
            </aside >
        </>
    );
});

DashboardSidebar.displayName = 'DashboardSidebar';

export default DashboardSidebar;
