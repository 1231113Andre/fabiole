
import React from "react";
import { Pesagem } from "../types";
import { usePesagemForm } from "./pesagens/usePesagemForm";
import { PesagensTable } from "./pesagens/PesagensTable";
import { PesagemModal } from "./pesagens/PesagemModal";
import { calculateAge } from "@/lib/body-metrics";
import NewButton from "@/app/components/newButton";
import Link from "next/link";
import { useParams } from "next/navigation";

interface PesagensSectionProps {
    pesagens: Pesagem[];
    onSave: (e: React.FormEvent<HTMLFormElement>, editingId?: number, originalRecord?: Pesagem, overrides?: string[]) => Promise<void>;
    onBulkSave?: (data: any[]) => Promise<void>;
    onDelete: (id: number) => Promise<void>;
    gender: string;
    userBirth?: Date | string | null; // For Watson H2O formula
}

export const PesagensSection: React.FC<PesagensSectionProps> = ({
    pesagens,
    onSave,
    onBulkSave,
    onDelete,
    gender,
    userBirth
}) => {
    const {
        isModalOpen,
        editingRecord,
        error,
        formData,
        isSubmitting,
        manualOverrides,
        handleOpenModal,
        handleFieldChange,
        handleSubmit,
        handleCloseModal,
        clearManualOverride
    } = usePesagemForm({ gender, userBirth, onSave });

    // Calculate user age from birth date for Watson H2O formula
    const userAge = userBirth ? calculateAge(userBirth) : null;

    const params = useParams();
    const userId = params.id;

    return (
        <div className="space-y-6 w-full overflow-visible">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-0">
                <h3 className="text-lg font-semibold text-gray-900">Pesagens ({pesagens.length})</h3>
                <div className="flex gap-2 w-full sm:w-auto">
                    {onBulkSave && (
                        <Link href={`/admin/dashboard/users/bulk/pesagens/${userId}`} className="flex-1 sm:flex-none">
                            <NewButton
                                variant="new_primary_no_bg_rounded"
                                className="font-medium text-gray-700 hover:text-primary hover:bg-gray-50 border border-gray-200 hover:border-primary/30 transition-all shadow-sm w-full sm:w-auto justify-center"
                                icon={<i className="fa-duotone fa-layer-plus"></i>}
                            >
                                Adicionar em Massa
                            </NewButton>
                        </Link>
                    )}
                    <NewButton
                        onClick={() => handleOpenModal()}
                        variant="new_primary_rounded"
                        className="shadow-md shadow-primary/20 hover:shadow-primary/30 transition-all flex-1 sm:flex-none w-full sm:w-auto justify-center"
                        icon={<i className="fa-duotone fa-plus"></i>}
                    >
                        Nova Pesagem
                    </NewButton>
                </div>
            </div>

            <div className="custom-divider" />

            <PesagensTable
                pesagens={pesagens}
                gender={gender}
                userAge={userAge}
                onEdit={handleOpenModal}
                onDelete={onDelete}
            />

            <PesagemModal
                isOpen={isModalOpen}
                editingRecord={editingRecord}
                formData={formData}
                error={error}
                isSubmitting={isSubmitting}
                manualOverrides={manualOverrides}
                gender={gender}
                onFieldChange={handleFieldChange}
                onSubmit={handleSubmit}
                onClose={handleCloseModal}
                onClearOverride={clearManualOverride}
            />
        </div>
    );
};
