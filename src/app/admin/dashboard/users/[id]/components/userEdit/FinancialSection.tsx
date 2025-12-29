import React from "react";
import { UserData } from "../../types";

interface FinancialSectionProps {
    user: UserData;
    onChange: (field: keyof UserData, value: any) => void;
}

const inputClasses = "w-full px-4 py-2.5 text-sm border border-gray-200 rounded-xl bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all duration-200 hover:border-gray-300";
const labelClasses = "block text-xs font-semibold text-gray-600 mb-1.5 flex items-center gap-1.5";

export const FinancialSection: React.FC<FinancialSectionProps> = React.memo(({ user, onChange }) => {
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
                    <label className={labelClasses}>
                        <i className="fa-duotone fa-dumbbell text-emerald-500/70 text-[10px]"></i>
                        Treinos em Crédito
                    </label>
                    <input
                        type="number"
                        step="1"
                        min="0"
                        value={user.trainingCredit}
                        onChange={(e) => onChange('trainingCredit', parseInt(e.target.value) || 0)}
                        className={inputClasses}
                        placeholder="0"
                    />
                </div>
                <div>
                    <label className={labelClasses}>
                        <i className="fa-duotone fa-calendar-check text-blue-500/70 text-[10px]"></i>
                        Treinos Agendados
                    </label>
                    <input
                        type="number"
                        value={user.trainingsScheduled}
                        onChange={(e) => onChange('trainingsScheduled', parseInt(e.target.value))}
                        className={inputClasses}
                        placeholder="0"
                    />
                </div>
                <div>
                    <label className={labelClasses}>
                        <i className="fa-duotone fa-triangle-exclamation text-red-500/70 text-[10px]"></i>
                        Valor em Dívida (€)
                    </label>
                    <input
                        type="number"
                        step="0.01"
                        value={user.debtValue}
                        onChange={(e) => onChange('debtValue', parseFloat(e.target.value))}
                        className={inputClasses}
                        placeholder="0.00"
                    />
                </div>
            </div>
        </div>
    );
});

FinancialSection.displayName = 'FinancialSection';

