"use client";

import { useState } from "react";
import NewButton from "@/app/components/newButton";
import { useDashboardData } from "../hooks/useDashboardData";
import { ChangePasswordSection } from "./components/ChangePasswordSection";
import { ChangeEmailSection } from "./components/ChangeEmailSection";
import { DeleteAccountSection } from "./components/DeleteAccountSection";
import { LoginHistorySection } from "./components/LoginHistorySection";

export default function SettingsPage() {
    const { user } = useDashboardData();
    const [activeSection, setActiveSection] = useState<string | null>("password");

    return (
        <>
            {/* Page Header */}
            <div className="mb-6 sm:mb-8">
                <div className="mb-6 flex flex-wrap gap-4">
                    <NewButton
                        href="/dashboard"
                        variant="new_primary_rounded"
                        icon={<i className="fa-duotone fa-arrow-left" />}
                        iconPosition="left"
                        className="w-full sm:w-auto min-w-[200px] shadow-md uppercase font-bold"
                    >
                        Voltar ao Overview
                    </NewButton>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
                    <div>
                        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-black mb-2 flex items-center gap-3">
                            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-primary to-primary-hover flex items-center justify-center shadow-lg">
                                <i className="fa-duotone fa-gear text-white text-lg sm:text-xl" />
                            </div>
                            <span>Definições da Conta</span>
                        </h1>
                        <p className="text-muted-foreground text-lg font-medium">
                            Gerir a segurança e privacidade da tua conta
                        </p>
                    </div>
                </div>
            </div>

            {/* Settings Sections */}
            <div className="space-y-6">
                {/* Change Password */}
                <ChangePasswordSection
                    isOpen={activeSection === "password"}
                    onToggle={() => setActiveSection(activeSection === "password" ? null : "password")}
                />

                {/* Change Email */}
                <ChangeEmailSection
                    currentEmail={user?.email || ""}
                    isOpen={activeSection === "email"}
                    onToggle={() => setActiveSection(activeSection === "email" ? null : "email")}
                />

                {/* Login History */}
                <LoginHistorySection
                    isOpen={activeSection === "history"}
                    onToggle={() => setActiveSection(activeSection === "history" ? null : "history")}
                />

                {/* Delete Account - Always visible but collapsed */}
                <DeleteAccountSection
                    isOpen={activeSection === "delete"}
                    onToggle={() => setActiveSection(activeSection === "delete" ? null : "delete")}
                />
            </div>
        </>
    );
}
