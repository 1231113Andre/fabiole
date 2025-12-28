"use client";

import { useState, useMemo, useCallback } from "react";
import { AdminHeader } from "@/app/admin/components/AdminHeader";
import { UserTable } from "@/app/admin/components/users";
import type { AdminUser } from "@/lib/api/services/AdminService";

interface UsersPageClientProps {
    initialUsers: AdminUser[];
}

export function UsersPageClient({ initialUsers }: UsersPageClientProps) {
    const [searchTerm, setSearchTerm] = useState("");

    // Use server-provided data as initial state
    const users = useMemo(() => initialUsers, [initialUsers]);

    const handleSearchChange = useCallback((value: string) => {
        setSearchTerm(value);
    }, []);

    return (
        <div>
            <AdminHeader
                title="Utilizadores"
                subtitle="Gestão de contas de utilizador"
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
