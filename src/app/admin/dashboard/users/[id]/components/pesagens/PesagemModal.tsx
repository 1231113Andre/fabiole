import React from "react";
import { Pesagem } from "../../types";
import { formatDateForInput } from "../../utils";
import NewButton from "@/app/components/newButton";

// Inline spinner component
const InlineSpinner = () => (
    <div className="w-4 h-4 relative">
        <div className="absolute inset-0 rounded-full border-2 border-white/30"></div>
        <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-white animate-spin"></div>
    </div>
);

interface PesagemModalProps {
    isOpen: boolean;
    editingRecord: Partial<Pesagem> | null;
    formData: Partial<Pesagem>;
    error: string | null;
    isSubmitting?: boolean;
    onFieldChange: (field: keyof Pesagem, value: any) => void;
    onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
    onClose: () => void;
}

function FormInput({
    label,
    icon,
    name,
    type = "number",
    value,
    onChange,
    step,
    required,
    placeholder,
    readOnly,
    isAuto,
    showAuto
}: {
    label: string;
    icon: string;
    name: string;
    type?: string;
    value: any;
    onChange: (value: any) => void;
    step?: string;
    required?: boolean;
    placeholder?: string;
    readOnly?: boolean;
    isAuto?: boolean;
    showAuto?: boolean;
}) {
    return (
        <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5 flex items-center gap-1.5">
                <i className={`fa-duotone ${icon} ${isAuto ? 'text-violet-500/70' : 'text-primary/70'} text-[10px]`}></i>
                {label} {required && <span className="text-red-500">*</span>}
                {showAuto && (
                    <span className="ml-auto text-[10px] text-violet-600 font-bold bg-violet-100 px-1.5 py-0.5 rounded">🤖 Auto</span>
                )}
            </label>
            <input
                type={type}
                step={step}
                name={name}
                value={value || ''}
                onChange={(e) => onChange(type === 'number' ? parseFloat(e.target.value) : e.target.value)}
                placeholder={placeholder}
                required={required}
                readOnly={readOnly}
                className={`w-full px-3 py-2 text-sm border rounded-lg outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all ${isAuto ? 'bg-violet-50 border-violet-200 font-bold text-violet-700' :
                    readOnly ? 'bg-gray-50 border-gray-200' : 'border-gray-200'
                    }`}
            />
        </div>
    );
}

export const PesagemModal: React.FC<PesagemModalProps> = ({
    isOpen,
    editingRecord,
    formData,
    error,
    isSubmitting = false,
    onFieldChange,
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
                            <i className={`fa-duotone ${editingRecord?.id ? 'fa-pen-to-square' : 'fa-plus'} text-white text-lg`}></i>
                        </div>
                        <div>
                            <h3 className="font-bold text-xl text-gray-900 flex items-center gap-2">
                                {editingRecord?.id ? 'Editar Pesagem' : 'Nova Pesagem'}
                                {editingRecord?.id && (
                                    <span className="text-xs font-normal text-gray-500">#{editingRecord.id}</span>
                                )}
                            </h3>
                            <p className="text-xs text-gray-600 mt-0.5">Configure todos os parâmetros da avaliação corporal</p>
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

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            {/* Basic Info */}
                            <div className="space-y-3">
                                <div className="flex items-center gap-2 pb-1.5 border-b border-gray-200">
                                    <i className="fa-duotone fa-keyboard text-primary text-xs"></i>
                                    <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider">Entrada Manual</h4>
                                </div>
                                <FormInput
                                    label="Data"
                                    icon="fa-calendar"
                                    name="date"
                                    type="date"
                                    value={formatDateForInput(formData.date || '')}
                                    onChange={(v) => onFieldChange('date', v)}
                                    required
                                />
                                <FormInput
                                    label="Peso (kg)"
                                    icon="fa-weight-scale"
                                    name="peso"
                                    value={formData.peso}
                                    onChange={(v) => onFieldChange('peso', v)}
                                    step="0.01"
                                    placeholder="0.00"
                                />
                                <FormInput
                                    label="Altura (cm)"
                                    icon="fa-ruler-vertical"
                                    name="height"
                                    value={formData.height}
                                    onChange={(v) => onFieldChange('height', v)}
                                    step="0.1"
                                    placeholder="000"
                                />
                                <FormInput
                                    label="% Gordura"
                                    icon="fa-percent"
                                    name="percentualMG"
                                    value={formData.percentualMG}
                                    onChange={(v) => onFieldChange('percentualMG', v)}
                                    step="0.01"
                                    placeholder="0.00%"
                                />
                            </div>

                            {/* Detailed Stats */}
                            <div className="space-y-3">
                                <div className="flex items-center gap-2 pb-1.5 border-b border-gray-200">
                                    <i className="fa-duotone fa-chart-pie text-primary text-xs"></i>
                                    <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider">Composição</h4>
                                </div>
                                <FormInput
                                    label="MM (kg)"
                                    icon="fa-dumbbell"
                                    name="mm"
                                    value={formData.mm}
                                    onChange={(v) => onFieldChange('mm', v)}
                                    step="0.01"
                                    showAuto={!!(formData.peso && (formData.percentualMG || formData.massaOssea))}
                                    isAuto={!!(formData.peso && (formData.percentualMG || formData.massaOssea))}
                                />
                                <FormInput
                                    label="% Água"
                                    icon="fa-droplet"
                                    name="h2o"
                                    value={formData.h2o}
                                    onChange={(v) => onFieldChange('h2o', v)}
                                    step="0.01"
                                    showAuto={!!formData.peso}
                                    isAuto={!!formData.peso}
                                />
                                <FormInput
                                    label="Gord. Visceral"
                                    icon="fa-heart-pulse"
                                    name="gordVisceral"
                                    value={formData.gordVisceral}
                                    onChange={(v) => onFieldChange('gordVisceral', v)}
                                    step="0.01"
                                />
                                <FormInput
                                    label="Idade Meta."
                                    icon="fa-clock"
                                    name="idMetabolica"
                                    value={formData.idMetabolica}
                                    onChange={(v) => onFieldChange('idMetabolica', v)}
                                    step="0.1"
                                />
                                <FormInput
                                    label="Massa Óssea"
                                    icon="fa-bone"
                                    name="massaOssea"
                                    value={formData.massaOssea}
                                    onChange={(v) => onFieldChange('massaOssea', v)}
                                    step="0.01"
                                />
                            </div>

                            {/* Results (Auto) */}
                            <div className="space-y-3">
                                <div className="flex items-center gap-2 pb-1.5 border-b border-gray-200">
                                    <i className="fa-duotone fa-robot text-violet-500 text-xs"></i>
                                    <h4 className="text-xs font-bold text-violet-600 uppercase tracking-wider">Automático</h4>
                                </div>
                                <FormInput
                                    label="IMC"
                                    icon="fa-calculator"
                                    name="imc"
                                    value={formData.imc}
                                    onChange={(v) => onFieldChange('imc', v)}
                                    step="0.1"
                                    readOnly
                                    isAuto
                                />
                                <FormInput
                                    label="Resultado IMC"
                                    icon="fa-chart-line"
                                    name="resultadoIMC"
                                    type="text"
                                    value={formData.resultadoIMC}
                                    onChange={(v) => onFieldChange('resultadoIMC', v)}
                                    readOnly
                                />
                                <FormInput
                                    label="Resultado %MG"
                                    icon="fa-percent"
                                    name="resultadoPercentMG"
                                    type="text"
                                    value={formData.resultadoPercentMG}
                                    onChange={(v) => onFieldChange('resultadoPercentMG', v)}
                                    readOnly
                                />
                                <div className="pt-1">
                                    <label className="block text-xs font-semibold text-gray-700 mb-1.5 flex items-center gap-1.5">
                                        <i className="fa-duotone fa-note-sticky text-primary/70 text-[10px]"></i>
                                        Notas
                                    </label>
                                    <textarea
                                        name="notas"
                                        rows={2}
                                        value={formData.notas || ''}
                                        onChange={(e) => onFieldChange('notas', e.target.value)}
                                        placeholder="Adicione observações ou notas sobre esta pesagem..."
                                        className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all resize-none"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="mt-6 px-6 py-4 border-t border-gray-200 bg-gray-50/50 flex justify-end gap-3">
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
                                icon={isSubmitting ? <InlineSpinner /> : <i className={`fa-duotone ${editingRecord?.id ? 'fa-floppy-disk' : 'fa-plus'}`}></i>}
                                className="px-6 py-2 text-sm shadow-md shadow-primary/20 hover:shadow-primary/30 transition-all"
                            >
                                {isSubmitting ? 'A guardar...' : (editingRecord?.id ? 'Guardar Alterações' : 'Adicionar Pesagem')}
                            </NewButton>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};
