"use client";

import NewButton from "@/app/components/newButton";
import { AvaliacoesTab } from "../../components/AvaliacoesTab";
import { useDashboardData } from "../../hooks/useDashboardData";
import { UserSheetData } from "@/lib/types/dashboard";

interface EvaluationsClientProps {
    initialData: UserSheetData | null;
}

export function EvaluationsClient({ initialData }: EvaluationsClientProps) {
    const { avaliacoes } = useDashboardData(initialData || undefined);

    return (
        <>
            {/* Page Header – compact on mobile for nav, full on desktop */}
            <div className="mb-4 sm:mb-6 lg:mb-8 w-full min-w-0">
                <div className="mb-4 sm:mb-6 flex flex-wrap gap-3">
                    <NewButton
                        href="/dashboard"
                        variant="new_primary_rounded"
                        icon={<i className="fa-duotone fa-arrow-left" />}
                        iconPosition="left"
                        className="w-full sm:w-auto min-w-0 sm:min-w-[200px] shadow-md uppercase font-bold text-sm sm:text-base"
                    >
                        Voltar ao Overview
                    </NewButton>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
                    <div className="min-w-0">
                        <h1 className="text-xl sm:text-2xl lg:text-3xl xl:text-4xl font-bold text-black mb-1 sm:mb-2 flex items-center gap-2 sm:gap-3 flex-wrap">
                            <div className="w-9 h-9 sm:w-10 sm:h-10 lg:w-12 lg:h-12 rounded-xl bg-gradient-to-br from-primary to-primary-hover flex items-center justify-center shadow-lg shrink-0">
                                <i className="fa-duotone fa-dumbbell text-white text-base sm:text-lg lg:text-xl" />
                            </div>
                            <span className="min-w-0">Avaliações</span>
                        </h1>
                        <p className="text-muted-foreground text-sm sm:text-base lg:text-lg font-medium">
                            Avaliações físicas e testes de desempenho
                        </p>
                    </div>
                </div>
            </div>

            {/* Content */}
            <AvaliacoesTab
                avaliacoes={avaliacoes}
                gender={useDashboardData(initialData || undefined).personalInfo?.gender}
                birth={useDashboardData(initialData || undefined).personalInfo?.birth}
            />
        </>
    );
}
