"use client";

import { useState } from "react";
import { AccountStatusSection } from "./definicoes/AccountStatusSection";
import { AdminChangePasswordSection } from "./definicoes/AdminChangePasswordSection";
import { AdminChangeEmailSection } from "./definicoes/AdminChangeEmailSection";
import { AdminDeleteAccountSection } from "./definicoes/AdminDeleteAccountSection";
import { AccountStatus } from "@/app/admin/types";

interface Props {
    userId: string;
    userEmail: string;
    userName: string;
    status: string;
    statusChangedBy?: string | null;
    statusChangedAt?: string | null;
    statusReason?: string | null;
    userRole: string;
    userCreatedAt?: string | Date;
    userSurname?: string;
    userGender?: string | null;
    userDebt?: number;
    userCredits?: number;
    userScheduled?: number;
    userPaid?: string;
    onEmailChanged: (newEmail: string) => void;
    onStatusChanged: (newStatus: string) => void;
}

export function DefinicoeSection({
    userId,
    userEmail,
    userName,
    status,
    statusChangedBy,
    statusChangedAt,
    statusReason,
    userRole,
    userCreatedAt,
    userSurname,
    userGender,
    userDebt,
    userCredits,
    userScheduled,
    userPaid,
    onEmailChanged,
    onStatusChanged
}: Props) {
    const [activeSection, setActiveSection] = useState<string | null>("status");

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900">Definições da Conta</h3>
            </div>

            <div className="custom-divider" />

            <div className="space-y-4">
                <AccountStatusSection
                    userId={userId}
                    userName={userName}
                    userSurname={userSurname}
                    userEmail={userEmail}
                    userRole={userRole}
                    userCreatedAt={userCreatedAt}
                    userGender={userGender}
                    userDebt={userDebt}
                    userCredits={userCredits}
                    userScheduled={userScheduled}
                    userPaid={userPaid}
                    currentStatus={status}
                    statusChangedBy={statusChangedBy}
                    statusChangedAt={statusChangedAt}
                    statusReason={statusReason}
                    isOpen={activeSection === "status"}
                    onToggle={() => setActiveSection(activeSection === "status" ? null : "status")}
                    onStatusChanged={onStatusChanged}
                />

                <AdminChangePasswordSection
                    userId={userId}
                    isOpen={activeSection === "password"}
                    onToggle={() => setActiveSection(activeSection === "password" ? null : "password")}
                />

                <AdminChangeEmailSection
                    userId={userId}
                    currentEmail={userEmail}
                    isOpen={activeSection === "email"}
                    onToggle={() => setActiveSection(activeSection === "email" ? null : "email")}
                    onEmailChanged={onEmailChanged}
                />

                <AdminDeleteAccountSection
                    userId={userId}
                    userName={userName}
                    userEmail={userEmail}
                    isOpen={activeSection === "delete"}
                    onToggle={() => setActiveSection(activeSection === "delete" ? null : "delete")}
                />
            </div>
        </div>
    );
}
