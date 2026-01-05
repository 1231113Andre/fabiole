import React, { useState } from "react";
import { Avaliacao } from "../types";
import { AvaliacoesTable } from "./avaliacoes/AvaliacoesTable";
import { AvaliacaoModal } from "./avaliacoes/AvaliacaoModal";
import NewButton from "@/app/components/newButton";

import Link from "next/link";
import { useParams } from "next/navigation";

interface AvaliacoesSectionProps {
    avaliacoes: Avaliacao[];
    onSave: (e: React.FormEvent<HTMLFormElement>, editingId?: number, originalRecord?: Avaliacao) => Promise<void>;
    onBulkSave?: (data: any[]) => Promise<void>;
    onDelete: (id: number) => Promise<void>;
    gender: string;
    userBirth: string;
}

export const AvaliacoesSection: React.FC<AvaliacoesSectionProps> = ({
    avaliacoes,
    onSave,
    onBulkSave,
    onDelete,
    gender,
    userBirth
}) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingRecord, setEditingRecord] = useState<Avaliacao | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const params = useParams();
    const userId = params.id;

    const handleOpenModal = (record?: Avaliacao) => {
        setEditingRecord(record || null);
        setIsModalOpen(true);
        setError(null);
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            await onSave(e, editingRecord?.id, editingRecord || undefined);
            setIsModalOpen(false);
            setEditingRecord(null);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingRecord(null);
    };



    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900">Avaliações ({avaliacoes.length})</h3>
                <div className="flex gap-2">
                    {onBulkSave && (
                        <Link href={`/admin/dashboard/users/bulk/avaliacoes/${userId}`}>
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
                        icon={<i className="fa-duotone fa-plus"></i>}
                    >
                        Nova Avaliação
                    </NewButton>
                </div>
            </div>

            <div className="custom-divider" />

            <AvaliacoesTable
                avaliacoes={avaliacoes}
                onEdit={handleOpenModal}
                onDelete={onDelete}
                gender={gender}
                userBirth={userBirth}
            />

            <AvaliacaoModal
                isOpen={isModalOpen}
                editingRecord={editingRecord}
                error={error}
                isSubmitting={isSubmitting}
                onSubmit={handleSubmit}
                onClose={handleCloseModal}
                gender={gender}
                userBirth={userBirth}
            />


        </div>
    );
};
