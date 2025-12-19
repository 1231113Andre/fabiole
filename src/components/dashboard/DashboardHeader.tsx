"use client";

import React, { useState, useRef, useEffect } from "react";

interface DashboardHeaderProps {
    onMenuClick: () => void;
    userName?: string;
    userSurname?: string;
    userEmail?: string;
    onRefresh?: () => void;
    isRefreshing?: boolean;
    onLogout?: () => void;
    isLoggingOut?: boolean;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({
    onMenuClick,
    userName = "User",
    userSurname = "",
    userEmail = "",
    onRefresh,
    isRefreshing = false,
    onLogout,
    isLoggingOut = false,
}) => {
    const [showDropdown, setShowDropdown] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

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

    const initials =
        `${userName?.[0] || ""}${userSurname?.[0] || ""}`.toUpperCase() || "U";

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
                {/* Refresh Button */}
                {onRefresh && (
                    <button
                        className="relative flex items-center justify-center w-10 h-10 border border-gray-200 bg-white rounded-xl text-gray-500 cursor-pointer transition-all duration-200 hover:bg-gray-50 hover:text-primary hover:border-primary/30 shadow-sm active:scale-95 disabled:opacity-50"
                        onClick={onRefresh}
                        disabled={isRefreshing}
                        title="Atualizar dados"
                    >
                        <i
                            className={`fa-duotone fa-arrows-rotate ${isRefreshing ? "fa-spin" : ""}`}
                        ></i>
                    </button>
                )}

                {/* Notifications */}
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
                        <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-primary to-primary-hover flex items-center justify-center text-white font-bold text-sm shadow-md shadow-primary/20">
                            {initials}
                        </div>
                        <div className="text-left hidden md:block">
                            <div className="text-sm font-bold text-gray-900 leading-tight">
                                {userName} {userSurname}
                            </div>
                            <div className="text-[11px] font-medium text-gray-500">Cliente</div>
                        </div>
                        <i className="fa-duotone fa-chevron-down text-xs text-gray-400 hidden md:block px-2"></i>
                    </button>

                    {/* Dropdown Menu */}
                    {showDropdown && (
                        <div className="absolute right-0 top-full mt-2 w-64 bg-white dark:bg-boxdark rounded-xl shadow-xl border border-border dark:border-strokedark overflow-hidden z-50">
                            {/* User Info */}
                            <div className="px-4 py-3 bg-muted dark:bg-meta-4 border-b border-border dark:border-strokedark">
                                <div className="font-semibold text-foreground dark:text-white text-sm">
                                    {userName} {userSurname}
                                </div>
                                <div className="text-xs text-muted-foreground dark:text-bodydark2 truncate mt-0.5">
                                    {userEmail}
                                </div>
                            </div>

                            {/* Menu Items */}
                            <div className="py-2">
                                <button
                                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-foreground dark:text-bodydark1 hover:bg-muted dark:hover:bg-meta-4 transition-colors border-none bg-transparent cursor-pointer text-left"
                                    onClick={() => setShowDropdown(false)}
                                >
                                    <i className="fas fa-user-circle w-4 text-center text-muted-foreground dark:text-bodydark2"></i>
                                    <span>Meu Perfil</span>
                                </button>
                                <button
                                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-foreground dark:text-bodydark1 hover:bg-muted dark:hover:bg-meta-4 transition-colors border-none bg-transparent cursor-pointer text-left"
                                    onClick={() => setShowDropdown(false)}
                                >
                                    <i className="fas fa-cog w-4 text-center text-muted-foreground dark:text-bodydark2"></i>
                                    <span>Configurações</span>
                                </button>
                            </div>

                            {/* Logout */}
                            <div className="border-t border-border dark:border-strokedark py-2">
                                <button
                                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-destructive hover:bg-destructive/10 transition-colors border-none bg-transparent cursor-pointer text-left disabled:opacity-50"
                                    onClick={() => {
                                        setShowDropdown(false);
                                        onLogout?.();
                                    }}
                                    disabled={isLoggingOut}
                                >
                                    <i className="fas fa-right-from-bracket w-4 text-center"></i>
                                    <span>{isLoggingOut ? "A sair..." : "Sair"}</span>
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
};

export default DashboardHeader;
