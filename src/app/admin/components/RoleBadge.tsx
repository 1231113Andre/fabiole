import { getRoleConfig } from "@/app/admin/constants/roleConfig";

interface RoleBadgeProps {
    role: string;
}

export function RoleBadge({ role }: RoleBadgeProps) {
    const config = getRoleConfig(role);

    return (
        <span className={`inline-flex items-center gap-2 px-2.5 py-1 rounded-lg text-xs font-semibold border ${config.bgColor} ${config.textColor} ${config.borderColor} select-none shadow-sm`}>
            <i className={`fa-duotone ${config.icon} ${config.iconColor} text-xs`}></i>
            <span className="tracking-wide">{config.label}</span>
        </span>
    );
}

