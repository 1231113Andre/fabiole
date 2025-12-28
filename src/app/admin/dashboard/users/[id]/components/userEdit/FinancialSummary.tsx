import React from "react";
import { UserData } from "../../types";

interface FinancialSummaryProps {
    user: UserData;
}

const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('pt-PT', { style: 'currency', currency: 'EUR' }).format(val);
};

export const FinancialSummary: React.FC<FinancialSummaryProps> = React.memo(({ user }) => {
    return (
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-5 h-full">
            <div className="flex gap-4 mb-4">
                <div className="w-10 h-10 rounded-full bg-white border border-gray-100 shadow-sm flex items-center justify-center flex-shrink-0">
                    <i className="fa-duotone fa-wallet text-emerald-500 text-xl"></i>
                </div>
                <div className="flex flex-col justify-center">
                    <p className="text-sm font-bold text-gray-900 leading-tight">Resumo Financeiro</p>
                    <p className="text-[10px] text-gray-500 uppercase tracking-wide font-medium mt-0.5">Estado da conta</p>
                </div>
            </div>

            <div className="space-y-3">
                {/* Estado - with detailed description */}
                <div className="border-b border-gray-200/60 pb-3">
                    <div className="flex justify-between items-center text-sm mb-1.5">
                        <span className="text-gray-600 font-semibold flex items-center gap-2">
                            <i className={`fa-duotone text-xs ${user.paid === 'PAGO' ? 'fa-circle-check text-emerald-500' :
                                user.paid === 'PENDENTE' ? 'fa-circle-exclamation text-red-500' :
                                    user.paid === 'EM ANÁLISE' ? 'fa-hourglass-clock text-amber-500' :
                                        'fa-circle-question text-gray-400'
                                }`}></i>
                            Estado
                        </span>
                        <span className={`font-bold ${user.paid === 'PAGO' ? 'text-emerald-600' :
                            user.paid === 'PENDENTE' ? 'text-red-500' :
                                user.paid === 'EM ANÁLISE' ? 'text-amber-500' :
                                    'text-gray-400'
                            }`}>
                            {user.paid && user.paid !== '-' ? user.paid : '-'}
                        </span>
                    </div>
                    <p className={`text-xs leading-tight ${user.paid === 'PAGO' ? 'text-emerald-600/80' :
                        user.paid === 'PENDENTE' ? 'text-red-500/80' :
                            user.paid === 'EM ANÁLISE' ? 'text-amber-600/80' :
                                'text-gray-400'
                        }`}>
                        {user.paid === 'PAGO' && 'Pagamento confirmado. Acesso total ativo.'}
                        {user.paid === 'PENDENTE' && 'Aguarda regularização da mensalidade.'}
                        {user.paid === 'EM ANÁLISE' && 'Em verificação pelo Administrador.'}
                        {(!user.paid || user.paid === '-') && 'Status não definido.'}
                    </p>
                </div>

                {/* Crédito - with description */}
                <div className="border-b border-gray-200/60 pb-3">
                    <div className="flex justify-between items-center text-sm mb-1">
                        <span className="text-gray-600 font-semibold flex items-center gap-2">
                            <i className="fa-duotone fa-coins text-emerald-500/70 text-xs"></i>
                            Montante a pagar
                        </span>
                        <span className="font-bold text-emerald-600">{formatCurrency(user.trainingCredit || 0)}</span>
                    </div>
                    <p className="text-xs text-gray-500 leading-tight">
                        Saldo disponível para sessões de treino.
                    </p>
                </div>

                {/* Dívida - color matches payment status */}
                <div className="border-b border-gray-200/60 pb-3">
                    <div className="flex justify-between items-center text-sm mb-1">
                        <span className="text-gray-600 font-semibold flex items-center gap-2">
                            <i className={`fa-duotone fa-file-invoice-dollar text-xs ${user.paid === 'PAGO' ? 'text-emerald-500' :
                                user.paid === 'PENDENTE' ? 'text-red-500' :
                                    user.paid === 'EM ANÁLISE' ? 'text-amber-500' :
                                        'text-gray-400'
                                }`}></i>
                            Valor em Dívida
                        </span>
                        <span className={`font-bold ${user.paid === 'PAGO' ? 'text-emerald-600' :
                            user.paid === 'PENDENTE' ? 'text-red-500' :
                                user.paid === 'EM ANÁLISE' ? 'text-amber-500' :
                                    'text-gray-400'
                            }`}>
                            {formatCurrency(user.debtValue || 0)}
                        </span>
                    </div>
                    <p className={`text-xs leading-tight ${user.paid === 'PAGO' ? 'text-emerald-600/80' :
                        user.paid === 'PENDENTE' ? 'text-red-500/80' :
                            user.paid === 'EM ANÁLISE' ? 'text-amber-600/80' :
                                'text-gray-500'
                        }`}>
                        {user.paid === 'PAGO' && 'Conta regularizada.'}
                        {user.paid === 'PENDENTE' && 'Valores pendentes a regularizar.'}
                        {user.paid === 'EM ANÁLISE' && 'Aguarda verificação de pagamento.'}
                        {(!user.paid || user.paid === '-') && 'Status de pagamento não definido.'}
                    </p>
                </div>

                {/* Agendados - with info */}
                <div className="border-b border-gray-200/60 pb-3">
                    <div className="flex justify-between items-center text-sm mb-1">
                        <span className="text-gray-600 font-semibold flex items-center gap-2">
                            <i className={`fa-duotone fa-calendar-check text-xs ${(user.trainingsScheduled || 0) > 0 ? 'text-blue-500' : 'text-gray-400'}`}></i>
                            Treinos Agendados
                        </span>
                        <span className={`font-bold ${(user.trainingsScheduled || 0) > 0 ? 'text-blue-600' : 'text-gray-400'}`}>
                            {user.trainingsScheduled || 0}
                        </span>
                    </div>
                    <p className="text-xs text-gray-500 leading-tight">
                        {(user.trainingsScheduled || 0) > 0
                            ? `${user.trainingsScheduled} sessão(ões) marcada(s).`
                            : 'Nenhum treino agendado.'}
                    </p>
                </div>

                {/* Última atualização */}
                <div className="flex justify-between items-center text-xs pt-3 mt-3 border-t border-gray-200">
                    <span className="text-gray-500 font-semibold flex items-center gap-1.5">
                        <i className="fa-duotone fa-clock-rotate-left text-gray-400"></i>
                        Última atualização
                    </span>
                    <span className="text-gray-900 font-bold font-mono bg-gray-100 px-2 py-0.5 rounded border border-gray-200">
                        {user.updatedAt ? new Date(user.updatedAt).toLocaleString('pt-PT', {
                            timeZone: 'Europe/Lisbon',
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                        }) : '-'}
                    </span>
                </div>
            </div>
        </div>
    );
});

FinancialSummary.displayName = 'FinancialSummary';

