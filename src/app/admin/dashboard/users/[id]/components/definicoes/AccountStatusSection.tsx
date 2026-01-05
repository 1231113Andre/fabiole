"use client";

import { useState, useRef, useEffect } from "react";
import NewButton from "@/app/components/newButton";
import { ButtonSpinner } from "@/app/admin/components/LoadingStates";
import { RoleBadge } from "@/app/admin/components/RoleBadge";
import { useSession } from "@/lib/react-query/hooks/useAuth";
import { useAdminMutations } from "@/lib/react-query/hooks/useAdminMutations";
import {
    AccountStatus,
    STATUS_CONFIG,
    STATUS_OPTIONS,
    getStatusConfig
} from "@/app/admin/constants/statusConfig";

interface Props {
    userId: string;
    currentStatus: string;
    statusChangedBy?: string | null;
    statusChangedAt?: string | null;
    statusReason?: string | null;
    isOpen: boolean;
    onToggle: () => void;
    onStatusChanged: (newStatus: string) => void;
    userName: string;
    userSurname?: string;
    userEmail: string;
    userRole: string;
    userCreatedAt?: string | Date;
    userAvatarUrl?: string | null;
    userGender?: string | null;
    userDebt?: number;
    userCredits?: number;
    userScheduled?: number;
    userPaid?: string;
}

export function AccountStatusSection({
    userId,
    userName,
    userSurname,
    userEmail,
    userRole,
    userCreatedAt,
    userAvatarUrl,
    userGender,
    userDebt = 0,
    userCredits = 0,
    userScheduled = 0,
    userPaid = 'PENDENTE',
    currentStatus,
    statusChangedBy,
    statusChangedAt,
    statusReason,
    isOpen,
    onToggle,
    onStatusChanged
}: Props) {
    const { data: sessionData } = useSession();
    const adminEmail = sessionData?.user?.email || 'admin@fabiole.com';


    const { updateStatus } = useAdminMutations(userId, { showToasts: false });

    // isUpdating is now driven by the mutation status
    const isUpdating = updateStatus.isPending;
    const [selectedStatus, setSelectedStatus] = useState<AccountStatus>((currentStatus as AccountStatus) || 'ACTIVE');
    const [error, setError] = useState<string | null>(null);
    const [sendNotification, setSendNotification] = useState(true);
    const [reason, setReason] = useState(statusReason || '');

    // Sync state with props if they change externally (e.g. from parent refresh)
    useEffect(() => {
        if (currentStatus) {
            setSelectedStatus(currentStatus as AccountStatus);
            setReason(statusReason || '');
        }
    }, [currentStatus, statusReason]);

    // Get config for current status
    const currentConfig = getStatusConfig(currentStatus);
    const selectedConfig = getStatusConfig(selectedStatus);

    const handleStatusChange = async () => {
        if (selectedStatus === currentStatus) return;
        setError(null);

        try {
            await updateStatus.mutateAsync({
                userId,
                status: selectedStatus,
                sendNotification,
                reason: reason
            });

            // Call prop to update parent optimistic state if needed
            onStatusChanged(selectedStatus);
        } catch (err: any) {
            setError(err.message || 'Erro ao atualizar status');
        }
    };

    return (
        <div className="rounded-2xl border border-stroke bg-white shadow-default overflow-hidden">
            <button
                onClick={onToggle}
                className="w-full flex items-center justify-between p-6 hover:bg-gray-50 transition-colors cursor-pointer border-none bg-transparent text-left"
            >
                <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                        <i className="fa-duotone fa-user-gear text-xl"></i>
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-black">Estado atual da conta</h3>
                        <p className="text-sm text-muted-foreground flex items-center gap-1.5 mt-0.5">
                            Atualmente status:
                            <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wide ${currentConfig.badgeBg} ${currentConfig.badgeText}`}>
                                <i className={`fa-duotone ${currentConfig.icon}`} />
                                {currentConfig.badgeLabel}
                            </span>
                        </p>
                    </div>
                </div>
                <i className={`fa-duotone fa-chevron-down text-gray-400 transition-transform ${isOpen ? "rotate-180" : ""}`}></i>
            </button>

            <div className={`grid transition-all duration-300 ease-in-out ${isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}>
                <div className="overflow-hidden">
                    <div className="px-6 pb-6 border-t border-stroke">
                        {/* Current Status Info - Top */}
                        {statusChangedBy && (
                            <div className="mt-4 mb-6 text-xs text-gray-500 flex items-center gap-2">
                                <i className="fa-duotone fa-clock-rotate-left" />
                                <span>
                                    Última alteração por <strong>{statusChangedBy}</strong>
                                    {statusChangedAt && (
                                        <> em {new Date(statusChangedAt).toLocaleDateString('pt-PT', {
                                            day: 'numeric',
                                            month: 'long',
                                            year: 'numeric',
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        })}</>
                                    )}
                                </span>
                            </div>
                        )}

                        {/* Ban Reason Display */}
                        {currentStatus === 'BANNED' && statusReason && (
                            <div className="mb-6 p-4 bg-red-50 rounded-xl border border-red-100 flex items-start gap-3">
                                <div className="shrink-0 mt-0.5">
                                    <i className="fa-duotone fa-ban text-red-500 text-lg"></i>
                                </div>
                                <div>
                                    <h4 className="text-sm font-bold text-red-800 mb-1">Conta Banida Permanentemente</h4>
                                    <p className="text-xs text-red-600/90 leading-relaxed">
                                        <span className="font-semibold text-red-700">Motivo do bloqueio:</span> {statusReason}
                                    </p>
                                </div>
                            </div>
                        )}

                        <div className="flex flex-col xl:flex-row gap-8">
                            {/* Left Column - Form */}
                            <div className="flex-1 max-w-md space-y-4 xl:pt-6">
                                {/* Status Options */}
                                <div className="space-y-4">
                                    <div>
                                        <label className="text-sm font-medium text-gray-900 block mb-1">Alterar status para</label>
                                        <p className="text-sm text-gray-500 mb-3">Selecione o novo estado da conta do utilizador.</p>

                                        <div className="relative">
                                            <div className="relative">
                                                <select
                                                    value={selectedStatus}
                                                    onChange={(e) => setSelectedStatus(e.target.value as AccountStatus)}
                                                    className="w-full appearance-none rounded-lg border border-gray-300 bg-white px-4 py-3 pr-10 text-gray-900 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer"
                                                >
                                                    {STATUS_OPTIONS.map(option => (
                                                        <option key={option.value} value={option.value}>
                                                            {option.label}
                                                        </option>
                                                    ))}
                                                </select>
                                                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-500">
                                                    <i className="fa-duotone fa-chevron-down" />
                                                </div>

                                                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                                                    {(() => {
                                                        const option = STATUS_OPTIONS.find(o => o.value === selectedStatus);
                                                        return option ? <i className={`fa-duotone ${option.icon} ${option.iconColor}`} /> : null;
                                                    })()}
                                                </div>
                                            </div>
                                            <style jsx>{`
                                                select { text-indent: 2rem; }
                                            `}</style>
                                        </div>
                                    </div>
                                </div>

                                {/* Status Consequence Info / Warning */}
                                <div className={`p-4 rounded-xl border text-sm transition-all duration-300 ${selectedStatus === 'ACTIVE'
                                    ? 'bg-emerald-50 border-emerald-100 text-emerald-800'
                                    : selectedStatus === 'SUSPENDED'
                                        ? 'bg-amber-50 border-amber-100 text-amber-800'
                                        : 'bg-red-50 border-red-100 text-red-800'
                                    }`}>
                                    <div className="flex gap-3">
                                        <div className="shrink-0 mt-0.5">
                                            <i className={`fa-duotone text-lg ${selectedStatus === 'ACTIVE' ? 'fa-circle-check text-emerald-500'
                                                : selectedStatus === 'SUSPENDED' ? 'fa-circle-exclamation text-amber-500'
                                                    : 'fa-ban text-red-500'
                                                }`} />
                                        </div>
                                        <div className="space-y-1">
                                            <p className="font-semibold">
                                                {selectedStatus === 'ACTIVE' ? 'Ativo'
                                                    : selectedStatus === 'SUSPENDED' ? 'Suspenso'
                                                        : 'Banido'}
                                            </p>
                                            <p className="text-xs opacity-90 leading-relaxed">
                                                {selectedStatus === 'ACTIVE'
                                                    ? 'O utilizador terá acesso total à plataforma, incluindo dashboard, perfil e todas as funcionalidades.'
                                                    : selectedStatus === 'SUSPENDED'
                                                        ? 'O utilizador será temporariamente impedido de fazer login. Os dados são mantidos, mas o acesso é revogado até nova ativação.'
                                                        : 'O utilizador será permanentemente bloqueado. Não poderá aceder à conta nem criar novas contas com este email.'}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Reason Input - only for BANNED */}
                                {selectedStatus === 'BANNED' && (
                                    <div className="mb-6">
                                        <label htmlFor="reason" className="block text-sm font-semibold text-gray-700 mb-1.5">
                                            Motivo do Bloqueio <span className="text-gray-400 font-normal text-xs ml-1">(Opcional)</span>
                                        </label>
                                        <div className="relative">
                                            <div className="absolute top-3 left-3 text-gray-400 pointer-events-none">
                                                <i className="fa-duotone fa-comment-exclamation" />
                                            </div>
                                            <textarea
                                                id="reason"
                                                value={reason}
                                                onChange={(e) => setReason(e.target.value)}
                                                placeholder="Ex: Violação repetida dos termos de serviço..."
                                                className="w-full pl-10 pr-4 py-2.5 rounded-xl border-gray-200 shadow-sm focus:border-red-500 focus:ring-red-500 text-sm min-h-[80px] resize-y placeholder:text-gray-400 bg-white"
                                            />
                                        </div>
                                        <p className="text-xs text-gray-500 mt-1.5">
                                            Este motivo será exibido ao utilizador quando tentar fazer login.
                                        </p>
                                    </div>
                                )}

                                {/* Email Notification Checkbox - show for all status changes */}
                                <div className="flex items-start gap-3 p-4 bg-blue-50/50 rounded-xl border border-blue-100">
                                    <input
                                        type="checkbox"
                                        id="sendNotification"
                                        checked={sendNotification}
                                        onChange={(e) => setSendNotification(e.target.checked)}
                                        className="custom-checkbox mt-0.5"
                                    />
                                    <label htmlFor="sendNotification" className="cursor-pointer">
                                        <p className="text-sm font-bold text-blue-900">Enviar notificação por email</p>
                                        <p className="text-xs text-blue-700/80 mt-0.5 leading-relaxed">
                                            O utilizador receberá um email a informar que o estado da conta foi alterado para {selectedStatus === 'ACTIVE' ? 'Ativo' : selectedStatus === 'SUSPENDED' ? 'Suspenso' : 'Banido'} e por quem (o seu email de administrador será incluído na mensagem).
                                        </p>
                                    </label>
                                </div>

                                {/* Error Message */}
                                {error && (
                                    <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                                        <i className="fa-duotone fa-circle-exclamation mr-2" />
                                        {error}
                                    </div>
                                )}

                                {/* Save Button */}
                                <div className="flex justify-center mt-4">
                                    <NewButton
                                        variant="new_primary_rounded"
                                        onClick={handleStatusChange}
                                        disabled={isUpdating || selectedStatus === currentStatus}
                                    >
                                        {isUpdating ? (
                                            <div className="flex items-center gap-2">
                                                <ButtonSpinner />
                                                <span>A atualizar...</span>
                                            </div>
                                        ) : (
                                            <>
                                                <i className="fa-duotone fa-save mr-2" />
                                                Atualizar Estado da Conta
                                            </>
                                        )}
                                    </NewButton>
                                </div>
                            </div>

                            {/* Right Column - User Info Sidebar */}
                            <div className="flex-1 xl:border-l xl:border-gray-100 xl:pl-8 space-y-6 xl:pt-6">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-1">
                                        <h1 className="text-xl font-bold text-gray-900">
                                            {userName} {userSurname}
                                        </h1>
                                        <RoleBadge role={userRole} />
                                    </div>
                                    <div className="flex flex-col gap-1">
                                        <p className="text-gray-500 flex items-center gap-2">
                                            <i className="fa-duotone fa-envelope text-sm"></i>
                                            <span className="font-bold">{userEmail}</span>
                                        </p>
                                        <div className="flex items-center gap-4 mt-4 pt-2 border-t border-gray-100 flex-wrap">
                                            <div className="flex items-center gap-1.5 text-xs text-gray-500" title="User ID">
                                                <i className="fa-duotone fa-fingerprint text-primary/80"></i>
                                                <span className="font-mono bg-gray-100 px-1.5 py-0.5 rounded border border-gray-200 font-semibold select-all break-all">{userId}</span>
                                            </div>
                                            <div className="flex items-center gap-1.5 text-xs text-gray-600 font-medium" title="Data de Registo">
                                                <i className="fa-duotone fa-calendar-clock text-primary/80"></i>
                                                {userCreatedAt ? (
                                                    <div className="flex items-center gap-1.5 font-semibold text-gray-800">
                                                        <span>Membro desde {new Date(userCreatedAt).toLocaleDateString('pt-PT', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                                                        {userGender && (
                                                            <>
                                                                <span className="text-gray-300 mx-1 font-normal opacity-50">|</span>
                                                                <div className="flex items-center gap-1">
                                                                    <span className={`font-bold ${userGender.toLowerCase() === 'feminino' || userGender.toLowerCase() === 'f' ? 'text-pink-500' : 'text-blue-500'}`}>
                                                                        {userGender}
                                                                    </span>
                                                                    <i className={`fa-duotone ${userGender.toLowerCase() === 'feminino' || userGender.toLowerCase() === 'f' ? 'fa-venus text-pink-500' : 'fa-mars text-blue-500'} text-xs`} />
                                                                </div>
                                                            </>
                                                        )}
                                                    </div>
                                                ) : (
                                                    <span className="text-gray-400">Data de registo indisponível</span>
                                                )}
                                            </div>
                                        </div>

                                        <div className="mt-6 pt-6 border-t border-gray-100">
                                            <div className="flex items-start gap-2.5 mb-6">
                                                <i className="fa-duotone fa-circle-info text-blue-500 mt-0.5" />
                                                <p className="text-xs text-gray-500 leading-relaxed">
                                                    Ao alterar o status da conta, se a opção de notificação estiver ativa, será enviado um email para <strong>{userEmail}</strong> informando sobre a alteração (seja para Ativo, Suspenso ou Banido), incluindo a data e o administrador responsável (<strong>{adminEmail}</strong>) pela ação.
                                                </p>
                                            </div>

                                            {/* Account Summary Block */}
                                            <div>
                                                <p className="text-xs font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                                    <i className="fa-duotone fa-file-invoice text-blue-500"></i>
                                                    Resumo da Conta
                                                </p>

                                                <div className="grid grid-cols-2 gap-3">
                                                    {/* Payment Status */}
                                                    <div className="p-3 rounded-lg bg-gray-50 border border-gray-100">
                                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                                                            <i className={`fa-duotone text-xs ${userPaid === 'PAGO' ? 'fa-circle-check text-emerald-500' :
                                                                userPaid === 'PENDENTE' ? 'fa-circle-exclamation text-red-500' :
                                                                    userPaid === 'EM ANÁLISE' ? 'fa-hourglass-clock text-amber-500' :
                                                                        'fa-circle-question text-gray-400'
                                                                }`}></i>
                                                            Estado
                                                        </p>
                                                        <p className={`text-sm font-bold ${userPaid === 'PAGO' ? 'text-emerald-600' :
                                                            userPaid === 'PENDENTE' ? 'text-red-500' :
                                                                'text-amber-600'
                                                            }`}>
                                                            {userPaid}
                                                        </p>
                                                        <p className="text-xs text-gray-600 mt-1 leading-snug">
                                                            {userPaid === 'PAGO' ? 'Pagamento confirmado. Acesso total ativo.' :
                                                                userPaid === 'EM ANÁLISE' ? 'Em análise. Aguarda verificação manual.' :
                                                                    'Pagamento pendente ou em atraso.'}
                                                        </p>
                                                    </div>

                                                    {/* Credits */}
                                                    <div className="p-3 rounded-lg bg-gray-50 border border-gray-100">
                                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                                                            <i className="fa-duotone fa-dumbbell text-emerald-500/70 text-xs"></i>
                                                            Treinos em Crédito
                                                        </p>
                                                        <p className="text-sm font-bold text-gray-900">
                                                            {userCredits}
                                                        </p>
                                                        <p className="text-xs text-gray-600 mt-1 leading-snug">
                                                            Sessões não utilizadas transitam para o mês seguinte.
                                                        </p>
                                                    </div>

                                                    {/* Debt */}
                                                    <div className="p-3 rounded-lg bg-gray-50 border border-gray-100">
                                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                                                            <i className={`fa-duotone fa-file-invoice-dollar text-xs ${(userDebt || 0) > 0 ? 'text-red-500' : 'text-emerald-500'}`}></i>
                                                            Valor em Dívida (€)
                                                        </p>
                                                        <p className={`text-sm font-bold ${userDebt > 0 ? 'text-red-500' : 'text-emerald-600'}`}>
                                                            {userDebt.toFixed(2)} €
                                                        </p>
                                                        <p className="text-xs text-gray-600 mt-1 leading-snug">
                                                            Quantia pendente a regularizar.
                                                        </p>
                                                    </div>

                                                    {/* Scheduled */}
                                                    <div className="p-3 rounded-lg bg-gray-50 border border-gray-100">
                                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                                                            <i className={`fa-duotone fa-calendar-check text-xs ${(userScheduled || 0) > 0 ? 'text-blue-500' : 'text-gray-400'}`}></i>
                                                            Treinos Agendados
                                                        </p>
                                                        <p className="text-sm font-bold text-gray-900">
                                                            {userScheduled}
                                                        </p>
                                                        <p className="text-xs text-gray-600 mt-1 leading-snug">
                                                            Número de sessões atualmente marcadas.
                                                        </p>
                                                    </div>
                                                </div>

                                                <div className="mt-4 flex items-start gap-3 bg-amber-50 rounded-lg p-3 border border-amber-200">
                                                    <div className="shrink-0">
                                                        <i className="fa-duotone fa-triangle-exclamation text-amber-600 text-sm"></i>
                                                    </div>
                                                    <p className="text-xs font-medium text-amber-900 leading-relaxed">
                                                        Atenção: A suspensão ou banimento da conta não altera automaticamente estes valores. Pode editá-los nas respetivas secções (Financeiro/Treinos).
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div >
    );
}
