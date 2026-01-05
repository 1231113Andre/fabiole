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
// CONSTANTS
// ============================================
const SIDEBAR_WIDTH_EXPANDED = "290px";
const SIDEBAR_WIDTH_COLLAPSED = "90px";

// ============================================
// MAIN COMPONENT
// ============================================
export const DashboardSidebar = memo<DashboardSidebarProps>(({
    isOpen,
    onClose,
    activeTab,
    menuItems,
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
        if (typeof window !== "undefined" && window.innerWidth < 1024) {
            onClose();
        }
    }, [onClose]);

    // Memoize menu items rendering to prevent unnecessary re-renders
    const menuItemsElements = useMemo(() => {
        return menuItems.map((item) => (
            <React.Fragment key={item.id}>
                {item.dividerLabel && (
                    isCollapsed ? (
                        <div className="mx-5 my-2 border-t border-gray-300" />
                    ) : (
                        <div className="flex items-center gap-3 my-1 px-3">
                            <div className="h-px bg-gray-300 flex-1" />
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest whitespace-nowrap">
                                {item.dividerLabel}
                            </span>
                            <div className="h-px bg-gray-300 flex-1" />
                        </div>
                    )
                )}
                <SidebarMenuItem
                    item={item}
                    isActive={activeTab === item.id}
                    isCollapsed={isCollapsed}
                    onNavigate={handleNavigate}
                />
            </React.Fragment>
        ));
    }, [menuItems, activeTab, isCollapsed, handleNavigate]);

    // Render
    return (
        <>
            {/* Mobile Overlay */}
            <div
                className={`fixed inset-0 bg-black/40 backdrop-blur-sm z-[998] transition-all duration-300 lg:hidden ${isOpen ? "opacity-100 visible" : "opacity-0 invisible pointer-events-none"
                    }`}
                onClick={onClose}
                aria-hidden="true"
            />


            {/* Sidebar Container */}
            <aside
                className={`
                    fixed top-0 left-0 h-screen z-[999] flex flex-col 
                    transition-all duration-300 ease-[cubic-bezier(0.25,0.8,0.25,1)] 
                    overflow-y-auto overflow-x-hidden
                    bg-white border-r border-gray-200 shadow-xl shadow-gray-200/50
                    ${isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
                    ${isCollapsed ? "w-[90px]" : "w-[290px]"}
                `}
            >
                {/* Brand */}
                <SidebarBrand
                    isCollapsed={isCollapsed}
                    brandLogo={brandLogo}
                    brandName={brandName}
                />

                {/* Navigation Scroll Area */}
                <nav className="py-2 flex-1 flex flex-col gap-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-200">
                    <SidebarSectionLabel label="Menu" isCollapsed={isCollapsed} />

                    {menuItemsElements}

                    {/* Back Link Group */}
                    {isCollapsed ? (
                        <div className="mx-5 my-2 border-t border-gray-300" />
                    ) : (
                        <div className="flex items-center gap-3 my-1 px-3">
                            <div className="h-px bg-gray-300 flex-1" />
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest whitespace-nowrap">
                                Navegação
                            </span>
                            <div className="h-px bg-gray-300 flex-1" />
                        </div>
                    )}

                    <Link
                        href={backLink}
                        onClick={handleNavigate}
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

                </nav>

                <div className="flex flex-col">
                    {/* Beta Notice (Only when expanded) */}
                    {!isCollapsed && (
                        <div className="mx-3 mb-2 p-2.5 rounded-xl bg-gradient-to-br from-violet-500/10 via-purple-500/10 to-fuchsia-500/10 border border-violet-200/50 backdrop-blur-sm">
                            <div className="flex items-center gap-2">
                                <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-md shadow-violet-500/25">
                                    <i className="fa-duotone fa-flask-vial text-white text-[10px]" aria-hidden="true" />
                                </div>
                                <div className="flex-1">
                                    <p className="text-xs font-bold text-violet-700 uppercase tracking-wide leading-none">Beta</p>
                                    <p className="text-[12px] font-semibold text-violet-600/90 leading-tight font-medium mt-0.5">
                                        v{process.env.NEXT_PUBLIC_VERSION || "0.1.0"}
                                        <span className="text-violet-400 mx-1">•</span>
                                        <span className="font-mono">{process.env.NEXT_PUBLIC_COMMIT_ID || "dev"}</span>
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
