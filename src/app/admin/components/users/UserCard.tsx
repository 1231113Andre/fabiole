import { memo, useMemo } from "react";
import Link from "next/link";
import { AdminUser } from "@/app/admin/types";
import { Avatar } from "@/components/Avatar";
import { getRoleInlineStyles } from "@/app/admin/constants/roleConfig";
import { getStatusConfig } from "@/app/admin/constants/statusConfig";
import { StatBadge } from "./StatBadge";
import { calculateAge } from "@/lib/utils/bodyMetrics";
import { formatCurrency } from "@/lib/utils/formatters";

// ============================================================================
// CONSTANTS
// ============================================================================

const STAT_BADGES_CONFIG = [
    { key: 'pesagensCount', icon: 'fa-weight-scale', colorClass: 'text-orange-600 bg-orange-50', label: 'Pesagens' },
    { key: 'perimetrosCount', icon: 'fa-ruler', colorClass: 'text-purple-600 bg-purple-50', label: 'Perímetros' },
    { key: 'avaliacoesCount', icon: 'fa-clipboard-check', colorClass: 'text-emerald-600 bg-emerald-50', label: 'Avaliações' },
] as const;

const FINANCIAL_BADGES_CONFIG = [
    { key: 'trainingCredit', icon: 'fa-dumbbell', colorClass: 'text-emerald-600 bg-emerald-50', label: 'Crédito', isCurrency: false },
    { key: 'trainingsScheduled', icon: 'fa-calendar-check', colorClass: 'text-blue-600 bg-blue-50', label: 'Agendados', isCurrency: false },
    { key: 'debtValue', icon: 'fa-file-invoice-dollar', label: 'Dívida', isCurrency: true },
] as const;

// ============================================================================
// COMPONENT
// ============================================================================

interface UserCardProps {
    user: AdminUser;
}

export const UserCard = memo<UserCardProps>(({ user }) => {
    const roleStyle = useMemo(() => getRoleInlineStyles(user.role), [user.role]);
    const birthDate = useMemo(() => user.birth ? new Date(user.birth) : null, [user.birth]);
    const age = useMemo(() => calculateAge(birthDate), [birthDate]);
    const formattedCreatedAt = useMemo(() =>
        user.createdAt
            ? new Date(user.createdAt).toLocaleDateString('pt-PT', { day: 'numeric', month: 'long', year: 'numeric' })
            : null
        , [user.createdAt]);
    const statusConfig = useMemo(() => getStatusConfig(user.status), [user.status]);

    return (
        <Link
            href={`/admin/dashboard/users/${user.id}`}
            className="block p-4 hover:bg-gray-50 transition-all duration-200 group"
            prefetch={true}
        >
            <div className="flex items-center justify-between">
                {/* Left: Avatar + Info */}
                <div className="flex items-center gap-4">
                    <Avatar
                        src={user.avatarUrl}
                        name={user.name}
                        surname={user.surname}
                        size={48}
                        className="group-hover:scale-110 transition-transform duration-300"
                    />
                    <div className="flex flex-col">
                        <div className="flex items-center gap-2">
                            <p className="font-semibold text-gray-900 group-hover:text-primary transition-colors text-[15px]">
                                {user.name} {user.surname}
                            </p>
                            <div className="flex items-center gap-1">
                                <i className={`fa-duotone ${roleStyle.icon} ${roleStyle.color} text-[10px]`} />
                                <span className={`text-[10px] font-bold ${roleStyle.color} uppercase tracking-wider`}>
                                    {roleStyle.label}
                                </span>
                            </div>
                        </div>
                        <p className="text-xs text-gray-400 font-medium">{user.email}</p>
                        {formattedCreatedAt && (
                            <p className="text-xs font-semibold flex items-center gap-1.5 mt-0.5">
                                <i className="fa-duotone fa-calendar-star text-primary text-xs" />
                                <span className="text-gray-500">Membro desde</span>
                                <span className="font-bold text-primary">{formattedCreatedAt}</span>
                            </p>
                        )}
                        {/* Account Status Badge */}
                        <p className="text-xs font-semibold flex items-center gap-1.5 mt-0.5">
                            <i className="fa-duotone fa-user-tag text-gray-400 text-xs" />
                            <span className="text-gray-500">Status da conta:</span>
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wide ${statusConfig.badgeBg} ${statusConfig.badgeText}`}>
                                <i className={`fa-duotone ${statusConfig.icon}`} />
                                {statusConfig.badgeLabel}
                            </span>
                        </p>
                    </div>
                </div>

                {/* Right: Stats */}
                <div className="text-right flex flex-col items-end justify-center gap-1">
                    <div className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                        {user.gender && (
                            <>
                                <span className={`font-bold ${user.gender.toLowerCase() === 'feminino' || user.gender.toLowerCase() === 'f' ? 'text-pink-500' : 'text-blue-500'}`}>
                                    {user.gender}
                                </span>
                                <i className={`fa-duotone ${user.gender.toLowerCase() === 'feminino' || user.gender.toLowerCase() === 'f' ? 'fa-venus text-pink-500' : 'fa-mars text-blue-500'} text-xs`} />
                                <span className="text-gray-300">|</span>
                            </>
                        )}
                        <span className="font-bold text-primary">
                            {birthDate ? birthDate.toLocaleDateString('pt-PT') : '-'}
                        </span>
                        {age !== null && (
                            <span className="text-gray-500 text-xs font-semibold">({age} anos)</span>
                        )}
                        <i className="fa-duotone fa-cake-candles text-primary text-xs" />
                    </div>
                    <div className="flex items-center gap-2 text-[10px] text-gray-400 font-mono font-semibold">
                        <span>({user.id})</span>
                        <i className="fa-duotone fa-fingerprint text-gray-300 text-xs" />
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                        {STAT_BADGES_CONFIG.map(({ key, icon, colorClass, label }) => (
                            <StatBadge
                                key={key}
                                count={user[key as keyof AdminUser] as number}
                                icon={icon}
                                colorClass={colorClass}
                                label={label}
                            />
                        ))}
                        <div className="w-px h-4 bg-gray-400 mx-2 opacity-60" />
                        {FINANCIAL_BADGES_CONFIG.map(({ key, icon, label, isCurrency, ...config }) => {
                            const value = user[key as keyof AdminUser] as number ?? 0;
                            const colorClass = (key === 'debtValue')
                                ? (value > 0 ? 'text-red-600 bg-red-50' : 'text-emerald-600 bg-emerald-50')
                                : (config as any).colorClass;

                            return (
                                <div
                                    key={key}
                                    className={`flex items-center gap-1 px-1.5 py-0.5 rounded-md ${colorClass}`}
                                    title={label}
                                >
                                    <i className={`fa-duotone ${icon} text-[10px]`} />
                                    <span className="text-[10px] font-bold">
                                        {isCurrency ? formatCurrency(value) : value}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </Link>
    );
});

UserCard.displayName = 'UserCard';
