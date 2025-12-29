"use client";

import { useState } from "react";
import { AdminChangePasswordSection } from "./definicoes/AdminChangePasswordSection";
import { AdminChangeEmailSection } from "./definicoes/AdminChangeEmailSection";
import { AdminDeleteAccountSection } from "./definicoes/AdminDeleteAccountSection";

interface Props {
    userId: string;
    userEmail: string;
    userName: string;
    onEmailChanged: (newEmail: string) => void;
}

export function DefinicoeSection({ userId, userEmail, userName, onEmailChanged }: Props) {
    const [activeSection, setActiveSection] = useState<string | null>("password");

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900">Definições da Conta</h3>
            </div>

            <div className="custom-divider" />

            <div className="space-y-4">
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
