import React from "react";
import { Pesagem } from "../../types";
import { formatDateForInput } from "../../utils";
import NewButton from "@/app/components/newButton";
import { classifySMI, calculateSMIFromLimbs } from "@/lib/body-metrics";
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
        <div className="space-y-1">
            <label className="flex items-center justify-between text-[11px] font-semibold text-gray-700">
                <span className="flex items-center gap-1.5">
                    <i className={`fa-duotone ${icon} ${showAutoMode ? 'text-violet-500' : showManualMode ? 'text-amber-500' : 'text-primary'} text-[10px]`}></i>
                    {label} {required && <span className="text-red-500 text-xs">*</span>}
                </span>
                {isAutoField && (
                    <span className="flex items-center">
                        {showManualMode ? (
                            <button
                                type="button"
                                onClick={onClearOverride}
                                className="text-[9px] font-bold text-amber-600 bg-amber-50 hover:bg-amber-100 border border-amber-200 px-1.5 py-0.5 rounded flex items-center gap-1 transition-all"
                                title="Clique para restaurar cálculo automático"
                            >
                                <i className="fa-solid fa-pen text-[7px]"></i>
                                Manual
                            </button>
                        ) : canAutoCalculate ? (
                            <span className="text-[9px] font-bold text-violet-600 bg-violet-50 border border-violet-200 px-1.5 py-0.5 rounded flex items-center gap-1">
                                <i className="fa-solid fa-robot text-[7px]"></i>
                                Auto
                            </span>
                        ) : (
                            <span className="text-[9px] font-medium text-gray-400 bg-gray-50 border border-gray-200 px-1.5 py-0.5 rounded">
                                Aguarda
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
                className={`w-full px-2.5 py-1.5 text-sm border rounded-md outline-none focus:ring-2 transition-all ${showAutoMode
                    ? 'bg-violet-50/50 border-violet-300 focus:border-violet-400 focus:ring-violet-200 text-violet-900 font-semibold'
                    : showManualMode
                        ? 'bg-amber-50/50 border-amber-300 focus:border-amber-400 focus:ring-amber-200 text-amber-900 font-semibold'
                        : 'bg-white border-gray-300 focus:border-primary focus:ring-primary/20 text-gray-900'
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
    // Auto-calculate SMI when limbs or height change
    React.useEffect(() => {
        if (manualOverrides.has('smi')) return;

        const { msRight, msLeft, miRight, miLeft, height, mm } = formData;

        // Try new formula (Attributes + Height)
        const smiFromLimbs = calculateSMIFromLimbs(
            msRight, msLeft, miRight, miLeft, height
        );

        if (smiFromLimbs !== null) {
            onFieldChange('smi', smiFromLimbs);
        } else if (mm && height && height > 0) {
            // Fallback to old formula
            const hM = height / 100;
            const bmiSmi = mm / (hM * hM);
            onFieldChange('smi', parseFloat(bmiSmi.toFixed(2)));
        } else {
            // Null reset: clear the SMI field if no valid data
            onFieldChange('smi', null);
        }
    }, [formData.msRight, formData.msLeft, formData.miRight, formData.miLeft, formData.height, formData.mm, manualOverrides]);

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
                        <div className="mb-3 p-2.5 bg-red-50 text-red-700 text-xs rounded-md border border-red-200 flex items-center gap-2">
                            <i className="fa-solid fa-circle-exclamation text-red-600 text-sm"></i>
                            <span className="font-semibold">{error}</span>
                        </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {/* Massa muscular membros – po lewej */}
                        <div className="space-y-2.5 order-1">
                            <div className="flex items-center gap-2 pb-1 border-b border-violet-200">
                                <i className="fa-solid fa-person-arms-up text-violet-500 text-xs"></i>
                                <h4 className="text-[11px] font-bold text-violet-600 uppercase tracking-wide">Massa muscular membros (kg)</h4>
                            </div>
                            <div className="grid grid-cols-2 gap-x-3 gap-y-2.5">
                                <div className="space-y-2 rounded-lg bg-violet-50/50 border border-violet-200/70 p-2.5">
                                    <div className="text-[10px] font-bold text-violet-700 uppercase tracking-wider text-center pb-0.5 border-b border-violet-200">Direito</div>
                                    <FormInput
                                        label="MS"
                                        icon="fa-hand-back-fist"
                                        name="msRight"
                                        value={formData.msRight}
                                        onChange={(v) => onFieldChange('msRight', v)}
                                        step="0.01"
                                    />
                                    <FormInput
                                        label="MI"
                                        icon="fa-shoe-prints"
                                        name="miRight"
                                        value={formData.miRight}
                                        onChange={(v) => onFieldChange('miRight', v)}
                                        step="0.01"
                                    />
                                </div>
                                <div className="space-y-2 rounded-lg bg-violet-50/50 border border-violet-200/70 p-2.5">
                                    <div className="text-[10px] font-bold text-violet-700 uppercase tracking-wider text-center pb-0.5 border-b border-violet-200">Esquerdo</div>
                                    <FormInput
                                        label="MS"
                                        icon="fa-hand-back-fist"
                                        name="msLeft"
                                        value={formData.msLeft}
                                        onChange={(v) => onFieldChange('msLeft', v)}
                                        step="0.01"
                                    />
                                    <FormInput
                                        label="MI"
                                        icon="fa-shoe-prints"
                                        name="miLeft"
                                        value={formData.miLeft}
                                        onChange={(v) => onFieldChange('miLeft', v)}
                                        step="0.01"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Entrada Manual */}
                        <div className="space-y-2.5 order-2">
                            <div className="flex items-center gap-2 pb-1 border-b border-gray-200">
                                <i className="fa-solid fa-keyboard text-primary text-xs"></i>
                                <h4 className="text-[11px] font-bold text-gray-700 uppercase tracking-wide">Entrada Manual</h4>
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

                        {/* Composição */}
                        <div className="space-y-2.5 order-3">
                            <div className="flex items-center gap-2 pb-1 border-b border-gray-200">
                                <i className="fa-solid fa-chart-pie text-primary text-xs"></i>
                                <h4 className="text-[11px] font-bold text-gray-700 uppercase tracking-wide">Composição</h4>
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

                        {/* Automático + Notas */}
                        <div className="space-y-2.5 order-4">
                            <div className="flex items-center gap-2 pb-1 border-b border-violet-200">
                                <i className="fa-solid fa-robot text-violet-500 text-xs"></i>
                                <h4 className="text-[11px] font-bold text-violet-600 uppercase tracking-wide">Automático</h4>
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
                                canAutoCalculate={!!((formData.msRight && formData.msLeft && formData.miRight && formData.miLeft && formData.height) || (formData.mm && formData.height))}
                                onClearOverride={() => onClearOverride?.('smi')}
                            />
                            <div className="space-y-1">
                                <label className="flex items-center gap-1.5 text-[11px] font-semibold text-gray-700">
                                    <i className="fa-solid fa-chart-line text-violet-500 text-[10px]"></i>
                                    SMI Resultado
                                </label>
                                <div className="w-full px-2.5 py-1.5 text-sm border rounded-md bg-violet-50/50 border-violet-300 font-semibold text-violet-900">
                                    {formData.smi != null && gender
                                        ? classifySMI(formData.smi as number, gender)
                                        : '-'}
                                </div>
                                <p className="text-[10px] text-gray-500">Auto-calculado de SMI e género</p>
                            </div>
                            <div className="space-y-1">
                                <label className="flex items-center gap-1.5 text-[11px] font-semibold text-gray-700">
                                    <i className="fa-solid fa-note-sticky text-primary text-[10px]"></i>
                                    Notas
                                </label>
                                <textarea
                                    name="notas"
                                    rows={2}
                                    value={formData.notas || ''}
                                    onChange={(e) => onFieldChange('notas', e.target.value)}
                                    placeholder="Observações..."
                                    className="w-full px-2.5 py-1.5 text-sm border border-gray-300 rounded-md outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none"
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
