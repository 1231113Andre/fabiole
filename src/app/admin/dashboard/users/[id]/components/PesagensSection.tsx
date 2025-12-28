
import React from "react";
import { Pesagem } from "../types";
import { usePesagemForm } from "./pesagens/usePesagemForm";
import { PesagensTable } from "./pesagens/PesagensTable";
import { PesagemModal } from "./pesagens/PesagemModal";
import NewButton from "@/app/components/newButton";
import Link from "next/link";
import { useParams } from "next/navigation";

interface PesagensSectionProps {
    pesagens: Pesagem[];
    onSave: (e: React.FormEvent<HTMLFormElement>, editingId?: number) => Promise<void>;
    onBulkSave?: (data: any[]) => Promise<void>;
    onDelete: (id: number) => Promise<void>;
    gender: string;
}

export const PesagensSection: React.FC<PesagensSectionProps> = ({
    pesagens,
    onSave,
    onBulkSave,
    onDelete,
    gender
}) => {
    const {
        isModalOpen,
        editingRecord,
        error,
        formData,
        isSubmitting,
        handleOpenModal,
        handleFieldChange,
        handleSubmit,
        handleCloseModal
    } = usePesagemForm({ gender, onSave });

    const params = useParams();
    const userId = params.id;

    return (
        <div className="space-y-6 w-full overflow-hidden">
            <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900">Pesagens ({pesagens.length})</h3>
                <div className="flex gap-2">
                    {onBulkSave && (
                        <Link href={`/admin/dashboard/users/bulk/pesagens/${userId}`}>
                            <NewButton
                                variant="new_primary_no_bg_rounded"
                                className="font-medium text-gray-700 hover:text-primary hover:bg-gray-50 border border-gray-200 hover:border-primary/30 transition-all shadow-sm"
                                icon={<i className="fa-duotone fa-layer-plus"></i>}
                            >
                                Adicionar em Massa
                            </NewButton>
                        </Link>
                    )}
                    <NewButton
                        onClick={() => handleOpenModal()}
                        variant="new_primary_rounded"
                        className="shadow-md shadow-primary/20 hover:shadow-primary/30 transition-all"
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
                onEdit={handleOpenModal}
                onDelete={onDelete}
            />

            <PesagemModal
                isOpen={isModalOpen}
                editingRecord={editingRecord}
                formData={formData}
                error={error}
                isSubmitting={isSubmitting}
                onFieldChange={handleFieldChange}
                onSubmit={handleSubmit}
                onClose={handleCloseModal}
            />
        </div>
    );
};
