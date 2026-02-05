import React from "react";
import { Pesagem } from "../../types";
import { formatDateForInput } from "../../utils";
import NewButton from "@/app/components/newButton";
import { classifySMI } from "@/lib/body-metrics";
import { Modal } from "@/components/ui/Modal";

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
    manualOverrides?: Set<keyof Pesagem>;
    gender?: string | null;
    onFieldChange: (field: keyof Pesagem, value: any) => void;
    onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
    onClose: () => void;
    onClearOverride?: (field: keyof Pesagem) => void;
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
    isAutoField,
    isManuallyOverridden,
    onClearOverride,
    canAutoCalculate
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
    isAutoField?: boolean;
    isManuallyOverridden?: boolean;
    onClearOverride?: () => void;
    canAutoCalculate?: boolean;
}) {
    // Determine display state
    const showAutoMode = isAutoField && !isManuallyOverridden && canAutoCalculate;
    const showManualMode = isAutoField && isManuallyOverridden;

    return (
        <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5 flex items-center gap-1.5">
                <i className={`fa-duotone ${icon} ${showAutoMode ? 'text-violet-500/70' : 'text-primary/70'} text-[10px]`}></i>
                {label} {required && <span className="text-red-500">*</span>}
                {isAutoField && (
                    <span className="ml-auto flex items-center gap-1">
                        {showManualMode ? (
                            <button
                                type="button"
                                onClick={onClearOverride}
                                className="text-[9px] text-amber-600 font-bold bg-amber-100 hover:bg-amber-200 px-1.5 py-0.5 rounded transition-colors flex items-center gap-1 cursor-pointer"
                                title="Clique para restaurar cálculo automático"
                            >
                                <i className="fa-duotone fa-pen-to-square text-[8px]"></i>
                                Manual
                                <i className="fa-duotone fa-rotate-right text-[8px] opacity-70"></i>
                            </button>
                        ) : canAutoCalculate ? (
                            <button
                                type="button"
                                onClick={onClearOverride}
                                className="text-[9px] text-violet-600 font-bold bg-violet-100 hover:bg-violet-200 px-1.5 py-0.5 rounded flex items-center gap-1 cursor-pointer transition-colors"
                                title="Valor calculado automaticamente. Clique para recalcular."
                            >
                                <i className="fa-duotone fa-robot text-[8px]"></i>
                                Auto
                                <i className="fa-duotone fa-rotate text-[7px] opacity-70"></i>
                            </button>
                        ) : (
                            <span className="text-[9px] text-gray-400 font-medium bg-gray-100 px-1.5 py-0.5 rounded">
                                Aguarda dados
                            </span>
                        )}
                    </span>
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
                className={`w-full px-3 py-2 text-sm border rounded-lg outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all ${showAutoMode ? 'bg-violet-50 border-violet-200 font-bold text-violet-700' :
                    showManualMode ? 'bg-amber-50 border-amber-200 font-bold text-amber-700' :
                        'border-gray-200'
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
    manualOverrides = new Set(),
    gender = null,
    onFieldChange,
    onSubmit,
    onClose,
    onClearOverride
}) => {
    return (
        <Modal isOpen={isOpen} onClose={onClose} size="6xl">
            <Modal.Header
                title={editingRecord?.id ? `Editar Pesagem #${editingRecord.id}` : 'Nova Pesagem'}
                description="Configure todos os parâmetros da avaliação corporal"
                icon={editingRecord?.id ? 'fa-pen-to-square' : 'fa-plus'}
                onClose={onClose}
            />

            <Modal.Body>
                <form id="pesagem-form" onSubmit={onSubmit} className="h-full">
                    {error && (
                        <div className="mb-4 p-3 bg-red-50 text-red-700 text-xs rounded-lg border border-red-200 flex items-center gap-2 shadow-sm">
                            <div className="w-6 h-6 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                                <i className="fa-duotone fa-circle-exclamation text-red-600 text-xs"></i>
                            </div>
                            <span className="font-semibold">{error}</span>
                        </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
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
                                isAutoField
                                isManuallyOverridden={manualOverrides.has('mm')}
                                canAutoCalculate={!!(formData.peso && (formData.percentualMG || formData.massaOssea))}
                                onClearOverride={() => onClearOverride?.('mm')}
                            />
                            <FormInput
                                label="% Água"
                                icon="fa-droplet"
                                name="h2o"
                                value={formData.h2o}
                                onChange={(v) => onFieldChange('h2o', v)}
                                step="0.01"
                                isAutoField
                                isManuallyOverridden={manualOverrides.has('h2o')}
                                canAutoCalculate={!!formData.peso}
                                onClearOverride={() => onClearOverride?.('h2o')}
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
                                isAutoField
                                isManuallyOverridden={manualOverrides.has('imc')}
                                canAutoCalculate={!!(formData.peso && formData.height)}
                                onClearOverride={() => onClearOverride?.('imc')}
                            />
                            <FormInput
                                label="Resultado IMC"
                                icon="fa-chart-line"
                                name="resultadoIMC"
                                type="text"
                                value={formData.resultadoIMC}
                                onChange={(v) => onFieldChange('resultadoIMC', v)}
                                isAutoField
                                isManuallyOverridden={manualOverrides.has('resultadoIMC')}
                                canAutoCalculate={!!(formData.peso && formData.height)}
                                onClearOverride={() => onClearOverride?.('resultadoIMC')}
                            />
                            <FormInput
                                label="Resultado %MG"
                                icon="fa-percent"
                                name="resultadoPercentMG"
                                type="text"
                                value={formData.resultadoPercentMG}
                                onChange={(v) => onFieldChange('resultadoPercentMG', v)}
                                isAutoField
                                isManuallyOverridden={manualOverrides.has('resultadoPercentMG')}
                                canAutoCalculate={!!formData.percentualMG}
                                onClearOverride={() => onClearOverride?.('resultadoPercentMG')}
                            />
                            <FormInput
                                label="SMI (kg/m²)"
                                icon="fa-dumbbell"
                                name="smi"
                                value={formData.smi}
                                onChange={(v) => onFieldChange('smi', v)}
                                step="0.01"
                                isAutoField
                                isManuallyOverridden={manualOverrides.has('smi')}
                                canAutoCalculate={!!(formData.mm != null && formData.height != null)}
                                onClearOverride={() => onClearOverride?.('smi')}
                            />
                            <div className="pt-1">
                                <label className="block text-xs font-semibold text-gray-700 mb-1.5 flex items-center gap-1.5">
                                    <i className="fa-duotone fa-chart-line text-violet-500/70 text-[10px]"></i>
                                    SMI Res.
                                </label>
                                <div
                                    className="w-full px-3 py-2 text-sm border rounded-lg bg-violet-50 border-violet-200 font-bold text-violet-700"
                                    aria-readonly
                                >
                                    {formData.smi != null && gender
                                        ? classifySMI(formData.smi as number, gender)
                                        : '-'}
                                </div>
                                <p className="text-[10px] text-gray-500 mt-1">Calculado automaticamente a partir de SMI e género.</p>
                            </div>
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
                </form>
            </Modal.Body>

            <Modal.Footer>
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
                    form="pesagem-form"
                    variant="new_primary_rounded"
                    disabled={isSubmitting}
                    icon={isSubmitting ? <InlineSpinner /> : <i className={`fa-duotone ${editingRecord?.id ? 'fa-floppy-disk' : 'fa-plus'}`}></i>}
                    className="px-6 py-2 text-sm shadow-md shadow-primary/20 hover:shadow-primary/30 transition-all"
                >
                    {isSubmitting ? 'A guardar...' : (editingRecord?.id ? 'Guardar Alterações' : 'Adicionar Pesagem')}
                </NewButton>
            </Modal.Footer>
        </Modal>
    );
};
