import React from "react";
import { Perimetro } from "../../types";
import { formatDateForInput } from "../../utils";
import NewButton from "@/app/components/newButton";

// Inline spinner component
const InlineSpinner = () => (
    <div className="w-4 h-4 relative">
        <div className="absolute inset-0 rounded-full border-2 border-white/30"></div>
        <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-white animate-spin"></div>
    </div>
);

interface PerimetroModalProps {
    isOpen: boolean;
    editingRecord: Perimetro | null;
    error: string | null;
    isSubmitting?: boolean;
    onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
    onClose: () => void;
}

function FormInput({
    label,
    icon,
    name,
    type = "number",
    defaultValue,
    step,
    required,
}: {
    label: string;
    icon: string;
    name: string;
    type?: string;
    defaultValue: any;
    step?: string;
    required?: boolean;
}) {
    return (
        <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5 flex items-center gap-1.5">
                <i className={`fa-duotone ${icon} text-primary/70 text-[10px]`}></i>
                {label} {required && <span className="text-red-500">*</span>}
            </label>
            <input
                type={type}
                step={step}
                name={name}
                defaultValue={defaultValue || ''}
                required={required}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
            />
        </div>
    );
}

export const PerimetroModal: React.FC<PerimetroModalProps> = ({
    isOpen,
    editingRecord,
    error,
    isSubmitting = false,
    onSubmit,
    onClose
}) => {
    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-6 animate-in fade-in duration-200"
            onClick={onClose}
        >
            <div
                className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[95vh] overflow-hidden animate-in fade-in zoom-in-95 duration-300 flex flex-col"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-gradient-to-r from-primary/5 via-primary/3 to-transparent">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-orange-600 flex items-center justify-center shadow-md">
                            <i className={`fa-duotone ${editingRecord ? 'fa-pen-to-square' : 'fa-plus'} text-white text-lg`}></i>
                        </div>
                        <div>
                            <h3 className="font-bold text-xl text-gray-900 flex items-center gap-2">
                                {editingRecord ? 'Editar Perímetro' : 'Novo Perímetro'}
                                {editingRecord && (
                                    <span className="text-xs font-normal text-gray-500">#{editingRecord.id}</span>
                                )}
                            </h3>
                            <p className="text-xs text-gray-600 mt-0.5">Configure todos os parâmetros de perímetros corporais</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        disabled={isSubmitting}
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-all duration-200 disabled:opacity-50"
                    >
                        <i className="fa-solid fa-xmark text-lg"></i>
                    </button>
                </div>

                {/* Scrollable Content */}
                <div className="overflow-y-auto flex-1">
                    <form onSubmit={onSubmit} className="p-6">
                        {error && (
                            <div className="mb-4 p-3 bg-red-50 text-red-700 text-xs rounded-lg border border-red-200 flex items-center gap-2 shadow-sm">
                                <div className="w-6 h-6 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                                    <i className="fa-duotone fa-circle-exclamation text-red-600 text-xs"></i>
                                </div>
                                <span className="font-semibold">{error}</span>
                            </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            <FormInput
                                label="Data"
                                icon="fa-calendar"
                                name="date"
                                type="date"
                                defaultValue={formatDateForInput(editingRecord?.date || new Date().toISOString())}
                                required
                            />
                            <FormInput label="MS Dir." icon="fa-hand" name="msRight" defaultValue={editingRecord?.msRight} step="0.1" />
                            <FormInput label="MS Esq." icon="fa-hand" name="msLeft" defaultValue={editingRecord?.msLeft} step="0.1" />
                            <FormInput label="Peito" icon="fa-heart" name="chest" defaultValue={editingRecord?.chest} step="0.1" />
                            <FormInput label="Cintura" icon="fa-ruler" name="waist" defaultValue={editingRecord?.waist} step="0.1" />
                            <FormInput label="Abdómen" icon="fa-ruler" name="abdomen" defaultValue={editingRecord?.abdomen} step="0.1" />
                            <FormInput label="Anca" icon="fa-ruler" name="hips" defaultValue={editingRecord?.hips} step="0.1" />
                            <FormInput label="Coxa Dir." icon="fa-leg" name="thighR" defaultValue={editingRecord?.thighR} step="0.1" />
                            <FormInput label="Coxa Esq." icon="fa-leg" name="thighL" defaultValue={editingRecord?.thighL} step="0.1" />
                        </div>

                        {/* Footer */}
                        <div className="px-0 py-0 mt-6 pt-6 border-t border-gray-200 flex justify-end gap-3">
                            <NewButton
                                type="button"
                                onClick={onClose}
                                variant="ghost"
                                disabled={isSubmitting}
                                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 transition-all"
                            >
                                <i className="fa-duotone fa-xmark mr-1.5"></i>
                                Cancelar
                            </NewButton>
                            <NewButton
                                type="submit"
                                variant="new_primary_rounded"
                                disabled={isSubmitting}
                                icon={isSubmitting ? <InlineSpinner /> : <i className={`fa-duotone ${editingRecord ? 'fa-floppy-disk' : 'fa-plus'}`}></i>}
                                className="px-6 py-2 text-sm shadow-md shadow-primary/20 hover:shadow-primary/30 transition-all"
                            >
                                {isSubmitting ? 'A guardar...' : (editingRecord ? 'Guardar Alterações' : 'Adicionar Perímetro')}
                            </NewButton>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};
