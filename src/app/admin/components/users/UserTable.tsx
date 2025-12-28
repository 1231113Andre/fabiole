"use client";

import { memo, useMemo } from "react";
import { AdminUser } from "@/app/admin/types";
import { sortUsersAlphabetically } from "@/app/admin/helpers";
import { UserCard } from "./UserCard";
import { SearchInput } from "./SearchInput";
import { EmptyState } from "./EmptyState";

// ============================================================================
// TYPES
// ============================================================================

interface UserTableProps {
    users: AdminUser[];
    searchTerm: string;
    onSearchChange: (value: string) => void;
}

// ============================================================================
// HELPERS
// ============================================================================

function filterUsers(users: AdminUser[], searchTerm: string): AdminUser[] {
    if (!searchTerm.trim()) return users;

    const term = searchTerm.toLowerCase();
    return users.filter(user =>
        user.name.toLowerCase().includes(term) ||
        user.surname.toLowerCase().includes(term) ||
        user.email.toLowerCase().includes(term)
    );
}

// ============================================================================
// COMPONENT
// ============================================================================

export const UserTable = memo<UserTableProps>(({ users, searchTerm, onSearchChange }) => {
    // Memoize filtered and sorted users for performance
    const filteredUsers = useMemo(() =>
        sortUsersAlphabetically(filterUsers(users, searchTerm))
        , [users, searchTerm]);

    return (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            {/* Header */}
            <div className="p-6 border-b border-gray-100 flex flex-wrap items-center justify-between gap-4">
                <h3 className="font-bold text-lg text-gray-900 flex items-center gap-2">
                    <i className="fa-duotone fa-users text-primary" />
                    Todos os Utilizadores
                    <span className="ml-2 px-2.5 py-0.5 bg-primary/10 text-primary text-sm font-bold rounded-full">
                        {filteredUsers.length}
                    </span>
                </h3>
                <SearchInput value={searchTerm} onChange={onSearchChange} />
            </div>

            {/* User List */}
            <div className="divide-y divide-gray-100 max-h-[calc(100vh-300px)] overflow-y-auto">
                {filteredUsers.length === 0 ? (
                    <EmptyState />
                ) : (
                    filteredUsers.map(user => <UserCard key={user.id} user={user} />)
                )}
            </div>
        </div>
    );
});

UserTable.displayName = 'UserTable';
