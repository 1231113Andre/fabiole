import React, { useState, useEffect } from "react";
import { Avaliacao } from "../../types";
import { formatDateForInput } from "../../utils";
import NewButton from "@/app/components/newButton";
import { classifyMileResult, classifyPushUps, calculateAge, getMileResultStyle } from "@/lib/body-metrics";

// Inline spinner component
const InlineSpinner = () => (
    <div className="w-4 h-4 relative">
        <div className="absolute inset-0 rounded-full border-2 border-white/30"></div>
        <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-white animate-spin"></div>
    </div>
);

interface AvaliacaoModalProps {
    isOpen: boolean;
    editingRecord: Avaliacao | null;
    error: string | null;
    isSubmitting?: boolean;
    onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
    onClose: () => void;
    gender?: string;
    userBirth?: string;
}

function FormInput({
    label,
    icon,
    name,
    type = "number",
    defaultValue,
    placeholder,
    required,
    onChange,
    readOnly,
    extra
}: {
    label: string;
    icon: string;
    name: string;
    type?: string;
    defaultValue: any;
    placeholder?: string;
    required?: boolean;
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
    readOnly?: boolean;
    extra?: React.ReactNode;
}) {
    return (
        <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5 flex items-center gap-1.5">
                <i className={`fa-duotone ${icon} text-primary/70 text-[10px]`}></i>
                {label} {required && <span className="text-red-500">*</span>}
            </label>
            <div className="relative">
                <input
                    type={type}
                    name={name}
                    defaultValue={defaultValue || ''}
                    placeholder={placeholder}
                    required={required}
                    onChange={onChange}
                    readOnly={readOnly}
                    className={`w-full px-3 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all ${readOnly ? 'bg-gray-50 text-gray-500' : ''}`}
                />
                {extra}
            </div>
        </div>
    );
}

export const AvaliacaoModal: React.FC<AvaliacaoModalProps> = ({
    isOpen,
    editingRecord,
    error,
    isSubmitting = false,
    onSubmit,
    onClose,
    gender,
    userBirth
}) => {
    const [mileTime, setMileTime] = useState(editingRecord?.mile || "");
    const [mileResult, setMileResult] = useState(editingRecord?.mileResult || "");
    const [pushUpsCount, setPushUpsCount] = useState<string>(editingRecord?.pushUps?.toString() || "");
    const [pushUpsResult, setPushUpsResult] = useState(editingRecord?.pushUpsResult || "");

    useEffect(() => {
        if (isOpen) {
            setMileTime(editingRecord?.mile || "");
            const currentMileResult = editingRecord?.mileResult || "";
            setMileResult(currentMileResult);

            // Push-ups
            setPushUpsCount(editingRecord?.pushUps?.toString() || "");
            const currentPushUpsResult = editingRecord?.pushUpsResult || "";
            setPushUpsResult(currentPushUpsResult);

            // Auto-calc missing results on legacy records
            if (userBirth) {
                const age = calculateAge(userBirth);

                // Mile legacy calc
                if (editingRecord?.mile && !currentMileResult) {
                    const calcResult = classifyMileResult(editingRecord.mile, age, gender);
                    if (calcResult) setMileResult(calcResult);
                }

                // Push-ups legacy calc
                if (editingRecord?.pushUps && !currentPushUpsResult) {
                    const calcResult = classifyPushUps(editingRecord.pushUps, age, gender);
                    if (calcResult) setPushUpsResult(calcResult);
                }
            }
        }
    }, [isOpen, editingRecord, userBirth, gender]);

    // Auto-calculate MILE result
    const handleMileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const time = e.target.value;
        setMileTime(time);

        if (time && time.includes(':') && userBirth) {
            const age = calculateAge(userBirth);
            const result = classifyMileResult(time, age, gender);
            setMileResult(result);
        } else {
            setMileResult("");
        }
    };

    // Auto-calculate PUSH-UPS result
    const handlePushUpsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        setPushUpsCount(val);
        const count = parseInt(val);

        if (!isNaN(count) && userBirth) {
            const age = calculateAge(userBirth);
            const result = classifyPushUps(count, age, gender);
            setPushUpsResult(result);
        } else {
            setPushUpsResult("");
        }
    };

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
                                {editingRecord ? 'Editar Avaliação' : 'Nova Avaliação'}
                                {editingRecord && (
                                    <span className="text-xs font-normal text-gray-500">#{editingRecord.id}</span>
                                )}
                            </h3>
                            <p className="text-xs text-gray-600 mt-0.5">Configure todos os parâmetros da avaliação física</p>
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

                            {/* Push Ups Group - Input + Auto Result */}
                            <div className="space-y-2">
                                <FormInput
                                    label="Flexões"
                                    icon="fa-hand-fist"
                                    name="pushUps"
                                    defaultValue={pushUpsCount}
                                    onChange={handlePushUpsChange}
                                />
                                {pushUpsResult && (
                                    <div className="relative">
                                        <input type="hidden" name="pushUpsResult" value={pushUpsResult} />
                                        <div className={`w-full px-3 py-1.5 text-xs text-center border border-transparent rounded-md font-bold uppercase tracking-wider ${getMileResultStyle(pushUpsResult)} opacity-90`}>
                                            {pushUpsResult}
                                        </div>
                                    </div>
                                )}
                            </div>

                            <FormInput label="Abdominais" icon="fa-dumbbell" name="sitUps" defaultValue={editingRecord?.sitUps} />

                            <FormInput
                                label="Tempo Milha (mm:ss)"
                                icon="fa-stopwatch"
                                name="mile"
                                type="text"
                                defaultValue={mileTime}
                                onChange={handleMileChange}
                                placeholder="00:00"
                            />

                            {/* Auto-calculated Result Field */}
                            <div>
                                <label className="block text-xs font-semibold text-gray-700 mb-1.5 flex items-center gap-1.5">
                                    <i className="fa-duotone fa-chart-simple text-primary/70 text-[10px]"></i>
                                    Resultado Milha (Auto)
                                </label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        name="mileResult"
                                        value={mileResult}
                                        readOnly
                                        className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg outline-none bg-gray-50 text-gray-600 font-medium cursor-not-allowed"
                                        placeholder="Calculado automaticamente"
                                    />
                                    {mileResult && (
                                        <div className={`absolute right-2 top-1/2 -translate-y-1/2 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${getMileResultStyle(mileResult)}`}>
                                            {mileResult}
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="md:col-span-2 lg:col-span-3">
                                <label className="block text-xs font-semibold text-gray-700 mb-1.5 flex items-center gap-1.5">
                                    <i className="fa-duotone fa-note-sticky text-primary/70 text-[10px]"></i>
                                    Notas
                                </label>
                                <textarea
                                    name="notes"
                                    rows={2}
                                    defaultValue={editingRecord?.notes || ''}
                                    placeholder="Adicione observações sobre esta avaliação..."
                                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all resize-none"
                                />
                            </div>
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
                                {isSubmitting ? 'A guardar...' : (editingRecord ? 'Guardar Alterações' : 'Adicionar Avaliação')}
                            </NewButton>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};
