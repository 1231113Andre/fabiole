"use client";

import React, { memo, useMemo } from "react";
import Link from "next/link";
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
    renderTitle?: (count: number, filteredUsers: AdminUser[]) => React.ReactNode;
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

export const UserTable = memo<UserTableProps>(({ users, searchTerm, onSearchChange, renderTitle }) => {
    // Memoize filtered and sorted users for performance
    const filteredUsers = useMemo(() =>
        sortUsersAlphabetically(filterUsers(users, searchTerm))
        , [users, searchTerm]);

    return (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            {/* Header */}
            <div className="p-6 border-b border-gray-100 flex flex-wrap items-center justify-between gap-4">
                <div>
                    {renderTitle ? renderTitle(filteredUsers.length, filteredUsers) : (
                        <h3 className="font-bold text-lg text-gray-900 flex items-center gap-2">
                            <i className="fa-duotone fa-users text-primary" />
                            Todos os <span className="text-primary">{filteredUsers.length}</span> Utilizadores
                        </h3>
                    )}

                    {!renderTitle && filteredUsers.filter(u => u.role === 'ADMINISTRATOR').length > 0 && (
                        <Link
                            href="/"
                            className="text-sm text-gray-600 font-semibold ml-9 -mt-1 flex items-center gap-2 hover:text-primary transition-colors cursor-pointer w-fit"
                        >
                            <i className="fa-duotone fa-user-gear text-primary" />
                            <span>(<span className="text-primary">{filteredUsers.filter(u => u.role === 'ADMINISTRATOR').length}</span> Administradores)</span>
                        </Link>
                    )}
                </div>
                <SearchInput value={searchTerm} onChange={onSearchChange} />
            </div>

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
