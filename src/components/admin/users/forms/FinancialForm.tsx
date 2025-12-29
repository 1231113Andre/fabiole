import React from "react";

interface FinancialData {
    trainingCredit: number;
    trainingsScheduled: number;
    debtValue: number;
}

interface FinancialFormProps {
    data: FinancialData;
    onChange: (field: keyof FinancialData, value: number) => void;
}

const INPUT_CLASSES = "w-full px-4 py-2.5 text-sm border border-gray-200 rounded-xl bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all duration-200 hover:border-gray-300";
const LABEL_CLASSES = "block text-xs font-semibold text-gray-600 mb-1.5 flex items-center gap-1.5";

export const FinancialForm: React.FC<FinancialFormProps> = React.memo(({ data, onChange }) => {

    const handleChange = (field: keyof FinancialData, value: string) => {
        const numValue = field === 'debtValue' ? parseFloat(value) : parseInt(value);
        onChange(field, isNaN(numValue) ? 0 : numValue);
    };

    return (
        <div className="space-y-3">
            <div className="flex items-center gap-2 pb-1.5 border-b border-gray-100">
                <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-emerald-100 to-green-50 flex items-center justify-center">
                    <i className="fa-duotone fa-wallet text-emerald-600 text-[10px]"></i>
                </div>
                <h4 className="text-xs font-bold text-gray-800 uppercase tracking-wide">Gestão de Contas</h4>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                    <label className={LABEL_CLASSES}>
                        <i className="fa-duotone fa-dumbbell text-emerald-500/70 text-[10px]"></i>
                        Treinos em Crédito
                    </label>
                    <input
                        type="number"
                        step="1"
                        min="0"
                        value={data.trainingCredit ?? 0}
                        onChange={(e) => handleChange('trainingCredit', e.target.value)}
                        className={INPUT_CLASSES}
                        placeholder="0"
                    />
                    <div className="flex gap-2 mt-2 items-start opacity-80">
                        <i className="fa-duotone fa-circle-info text-emerald-500 text-xs mt-0.5"></i>
                        <p className="text-xs text-gray-500 leading-tight">
                            <span className="font-semibold text-gray-700">Acumulativo.</span> Sessões não utilizadas transitam para o mês seguinte.
                        </p>
                    </div>
                </div>
                <div>
                    <label className={LABEL_CLASSES}>
                        <i className="fa-duotone fa-calendar-check text-blue-500/70 text-[10px]"></i>
                        Treinos Agendados
                    </label>
                    <input
                        type="number"
                        value={data.trainingsScheduled ?? 0}
                        onChange={(e) => handleChange('trainingsScheduled', e.target.value)}
                        className={INPUT_CLASSES}
                        placeholder="0"
                    />
                    <div className="flex gap-2 mt-2 items-start opacity-80">
                        <i className="fa-duotone fa-calendar-lines-pen text-blue-500 text-xs mt-0.5"></i>
                        <p className="text-xs text-gray-500 leading-tight">
                            <span className="font-semibold text-gray-700">Em agenda.</span> Número de sessões atualmente marcadas.
                        </p>
                    </div>
                </div>
                <div>
                    <label className={LABEL_CLASSES}>
                        <i className="fa-duotone fa-file-invoice-dollar text-gray-400 text-[10px]"></i>
                        Valor em Dívida (€)
                    </label>
                    <input
                        type="number"
                        step="0.01"
                        value={data.debtValue ?? 0}
                        onChange={(e) => handleChange('debtValue', e.target.value)}
                        className={INPUT_CLASSES}
                        placeholder="0.00"
                    />
                    <div className="flex gap-2 mt-2 items-start opacity-80">
                        <i className="fa-duotone fa-coins text-amber-500 text-xs mt-0.5"></i>
                        <p className="text-xs text-gray-500 leading-tight">
                            <span className="font-semibold text-gray-700">Pendente.</span> Quantia a regularizar pelo cliente.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
});

FinancialForm.displayName = 'FinancialForm';
