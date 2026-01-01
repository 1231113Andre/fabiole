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

    // Use React Query with SSR data hydration - no flash of default values
    const { data } = useAdminUsers(initialData);

    // Users from hydrated data (will always have correct values from SSR)
    const users = useMemo(() => data?.users ?? [], [data]);

    const handleSearchChange = useCallback((value: string) => {
        setSearchTerm(value);
    }, []);

    return (
        <div>
            <AdminHeader
                title="Utilizadores"
                subtitle="Consulte, edite e gerencie todas as contas"
                icon="fa-users"
            />
            <UserTable
                users={users}
                searchTerm={searchTerm}
                onSearchChange={handleSearchChange}
            />
        </div>
    );
}

