"use client";

import { useState, useMemo, useCallback } from "react";
import { AdminHeader } from "@/app/admin/components/AdminHeader";
import { UserTable } from "@/app/admin/components/users";
import { useAdminUsers } from "@/lib/react-query/hooks/useAdminUsers";
import type { AdminDashboardData } from "@/lib/api/services/AdminService";

interface UsersPageClientProps {
    initialData: AdminDashboardData;
}

export function UsersPageClient({ initialData }: UsersPageClientProps) {
    const [searchTerm, setSearchTerm] = useState("");
    const [blockedSearchTerm, setBlockedSearchTerm] = useState("");

    // Use React Query with SSR data hydration - no flash of default values
    const { data } = useAdminUsers(initialData);

    // Users from hydrated data (will always have correct values from SSR)
    const users = useMemo(() => data?.users ?? [], [data]);

    // Filter active users for the main list
    const activeUsers = useMemo(() => users.filter(u => u.status === 'ACTIVE'), [users]);
    const blockedUsers = useMemo(() => users.filter(u => u.status === 'SUSPENDED' || u.status === 'BANNED'), [users]);

    const handleSearchChange = useCallback((value: string) => {
        setSearchTerm(value);
    }, []);

    const handleBlockedSearchChange = useCallback((value: string) => {
        setBlockedSearchTerm(value);
    }, []);

    const renderActiveTitle = (count: number, filtered: typeof users) => {
        // count is the filtered active users (matching search)
        // users.length is the total global count
        // activeUsers.length is the total active count (without search)
        const totalGlobal = users.length;
        const totalActive = activeUsers.length;
        const adminCount = users.filter(u => u.role === 'ADMINISTRATOR').length;

        return (
            <div>
                <h3 className="font-bold text-lg text-gray-900 flex items-center gap-2">
                    <i className="fa-duotone fa-users text-primary" />
                    Todos os <span className="text-primary">{totalGlobal}</span> Utilizadores
                </h3>
                <div className="text-sm text-gray-600 font-semibold ml-9 -mt-1 flex items-center gap-1">
                    <span>
                        (
                        <span className="text-primary">{adminCount}</span> {adminCount === 1 ? 'Administrador' : 'Administradores'},{' '}
                        <span className="text-primary">{count}</span> ativos)
                    </span>
                </div>
            </div>
        );
    };

    const renderBlockedTitle = (count: number, filtered: typeof users) => {
        const suspendedCount = filtered.filter(u => u.status === 'SUSPENDED').length;
        const bannedCount = filtered.filter(u => u.status === 'BANNED').length;

        return (
            <div>
                <h3 className="font-bold text-lg text-gray-900 flex items-center gap-2">
                    <i className="fa-duotone fa-user-lock text-red-500" />
                    Utilizadores <span className="text-red-500">{count}</span> Bloqueados
                </h3>
                {(suspendedCount > 0 || bannedCount > 0) && (
                    <div className="text-sm text-gray-600 font-semibold ml-9 -mt-1 flex items-center gap-2">
                        <i className="fa-duotone fa-user-slash text-red-500" />
                        <span>
                            (
                            {suspendedCount > 0 && (
                                <span><span className="text-red-500">{suspendedCount}</span> {suspendedCount === 1 ? 'Suspenso' : 'Suspensos'}</span>
                            )}
                            {suspendedCount > 0 && bannedCount > 0 && ', '}
                            {bannedCount > 0 && (
                                <span><span className="text-red-500">{bannedCount}</span> {bannedCount === 1 ? 'Banido' : 'Banidos'}</span>
                            )}
                            )
                        </span>
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="space-y-8">
            <div className="space-y-6">
                <AdminHeader
                    title="Utilizadores"
                    subtitle="Consulte, edite e gerencie todas as contas"
                    icon="fa-users"
                />
                <UserTable
                    users={activeUsers}
                    searchTerm={searchTerm}
                    onSearchChange={handleSearchChange}
                    renderTitle={renderActiveTitle}
                />
            </div>

            {blockedUsers.length > 0 && (
                <div className="space-y-4">
                    <div className="flex items-center gap-2 px-1">
                        <div className="h-px bg-gray-200 flex-1" />
                        <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Gestão de Bloqueios</span>
                        <div className="h-px bg-gray-200 flex-1" />
                    </div>
                    <UserTable
                        users={blockedUsers}
                        searchTerm={blockedSearchTerm}
                        onSearchChange={handleBlockedSearchChange}
                        renderTitle={renderBlockedTitle}
                    />
                </div>
            )}
        </div>
    );
}

