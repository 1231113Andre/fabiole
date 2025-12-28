"use client";

import React from "react";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import { ASSETS } from "@/lib/constants/assets";

interface AdminSidebarProps {
    isOpen: boolean;
    onClose: () => void;
    activeTab: string;
    onTabChange: (tab: string) => void;
    userName?: string;
    userSurname?: string;
}

const ADMIN_MENU_ITEMS = [
    { id: "overview", label: "Visão Geral", icon: "fa-grid-2", href: "/admin/dashboard/overview" },
    { id: "users", label: "Utilizadores", icon: "fa-users", href: "/admin/dashboard/users" },
    { id: "create-user", label: "Gestão de Contas", icon: "fa-user-plus", href: "/admin/dashboard/users/new" },
];

export const AdminSidebar: React.FC<AdminSidebarProps> = (props) => {
    return (
        <DashboardSidebar
            {...props}
            menuItems={ADMIN_MENU_ITEMS}
            brandName={`FABIOLE © ${new Date().getFullYear()} ADMIN PANEL`}
            brandIcon="fa-lock-keyhole"
            brandLogo={ASSETS.logo}
            backLink="/dashboard"
            backLabel="Painel do Cliente"
        />
    );
};
