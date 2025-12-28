import { memo } from "react";

interface StatBadgeProps {
    count: number;
    icon: string;
    colorClass: string;
    label: string;
}

export const StatBadge = memo<StatBadgeProps>(({ count, icon, colorClass, label }) => (
    <div
        className={`flex items-center gap-1.5 px-2 py-1 rounded-lg ${colorClass}`}
        title={label}
    >
        <i className={`fa-duotone ${icon} text-[10px]`} />
        <span className="text-xs font-bold">{count}</span>
    </div>
));

StatBadge.displayName = 'StatBadge';
