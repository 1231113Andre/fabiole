import React, { useState } from "react";
import { Perimetro } from "../types";
import { PerimetrosTable } from "./perimetros/PerimetrosTable";
import { PerimetroModal } from "./perimetros/PerimetroModal";
import NewButton from "@/app/components/newButton";

import Link from "next/link";
import { useParams } from "next/navigation";

interface PerimetrosSectionProps {
    perimetros: Perimetro[];
    onSave: (e: React.FormEvent<HTMLFormElement>, editingId?: number, originalRecord?: Perimetro) => Promise<void>;
    onBulkSave?: (data: any[]) => Promise<void>;
    onDelete: (id: number) => Promise<void>;
}

export const PerimetrosSection: React.FC<PerimetrosSectionProps> = ({
    perimetros,
    onSave,
    onBulkSave,
    onDelete
}) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingRecord, setEditingRecord] = useState<Perimetro | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const params = useParams();
    const userId = params.id;

    const handleOpenModal = (record?: Perimetro) => {
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
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-0">
                <h3 className="text-lg font-semibold text-gray-900">Perímetros ({perimetros.length})</h3>
                <div className="flex gap-2 w-full sm:w-auto">
                    {onBulkSave && (
                        <Link href={`/admin/dashboard/users/bulk/perimetros/${userId}`} className="flex-1 sm:flex-none">
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
                        icon={<i className="fa-duotone fa-plus"></i>}
                        className="flex-1 sm:flex-none w-full sm:w-auto justify-center"
                    >
                        Novo Perímetro
                    </NewButton>
                </div>
            </div>

            <div className="custom-divider" />

            <PerimetrosTable
                perimetros={perimetros}
                onEdit={handleOpenModal}
                onDelete={onDelete}
            />

            <PerimetroModal
                isOpen={isModalOpen}
                editingRecord={editingRecord}
                error={error}
                isSubmitting={isSubmitting}
                onSubmit={handleSubmit}
                onClose={handleCloseModal}
            />


        </div>
    );
};
