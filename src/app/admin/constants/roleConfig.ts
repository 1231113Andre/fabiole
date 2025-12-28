/**
 * Centralized role configuration for consistent badge styling across admin UI.
 * Import this instead of duplicating role labels, colors, and icons.
 */

export type UserRole = 'ADMINISTRATOR' | 'OWNER' | 'USER';

export interface RoleConfigItem {
    label: string;
    color: 'red' | 'purple' | 'blue' | 'gray';
    icon: string;
    textColor: string;
    bgColor: string;
    borderColor: string;
    iconColor: string;
}

/**
 * Role styling configuration with all color variants for different use cases.
 */
export const ROLE_CONFIG: Record<UserRole | string, RoleConfigItem> = {
    ADMINISTRATOR: {
        label: 'Administrator',
        color: 'red',
        icon: 'fa-shield-check',
        textColor: 'text-red-600',
        bgColor: 'bg-red-50',
        borderColor: 'border-red-300',
        iconColor: 'text-red-700'
    },
    OWNER: {
        label: 'Owner',
        color: 'purple',
        icon: 'fa-crown',
        textColor: 'text-purple-600',
        bgColor: 'bg-purple-50',
        borderColor: 'border-purple-300',
        iconColor: 'text-purple-700'
    },
    USER: {
        label: 'User',
        color: 'blue',
        icon: 'fa-user',
        textColor: 'text-blue-600',
        bgColor: 'bg-blue-50',
        borderColor: 'border-blue-300',
        iconColor: 'text-blue-700'
    }
};

/**
 * Default configuration for unknown roles.
 */
const DEFAULT_ROLE_CONFIG: RoleConfigItem = {
    label: 'Unknown',
    color: 'gray',
    icon: 'fa-user',
    textColor: 'text-gray-600',
    bgColor: 'bg-gray-50',
    borderColor: 'border-gray-200',
    iconColor: 'text-gray-500'
};

/**
 * Get role configuration with fallback to default for unknown roles.
 */
export function getRoleConfig(role: string): RoleConfigItem {
    return ROLE_CONFIG[role] || DEFAULT_ROLE_CONFIG;
}

/**
 * Get inline role styling for compact displays (activity widgets, etc.)
 */
export function getRoleInlineStyles(role: string) {
    const config = getRoleConfig(role);
    return {
        label: config.label,
        color: config.textColor,
        icon: config.icon
    };
}
