"use client";

import NewButton from "@/app/components/newButton";
import { PersonalInfoTab } from "../components/PersonalInfoTab";
import { useDashboardData } from "../hooks/useDashboardData";

export default function PersonalDataPage() {
    const { personalInfo, user } = useDashboardData();

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
                                <i className="fa-duotone fa-user text-white text-lg sm:text-xl" />
                            </div>
                            <span>Informações Pessoais</span>
                        </h1>
                        <p className="text-muted-foreground text-lg font-medium">
                            Os teus dados pessoais e informações de perfil
                        </p>
                    </div>
                </div>
            </div>

            {/* Content */}
            {personalInfo && <PersonalInfoTab personalInfo={personalInfo} />}
        </>
    );
}
