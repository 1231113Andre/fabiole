import { CreateUserFormData, INPUT_CLASSES, LABEL_CLASSES } from "./types";

interface FinancialSectionProps {
    formData: CreateUserFormData;
    handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export function FinancialSection({ formData, handleChange }: FinancialSectionProps) {
    return (
        <div className="space-y-3">
            <div className="flex items-center gap-2 pb-1.5 border-b border-gray-100">
                <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-emerald-100 to-green-50 flex items-center justify-center">
                    <i className="fa-duotone fa-coins text-emerald-600 text-[10px]"></i>
                </div>
                <h4 className="text-xs font-bold text-gray-800 uppercase tracking-wide">Dados Financeiros</h4>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                    <label className={LABEL_CLASSES}>
                        <i className="fa-duotone fa-credit-card text-emerald-500/70 text-[10px]"></i>
                        Montante a pagar (€)
                    </label>
                    <input
                        type="number"
                        name="trainingCredit"
                        value={formData.trainingCredit}
                        onChange={handleChange}
                        className={INPUT_CLASSES}
                        min="0"
                        step="0.01"
                        placeholder="0.00"
                    />
                </div>
                <div>
                    <label className={LABEL_CLASSES}>
                        <i className="fa-duotone fa-calendar-check text-blue-500/70 text-[10px]"></i>
                        Treinos Agendados
                    </label>
                    <input
                        type="number"
                        name="trainingsScheduled"
                        value={formData.trainingsScheduled}
                        onChange={handleChange}
                        className={INPUT_CLASSES}
                        min="0"
                        placeholder="0"
                    />
                </div>
                <div>
                    <label className={LABEL_CLASSES}>
                        <i className="fa-duotone fa-triangle-exclamation text-red-500/70 text-[10px]"></i>
                        Valor em Dívida (€)
                    </label>
                    <input
                        type="number"
                        name="debtValue"
                        value={formData.debtValue}
                        onChange={handleChange}
                        className={INPUT_CLASSES}
                        min="0"
                        step="0.01"
                        placeholder="0.00"
                    />
                </div>
            </div>
        </div>
    );
}
