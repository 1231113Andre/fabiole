import { useState, useMemo } from "react";
import React from "react";
import Link from "next/link";
import { UserData } from "../types";
import { RoleBadge } from "@/app/admin/components/RoleBadge";
import { Avatar } from "@/components/Avatar";
import { useNotification } from "@/components/NotificationContext";
import { ButtonSpinner } from "@/app/admin/components/LoadingStates";
import { useInvalidateAdminUsers } from "@/lib/react-query/hooks/useAdminUsers";
import { getStatusConfig } from "@/app/admin/constants/statusConfig";
import { calculateAge } from "@/lib/body-metrics";

import NewButton from "@/app/components/newButton";

interface UserHeaderProps {
    user: UserData;
    onUpdate?: () => void;
    hidePaymentButtons?: boolean;
    customTitle?: string;
    customDescription?: string | React.ReactNode;
    customDescriptionSecondary?: string | React.ReactNode;
    customIcon?: string;
    backUrl?: string;
    backLabel?: string;
}

export const UserHeader: React.FC<UserHeaderProps> = ({
    user,
    onUpdate,
    hidePaymentButtons = false,
    customTitle,
    customDescription,
    customDescriptionSecondary,
    customIcon,
    backUrl,
    backLabel
}) => {
    const { notify } = useNotification();
    const [updating, setUpdating] = useState<string | null>(null);
    const { invalidate: invalidateAdminUsers } = useInvalidateAdminUsers();
    const statusConfig = useMemo(() => getStatusConfig(user.status), [user.status]);

    const handleStatusUpdate = async (status: string) => {
        setUpdating(status);
        try {
            const response = await fetch(`/api/admin/users/${user.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ paid: status }),
            });

            if (!response.ok) throw new Error("Erro ao atualizar status");

            notify(`Status alterado para ${status}`, "success");
            invalidateAdminUsers(); // Refresh users list cache
            if (onUpdate) onUpdate();
        } catch (error) {
            notify("Erro ao atualizar status", "error");
        } finally {
            setUpdating(null);
        }
    };

    return (
        <>
            <div className="mb-6">
                <NewButton
                    href={backUrl || "/admin/dashboard/users"}
                    variant="new_primary_rounded"
                    icon={<i className="fa-duotone fa-arrow-left" />}
                    className="shadow-lg font-bold uppercase tracking-widest text-sm h-12 px-6"
                >
                    {backLabel || "Visão Geral"}
                </NewButton>
            </div>

            <div className="relative mt-6 mb-8 p-6 bg-white rounded-2xl border border-gray-200 shadow-sm">
                {/* Payment Status Buttons or Custom Info */}
                <div className="absolute right-6 top-6 flex flex-col items-end gap-3">
                    {!hidePaymentButtons ? (
                        <div className="flex items-center gap-3">
                            {/* Info Tooltip */}
                            <div className="relative group/tooltip z-10">
                                <div className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-50 text-gray-400 hover:text-primary hover:bg-primary/5 cursor-help transition-all duration-200">
                                    <i className="fa-duotone fa-circle-info text-lg"></i>
                                </div>

                                {/* Tooltip Content - Dark Theme (Global Styles) */}
                                <div className="absolute top-10 right-0 w-72 p-3 bg-[#1c2434]/95 backdrop-blur-sm rounded-xl shadow-2xl opacity-0 invisible group-hover/tooltip:opacity-100 group-hover/tooltip:visible transition-all duration-200 transform origin-top-right scale-95 group-hover/tooltip:scale-100 z-50 border border-[#2E3A47]">
                                    {/* Arrow */}
                                    <div className="absolute -top-1 right-3 transform rotate-45 w-2.5 h-2.5 bg-[#1c2434]/95 border-t border-l border-[#2E3A47]"></div>

                                    <div className="relative">
                                        <h4 className="flex items-center gap-1.5 text-[10px] font-bold text-white uppercase tracking-wider mb-2 pb-2 border-b border-[#2E3A47]">
                                            <i className="fa-duotone fa-wallet text-primary"></i>
                                            Gestão de Pagamentos
                                        </h4>
                                        <div className="space-y-2 text-[11px] text-[#DEE4EE] font-medium">
                                            <p className="leading-snug opacity-90">Controla o status de pagamento visível no dashboard do cliente.</p>
                                            <div className="flex items-start gap-2">
                                                <div className="mt-1 w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
                                                <div>
                                                    <span className="font-bold text-emerald-400">PAGO:</span>
                                                    <span className="ml-1 opacity-70">Pagamento confirmado pelo Administrador.</span>
                                                </div>
                                            </div>
                                            <div className="flex items-start gap-2">
                                                <div className="mt-1 w-1.5 h-1.5 rounded-full bg-red-500 shrink-0 shadow-[0_0_8px_rgba(239,68,68,0.5)]"></div>
                                                <div>
                                                    <span className="font-bold text-red-400">PENDENTE:</span>
                                                    <span className="ml-1 opacity-70">Aguarda regularização do pagamento.</span>
                                                </div>
                                            </div>
                                            <div className="flex items-start gap-2">
                                                <div className="mt-1 w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0 shadow-[0_0_8px_rgba(245,158,11,0.5)]"></div>
                                                <div>
                                                    <span className="font-bold text-amber-400">EM ANÁLISE:</span>
                                                    <span className="ml-1 opacity-70">Requer verificação manual.</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <NewButton
                                variant="new_paid_rounded"
                                onClick={() => handleStatusUpdate("PAGO")}
                                disabled={user.paid === "PAGO" || updating !== null}
                                icon={<i className="fa-duotone fa-check text-sm" />}
                                className={`font-bold h-10 px-4 text-sm w-36 justify-center ${user.paid === "PAGO" ? "!opacity-100 cursor-not-allowed !text-emerald-600 !bg-transparent !border-emerald-600 shadow-none hover:!bg-transparent" : ""}`}
                            >
                                {updating === "PAGO" ? <ButtonSpinner color="primary" /> : "PAGO"}
                            </NewButton>
                            <NewButton
                                variant="new_pendente_rounded"
                                onClick={() => handleStatusUpdate("PENDENTE")}
                                disabled={user.paid === "PENDENTE" || updating !== null}
                                icon={<i className="fa-duotone fa-exclamation text-sm" />}
                                className={`font-bold h-10 px-4 text-sm w-36 justify-center ${user.paid === "PENDENTE" ? "!opacity-100 cursor-not-allowed !text-red-600 !bg-transparent !border-red-600 shadow-none hover:!bg-transparent" : ""}`}
                            >
                                {updating === "PENDENTE" ? <ButtonSpinner color="primary" /> : "PENDENTE"}
                            </NewButton>
                            <NewButton
                                variant="new_analise_rounded"
                                onClick={() => handleStatusUpdate("EM ANÁLISE")}
                                disabled={user.paid === "EM ANÁLISE" || updating !== null}
                                icon={<i className="fa-duotone fa-hourglass-half text-sm" />}
                                className={`font-bold h-10 px-4 text-sm w-36 justify-center ${user.paid === "EM ANÁLISE" ? "!opacity-100 cursor-not-allowed !text-amber-600 !bg-transparent !border-amber-500 shadow-none hover:!bg-transparent" : ""}`}
                            >
                                {updating === "EM ANÁLISE" ? <ButtonSpinner color="primary" /> : "EM ANÁLISE"}
                            </NewButton>
                        </div>
                    ) : (
                        <div className="flex flex-col gap-1.5 max-w-md">
                            <h4 className="text-sm font-black text-gray-900 uppercase tracking-widest flex items-center gap-2 justify-end">
                                <i className={`fa-duotone ${customIcon || 'fa-shuffle'} text-primary`}></i>
                                {customTitle || "BULK DATA SYSTEM"}
                            </h4>
                            <div className="text-xs text-gray-600 font-medium leading-relaxed text-right">
                                {customDescription}
                            </div>
                            {customDescriptionSecondary && (
                                <div className="text-[10px] text-gray-500 font-medium leading-relaxed text-right mt-1 pt-1.5 border-t border-gray-200">
                                    {customDescriptionSecondary}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Status Description */}
                    {!hidePaymentButtons && (
                        <div className="max-w-lg text-right mt-1">
                            {user.paid === "PAGO" && (
                                <p className="text-xs text-emerald-600 font-medium inline-flex items-start gap-1.5">
                                    <i className="fa-duotone fa-circle-check mt-0.5 flex-shrink-0"></i>
                                    <span>Pagamento confirmado pelo Administrador. Acesso total ao sistema ativado.</span>
                                </p>
                            )}
                            {user.paid === "PENDENTE" && (
                                <p className="text-xs text-red-600 font-medium inline-flex items-start gap-1.5">
                                    <i className="fa-duotone fa-triangle-exclamation mt-0.5 flex-shrink-0"></i>
                                    <span>Pagamento pendente. A regularização da mensalidade é necessária.</span>
                                </p>
                            )}
                            {user.paid === "EM ANÁLISE" && (
                                <p className="text-xs text-amber-600 font-medium inline-flex items-start gap-1.5">
                                    <i className="fa-duotone fa-hourglass-clock mt-0.5 flex-shrink-0"></i>
                                    <span>Em análise. Aguarda verificação manual pelo Administrador.</span>
                                </p>
                            )}
                            {(!user.paid || user.paid === "-") && (
                                <p className="text-xs text-gray-400 font-medium inline-flex items-start gap-1.5">
                                    <i className="fa-duotone fa-circle-question mt-0.5 flex-shrink-0"></i>
                                    <span>Status de pagamento não definido.</span>
                                </p>
                            )}
                        </div>
                    )}
                </div>

                <div className="flex items-center gap-6">
                    <Avatar
                        src={user.avatarUrl}
                        name={user.name}
                        surname={user.surname}
                        size={64}
                    />

                    <div className="flex-1">
                        <div className="flex items-center gap-3 mb-1">
                            <h1 className="text-2xl font-bold text-gray-900">
                                {user.name} {user.surname}
                            </h1>
                            <RoleBadge role={user.role} />
                        </div>
                        <div className="flex flex-col gap-1">
                            <p className="text-gray-500 flex items-center gap-2">
                                <i className="fa-duotone fa-envelope text-sm"></i>
                                <span className="font-bold">{user.email}</span>
                            </p>
                            <div className="flex items-center gap-4 mt-2 pt-2 border-t border-gray-100">
                                <div className="flex items-center gap-1.5 text-xs text-gray-500" title="User ID">
                                    <i className="fa-duotone fa-fingerprint text-primary/80"></i>
                                    <span className="font-mono bg-gray-100 px-1.5 py-0.5 rounded border border-gray-200 font-semibold select-all">{user.id}</span>
                                </div>
                                <div className="flex items-center gap-1.5 text-xs text-gray-600 font-medium" title="Data de Registo">
                                    <i className="fa-duotone fa-calendar-clock text-primary/80"></i>
                                    {user.createdAt ? (
                                        <div className="flex items-center gap-1.5 font-semibold text-gray-800">
                                            <span>Membro desde {new Date(user.createdAt).toLocaleDateString('pt-PT', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                                            {user.gender && (
                                                <>
                                                    <span className="text-gray-300 mx-1 font-normal opacity-50">|</span>
                                                    <div className="flex items-center gap-1">
                                                        <span className={`font-bold ${user.gender.toLowerCase() === 'feminino' || user.gender.toLowerCase() === 'f' ? 'text-pink-500' : 'text-blue-500'}`}>
                                                            {user.gender}
                                                        </span>
                                                        <i className={`fa-duotone ${user.gender.toLowerCase() === 'feminino' || user.gender.toLowerCase() === 'f' ? 'fa-venus text-pink-500' : 'fa-mars text-blue-500'} text-xs`} />
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    ) : (
                                        <span className="text-gray-400">Data de registo indisponível</span>
                                    )}
                                </div>
                            </div>
                            <div className="flex items-center gap-4 mt-2 pt-2 border-t border-gray-100">
                                <div className="flex items-center gap-1.5 text-xs text-gray-600 font-medium" title="Data de nascimento">
                                    <i className="fa-duotone fa-calendar-day text-primary/80" />
                                    {user.birth ? (
                                        <div className="flex items-center gap-1.5 font-semibold text-gray-800">
                                            <span>Data de nascimento: {new Date(user.birth).toLocaleDateString('pt-PT', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                                            {calculateAge(user.birth) != null && (
                                                <>
                                                    <span className="text-gray-300 mx-1 font-normal opacity-50">|</span>
                                                    <span className="flex items-center gap-1">
                                                        <i className="fa-duotone fa-cake-candles text-primary/80 text-xs" />
                                                        <span>({calculateAge(user.birth)} anos)</span>
                                                    </span>
                                                </>
                                            )}
                                        </div>
                                    ) : (
                                        <span className="text-gray-400">Data de nascimento indisponível</span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Account Status Section */}
                <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="flex items-center gap-2 mb-2">
                        <span className="text-sm font-semibold text-gray-700">Estado atual da conta:</span>
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wide ${statusConfig.badgeBg} ${statusConfig.badgeText}`}>
                            <i className={`fa-duotone ${statusConfig.icon}`} />
                            {statusConfig.badgeLabel}
                        </span>
                    </div>
                    <div className="space-y-2">
                        {user.status === 'ACTIVE' || !user.status ? (
                            <>
                                <p className="text-xs text-gray-600 flex items-start gap-2">
                                    <i className="fa-duotone fa-circle-info text-emerald-500 mt-0.5" />
                                    <span>A conta tem acesso ao dashboard, incluindo dados pessoais, gráficos, definições e outras funcionalidades.</span>
                                </p>
                                <p className="text-xs text-gray-500 flex items-center gap-1.5 flex-wrap">
                                    <i className="fa-duotone fa-lightbulb text-amber-500" />
                                    <span>Para suspender ou banir a conta, aceda à secção</span>
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-gray-100 rounded text-gray-700 font-semibold">
                                        <i className="fa-duotone fa-gear text-xs" />
                                        Definições
                                    </span>
                                </p>
                            </>
                        ) : user.status === 'SUSPENDED' ? (
                            <>
                                <p className="text-xs text-amber-600 flex items-start gap-2">
                                    <i className="fa-duotone fa-circle-exclamation mt-0.5" />
                                    <span>A conta está atualmente suspensa. O utilizador não consegue iniciar sessão.</span>
                                </p>
                                <p className="text-xs text-gray-500 flex items-center gap-1.5 flex-wrap">
                                    <i className="fa-duotone fa-lightbulb text-emerald-500" />
                                    <span>Para ativar a conta, aceda à secção</span>
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-gray-100 rounded text-gray-700 font-semibold">
                                        <i className="fa-duotone fa-gear text-xs" />
                                        Definições
                                    </span>
                                </p>
                            </>
                        ) : (
                            <>
                                <div className="flex flex-col gap-1">
                                    <p className="text-xs text-red-600 flex items-start gap-2">
                                        <i className="fa-duotone fa-ban mt-0.5" />
                                        <span>A conta está permanentemente banida. O utilizador não consegue iniciar sessão.</span>
                                    </p>
                                    {user.statusReason && (
                                        <p className="text-xs text-red-600/80 flex items-start gap-2 pl-6">
                                            <span><strong>Motivo do bloqueio:</strong> {user.statusReason}</span>
                                        </p>
                                    )}
                                </div>
                                <p className="text-xs text-gray-500 flex items-center gap-1.5 flex-wrap mt-1">
                                    <i className="fa-duotone fa-lightbulb text-emerald-500" />
                                    <span>Para restaurar o acesso, aceda à secção</span>
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-gray-100 rounded text-gray-700 font-semibold">
                                        <i className="fa-duotone fa-gear text-xs" />
                                        Definições
                                    </span>
                                </p>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
};
