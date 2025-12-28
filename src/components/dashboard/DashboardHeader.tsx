"use client";

import React, { useState, useRef, useEffect } from "react";
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
}) => {
    const router = useRouter();
    const [showDropdown, setShowDropdown] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
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

    return (
        <header className="fixed top-0 left-0 right-0 lg:left-[var(--sidebar-width,290px)] h-[72px] bg-white shadow-sm z-[998] flex items-center px-6 transition-[left] duration-300 border-b border-transparent">
            <div className="flex items-center gap-4">
                {/* Mobile Menu Button */}
                {/* Mobile Menu Button */}
                <button
                    className="flex items-center justify-center w-10 h-10 border border-gray-200 bg-white rounded-xl text-gray-700 cursor-pointer transition-all duration-200 hover:bg-gray-50 hover:text-primary hover:border-primary/30 shadow-sm lg:hidden active:scale-95"
                    onClick={onMenuClick}
                    aria-label="Menu"
                >
                    <i className="fa-duotone fa-bars text-xl"></i>
                </button>

                {/* Search Bar Removed */}
                <div className="hidden sm:block"></div>
            </div>
            <div className="flex items-center gap-2 ml-auto">
                {/* Refresh Button with Info Tooltip */}
                {onRefresh && (
                    <div className="flex items-center gap-2">
                        {/* Info icon with tooltip */}
                        <div className="relative group">
                            <i className="fa-duotone fa-circle-info text-gray-400 text-sm cursor-help hover:text-primary transition-colors"></i>
                            {/* Info tooltip */}
                            <div className="absolute top-full left-0 mt-2 px-3 py-2 bg-gray-900 text-white text-[11px] rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 shadow-lg w-56">
                                <p className="leading-relaxed">
                                    Atualização automática a cada <span className="text-primary font-semibold">30s</span> (ativo) ou <span className="text-primary font-semibold">5m</span> (fundo). Clique para atualizar agora.
                                </p>
                                <div className="absolute bottom-full left-2 border-4 border-transparent border-b-gray-900"></div>
                            </div>
                        </div>

                        {/* Refresh button with border */}
                        <button
                            className={`relative flex items-center justify-center w-10 h-10 rounded-xl cursor-pointer transition-all duration-300 shadow-sm active:scale-95 overflow-hidden border border-gray-200
                                ${isRefreshing
                                    ? "bg-gradient-to-br from-primary/20 to-primary/10 text-primary border-primary/30"
                                    : "bg-white text-gray-500 hover:bg-gray-50 hover:text-primary hover:border-primary/30"
                                }`}
                            onClick={onRefresh}
                            disabled={isRefreshing}
                            title="Atualizar dados"
                        >

                            {/* Icon: FA spinner normally, LoadingSpinner when refreshing */}
                            {isRefreshing ? (
                                <div className="relative w-5 h-5 z-10">
                                    {/* Outer ring */}
                                    <div
                                        className="absolute inset-0 rounded-full border-2 border-transparent border-t-blue-500 border-r-blue-500"
                                        style={{ animation: 'spin 1.5s linear infinite' }}
                                    />
                                    {/* Inner ring */}
                                    <div
                                        className="absolute inset-1 rounded-full border-2 border-transparent border-b-blue-400 border-l-blue-400"
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
                                <i className="fa-duotone fa-arrows-rotate text-gray-500"></i>
                            )}
                        </button>
                    </div>
                )}

                {/* Notifications */}
                <button className="relative flex items-center justify-center w-10 h-10 border border-gray-200 bg-white rounded-xl text-gray-500 cursor-pointer transition-all duration-200 hover:bg-gray-50 hover:text-primary hover:border-primary/30 shadow-sm active:scale-95">
                    <i className="fa-duotone fa-bell"></i>
                    <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-primary rounded-full border-2 border-white"></span>
                </button>

                {/* Profile Dropdown */}
                <div className="relative" ref={dropdownRef}>
                    <button
                        className="flex items-center gap-3 py-1 px-1.5 bg-white border border-transparent hover:border-gray-200 rounded-xl cursor-pointer transition-all duration-200 hover:bg-gray-50"
                        onClick={() => setShowDropdown(!showDropdown)}
                    >
                        <Avatar
                            src={avatarUrl}
                            name={userName}
                            surname={userSurname}
                            size={36}
                            className="shadow-sm border-2 border-primary/20"
                        />
                        <div className="text-left hidden md:block">
                            <div className="text-sm font-bold text-gray-900 leading-tight">
                                {userName} {userSurname}
                            </div>
                            <div className="text-[11px] font-medium text-gray-500">{isAdminArea ? 'Administrator' : 'Cliente'}</div>
                        </div>
                        <i className="fa-duotone fa-chevron-down text-xs text-gray-400 hidden md:block px-2"></i>
                    </button>

                    {/* Dropdown Menu */}
                    {showDropdown && (
                        <div className="absolute right-0 top-full mt-1.5 w-52 bg-white rounded-lg shadow-xl border border-gray-100 overflow-hidden z-50">
                            {/* User Info - Compact */}
                            <div className="px-3 py-2.5 bg-gray-50/80 border-b border-gray-100">
                                <div className="font-semibold text-gray-900 text-[13px] leading-tight truncate">
                                    {userName} {userSurname}
                                </div>
                                <div className="text-[11px] text-gray-500 truncate mt-0.5">
                                    {userEmail}
                                </div>
                            </div>

                            {/* Menu Items - Compact */}
                            <div className="py-1">
                                <button
                                    className="w-full flex items-center gap-2.5 px-3 py-2 text-[13px] font-semibold text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-all duration-150 border-none bg-transparent cursor-pointer text-left group"
                                    onClick={() => {
                                        setShowDropdown(false);
                                        router.push('/dashboard/personal-data');
                                    }}
                                >
                                    <i className="fa-duotone fa-circle-user w-4 text-center text-gray-400 group-hover:text-primary transition-colors"></i>
                                    <span>Meu Perfil</span>
                                </button>
                                <button
                                    className="w-full flex items-center gap-2.5 px-3 py-2 text-[13px] font-semibold text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-all duration-150 border-none bg-transparent cursor-pointer text-left group"
                                    onClick={() => {
                                        setShowDropdown(false);
                                        router.push('/dashboard');
                                    }}
                                >
                                    <i className="fa-duotone fa-grid-2 w-4 text-center text-gray-400 group-hover:text-primary transition-colors"></i>
                                    <span>Dashboard</span>
                                </button>
                                <button
                                    className="w-full flex items-center gap-2.5 px-3 py-2 text-[13px] font-semibold text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-all duration-150 border-none bg-transparent cursor-pointer text-left group"
                                    onClick={() => {
                                        setShowDropdown(false);
                                        router.push('/dashboard/settings');
                                    }}
                                >
                                    <i className="fa-duotone fa-gear w-4 text-center text-gray-400 group-hover:text-primary transition-colors"></i>
                                    <span>Configurações</span>
                                </button>
                            </div>

                            {/* Logout - Compact with accent */}
                            <div className="border-t border-gray-100 py-1">
                                <button
                                    className="w-full flex items-center gap-2.5 px-3 py-2 text-[13px] text-rose-500 hover:bg-rose-50 hover:text-rose-600 transition-all duration-150 border-none bg-transparent cursor-pointer text-left disabled:opacity-50 group"
                                    onClick={() => {
                                        setShowDropdown(false);
                                        onLogout?.();
                                    }}
                                    disabled={isLoggingOut}
                                >
                                    <i className="fas fa-right-from-bracket w-4 text-center group-hover:translate-x-0.5 transition-transform"></i>
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
