/**
 * @fileoverview Account Status Configuration
 * @description Centralized status badge styling and labels
 */

export type AccountStatus = 'ACTIVE' | 'SUSPENDED' | 'BANNED';

export interface StatusConfig {
    value: AccountStatus;
    label: string;
    badgeLabel: string; // Full badge text like "ATIVO ACCOUNT"
    icon: string;
    iconColor: string;
    badgeBg: string;
    badgeText: string;
    badgeBorder: string;
}

/**
 * Status configuration for all account status badges
 */
export const STATUS_CONFIG: Record<AccountStatus, StatusConfig> = {
    ACTIVE: {
        value: 'ACTIVE',
        label: 'Ativo',
        badgeLabel: 'CONTA ATIVA',
        icon: 'fa-user-check',
        iconColor: 'text-emerald-500',
        badgeBg: 'bg-emerald-100',
        badgeText: 'text-emerald-700',
        badgeBorder: 'border-emerald-200'
    },
    SUSPENDED: {
        value: 'SUSPENDED',
        label: 'Suspenso',
        badgeLabel: 'CONTA SUSPENSA',
        icon: 'fa-user-clock',
        iconColor: 'text-amber-500',
        badgeBg: 'bg-amber-100',
        badgeText: 'text-amber-700',
        badgeBorder: 'border-amber-200'
    },
    BANNED: {
        value: 'BANNED',
        label: 'Banido',
        badgeLabel: 'CONTA BANIDA',
        icon: 'fa-user-xmark',
        iconColor: 'text-red-500',
        badgeBg: 'bg-red-100',
        badgeText: 'text-red-700',
        badgeBorder: 'border-red-200'
    }
};

/**
 * Get status config with fallback to ACTIVE
 */
export function getStatusConfig(status?: string | null): StatusConfig {
    if (!status || !(status in STATUS_CONFIG)) {
        return STATUS_CONFIG.ACTIVE;
    }
    return STATUS_CONFIG[status as AccountStatus];
}

/**
 * List of all status options for selectors
 */
export const STATUS_OPTIONS = Object.values(STATUS_CONFIG);
