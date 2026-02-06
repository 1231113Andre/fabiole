"use client";

import React, { useState, useRef, useEffect, useLayoutEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Avatar } from "@/components/Avatar";

interface DashboardHeaderProps {
    onMenuClick: () => void;
    userName?: string;
    userSurname?: string;
    userEmail?: string;
    avatarUrl?: string | null;
    onRefresh?: () => void;
    isRefreshing?: boolean;
    cooldownProgress?: number; // 0-1, where 1 is full cooldown
    lastRefreshTime?: Date;
    onLogout?: () => void;
    isLoggingOut?: boolean;
    isCollapsed?: boolean; // Sidebar collapsed state for positioning
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({
    onMenuClick,
    userName = "User",
    userSurname = "",
    userEmail = "",
    avatarUrl = null,
    onRefresh,
    isRefreshing = false,
    cooldownProgress = 0,
    lastRefreshTime,
    onLogout,
    isLoggingOut = false,
    isCollapsed,
}) => {
    const router = useRouter();
    const [showDropdown, setShowDropdown] = useState(false);
    const [isDesktop, setIsDesktop] = useState(() => {
        if (typeof window !== 'undefined') {
            return window.innerWidth >= 1024;
        }
        return false;
    });
    const dropdownRef = useRef<HTMLDivElement>(null);
    const headerRef = useRef<HTMLElement>(null);
    const pathname = usePathname();
    const isAdminArea = pathname?.startsWith('/admin');

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target as Node)
            ) {
                setShowDropdown(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Track desktop/mobile breakpoint
    useEffect(() => {
        const checkDesktop = () => {
            setIsDesktop(window.innerWidth >= 1024);
        };

        window.addEventListener('resize', checkDesktop);
        return () => window.removeEventListener('resize', checkDesktop);
    }, []);

    // Set header left position based on sidebar state (desktop only)
    // Use useLayoutEffect to set position before paint to avoid flash
    useLayoutEffect(() => {
        if (!headerRef.current) return;

        const isCurrentlyDesktop = typeof window !== 'undefined' && window.innerWidth >= 1024;

        if (isCurrentlyDesktop) {
            if (isCollapsed !== undefined) {
                // Use prop value directly (both dashboards)
                const sidebarWidth = isCollapsed ? '72px' : '260px';
                headerRef.current.style.left = sidebarWidth;
            } else {
                // Use CSS variable as fallback
                const sidebarWidth = getComputedStyle(document.documentElement).getPropertyValue('--sidebar-width') || '260px';
                headerRef.current.style.left = sidebarWidth.trim() || '260px';
            }
        } else {
            // Mobile: always start from left edge
            headerRef.current.style.left = '0';
        }
    }, [isDesktop, isCollapsed]);

    return (
        <header
            ref={headerRef}
            className="fixed top-0 left-0 right-0 h-14 bg-white/95 backdrop-blur-md shadow-sm z-[998] flex items-center px-3 sm:px-4 md:px-6 transition-[left] duration-300 border-b border-gray-100"
        >
            <div className="flex items-center gap-2 sm:gap-3">
                {/* Mobile Menu Button - More compact */}
                <button
                    className="flex items-center justify-center w-9 h-9 border border-gray-200 bg-white rounded-lg text-gray-700 cursor-pointer transition-all duration-200 hover:bg-primary/5 hover:text-primary hover:border-primary/30 shadow-sm lg:hidden active:scale-95"
                    onClick={onMenuClick}
                    aria-label="Menu"
                >
                    <i className="fa-duotone fa-bars text-lg"></i>
                </button>
            </div>

            <div className="flex items-center gap-1.5 sm:gap-2 ml-auto">
                {/* Refresh Button with Info Tooltip - More compact */}
                {onRefresh && (
                    <div className="flex items-center gap-1.5">
                        {/* Info icon with tooltip - hidden on mobile */}
                        <div className="relative group hidden sm:block">
                            <i className="fa-duotone fa-circle-info text-gray-400 text-xs cursor-help hover:text-primary transition-colors"></i>
                            {/* Info tooltip */}
                            <div className="absolute top-full right-0 mt-2 px-2.5 py-2 bg-gray-900 text-white text-[10px] rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 shadow-lg w-48">
                                <p className="leading-relaxed">
                                    Atualização automática a cada <span className="text-primary font-semibold">30s</span> (ativo) ou <span className="text-primary font-semibold">5m</span> (fundo). Clique para atualizar agora.
                                </p>
                                <div className="absolute bottom-full right-2 border-4 border-transparent border-b-gray-900"></div>
                            </div>
                        </div>

                        {/* Refresh button - More compact */}
                        <button
                            className={`relative flex items-center justify-center w-9 h-9 rounded-lg cursor-pointer transition-all duration-300 shadow-sm active:scale-95 overflow-hidden border border-gray-200
                                ${isRefreshing
                                    ? "bg-gradient-to-br from-primary/20 to-primary/10 text-primary border-primary/30"
                                    : "bg-white text-gray-500 hover:bg-primary/5 hover:text-primary hover:border-primary/30"
                                }`}
                            onClick={onRefresh}
                            disabled={isRefreshing}
                            title="Atualizar dados"
                        >
                            {/* Icon: FA spinner normally, LoadingSpinner when refreshing */}
                            {isRefreshing ? (
                                <div className="relative w-4 h-4 z-10">
                                    {/* Outer ring */}
                                    <div
                                        className="absolute inset-0 rounded-full border-2 border-transparent border-t-primary border-r-primary"
                                        style={{ animation: 'spin 1.5s linear infinite' }}
                                    />
                                    {/* Inner ring */}
                                    <div
                                        className="absolute inset-1 rounded-full border-2 border-transparent border-b-primary/60 border-l-primary/60"
                                        style={{ animation: 'spin-reverse 1s linear infinite' }}
                                    />
                                    <style jsx>{`
                                        @keyframes spin {
                                            from { transform: rotate(0deg); }
                                            to { transform: rotate(360deg); }
                                        }
                                        @keyframes spin-reverse {
                                            from { transform: rotate(360deg); }
                                            to { transform: rotate(0deg); }
                                        }
                                    `}</style>
                                </div>
                            ) : (
                                <i className="fa-duotone fa-arrows-rotate text-base"></i>
                            )}
                        </button>
                    </div>
                )}

                {/* Notifications - More compact, hidden on small mobile */}
                <button className="hidden xs:flex relative items-center justify-center w-9 h-9 border border-gray-200 bg-white rounded-lg text-gray-500 cursor-pointer transition-all duration-200 hover:bg-primary/5 hover:text-primary hover:border-primary/30 shadow-sm active:scale-95">
                    <i className="fa-duotone fa-bell text-base"></i>
                    <span className="absolute top-2 right-2 w-1.5 h-1.5 bg-primary rounded-full border-2 border-white"></span>
                </button>

                {/* Profile Dropdown - More compact */}
                <div className="relative" ref={dropdownRef}>
                    <button
                        className="flex items-center gap-2 py-1 px-1 sm:px-1.5 bg-white border border-transparent hover:border-gray-200 rounded-lg cursor-pointer transition-all duration-200 hover:bg-gray-50 active:scale-95"
                        onClick={() => setShowDropdown(!showDropdown)}
                    >
                        <Avatar
                            src={avatarUrl}
                            name={userName}
                            surname={userSurname}
                            size={32}
                            className="shadow-sm border-2 border-primary/20"
                        />
                        <div className="text-left hidden md:block">
                            <div className="text-xs font-bold text-gray-900 leading-tight">
                                {userName} {userSurname}
                            </div>
                            <div className="text-[10px] font-medium text-gray-500">{isAdminArea ? 'Administrator' : 'Cliente'}</div>
                        </div>
                        <i className="fa-duotone fa-chevron-down text-[10px] text-gray-400 hidden md:block px-1"></i>
                    </button>

                    {/* Dropdown Menu - More compact */}
                    {showDropdown && (
                        <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-lg shadow-xl border border-gray-100 overflow-hidden z-50">
                            {/* User Info - Compact */}
                            <div className="px-3 py-2 bg-gradient-to-br from-primary/5 to-primary/10 border-b border-gray-100">
                                <div className="font-semibold text-gray-900 text-xs leading-tight truncate">
                                    {userName} {userSurname}
                                </div>
                                <div className="text-[10px] text-gray-500 truncate mt-0.5">
                                    {userEmail}
                                </div>
                            </div>

                            {/* Menu Items - Compact */}
                            <div className="py-1">
                                <button
                                    className="w-full flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-primary/5 hover:text-gray-900 transition-all duration-150 border-none bg-transparent cursor-pointer text-left group"
                                    onClick={() => {
                                        setShowDropdown(false);
                                        router.push('/dashboard/personal-data');
                                    }}
                                >
                                    <i className="fa-duotone fa-circle-user w-4 text-center text-gray-400 group-hover:text-primary transition-colors text-sm"></i>
                                    <span>Meu Perfil</span>
                                </button>
                                <button
                                    className="w-full flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-primary/5 hover:text-gray-900 transition-all duration-150 border-none bg-transparent cursor-pointer text-left group"
                                    onClick={() => {
                                        setShowDropdown(false);
                                        router.push('/dashboard');
                                    }}
                                >
                                    <i className="fa-duotone fa-grid-2 w-4 text-center text-gray-400 group-hover:text-primary transition-colors text-sm"></i>
                                    <span>Dashboard</span>
                                </button>
                                <button
                                    className="w-full flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-primary/5 hover:text-gray-900 transition-all duration-150 border-none bg-transparent cursor-pointer text-left group"
                                    onClick={() => {
                                        setShowDropdown(false);
                                        router.push('/dashboard/settings');
                                    }}
                                >
                                    <i className="fa-duotone fa-gear w-4 text-center text-gray-400 group-hover:text-primary transition-colors text-sm"></i>
                                    <span>Configurações</span>
                                </button>
                            </div>

                            {/* Logout - Compact with accent */}
                            <div className="border-t border-gray-100 py-1">
                                <button
                                    className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-rose-500 hover:bg-rose-50 hover:text-rose-600 transition-all duration-150 border-none bg-transparent cursor-pointer text-left disabled:opacity-50 group font-semibold"
                                    onClick={() => {
                                        setShowDropdown(false);
                                        onLogout?.();
                                    }}
                                    disabled={isLoggingOut}
                                >
                                    <i className="fas fa-right-from-bracket w-4 text-center group-hover:translate-x-0.5 transition-transform text-sm"></i>
                                    <span>{isLoggingOut ? "A sair..." : "Sair"}</span>
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </header >
    );
};

export default DashboardHeader;
