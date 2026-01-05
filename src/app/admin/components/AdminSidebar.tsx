"use client";

import React, { useMemo, memo } from "react";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import { ASSETS } from "@/lib/constants/assets";
import type { MenuItem } from "@/components/sidebar/SidebarMenuItem";

interface AdminSidebarProps {
    isOpen: boolean;
    onClose: () => void;
    activeTab: string;
    onTabChange?: (tab: string) => void;
    userName?: string;
    userSurname?: string;
    avatarUrl?: string | null;
    isCollapsed: boolean;
    onToggle: () => void;
}

const ADMIN_MENU_ITEMS: MenuItem[] = [
    { id: "overview", label: "Visão Geral", icon: "fa-grid-2", href: "/admin/dashboard/overview" },
    { id: "users", label: "Utilizadores", icon: "fa-users", href: "/admin/dashboard/users", dividerLabel: "Gestão" },
    { id: "create-user", label: "Gestão de Contas", icon: "fa-user-plus", href: "/admin/dashboard/users/new" },
    { id: "settings", label: "Definições de Sistema", icon: "fa-gears", href: "/admin/dashboard/settings", dividerLabel: "Sistema" },
];

export const AdminSidebar = memo<AdminSidebarProps>(function AdminSidebar(props) {
    const brandName = useMemo(() => `FABIOLE © ${new Date().getFullYear()} ADMIN PANEL`, []);

    return (
        <DashboardSidebar
            {...props}
            menuItems={ADMIN_MENU_ITEMS}
            brandName={brandName}
            brandIcon="fa-lock-keyhole"
            brandLogo={ASSETS.logo}
            backLink="/dashboard"
            backLabel="Painel do Cliente"
            footerTitle="Administrator Panel"
        />
    );
});
