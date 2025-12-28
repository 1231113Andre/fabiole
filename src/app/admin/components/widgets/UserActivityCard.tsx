import Link from "next/link";
import { Avatar } from "@/components/Avatar";
import { getRoleInlineStyles } from "@/app/admin/constants/roleConfig";

interface UserActivityCardProps {
    userId: string;
    name: string;
    surname: string;
    avatarUrl?: string | null;
    role: string;
    primaryValue: React.ReactNode;
    primaryIcon: React.ReactNode;
    secondaryValue?: React.ReactNode;
    secondaryIcon?: React.ReactNode;
    dateLabel: string;
}

export function UserActivityCard({
    userId,
    name,
    surname,
    avatarUrl,
    role,
    primaryValue,
    primaryIcon,
    secondaryValue,
    secondaryIcon,
    dateLabel
}: UserActivityCardProps) {
    const roleStyle = getRoleInlineStyles(role);
    const displayUuid = `(${userId})`;

    return (
        <Link
            href={`/admin/dashboard/users/${userId}`}
            className="block p-4 hover:bg-gray-50 transition-all duration-200 group"
        >
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Avatar
                        src={avatarUrl}
                        name={name}
                        surname={surname}
                        size={48}
                        className="group-hover:scale-110 transition-transform duration-300"
                    />
                    <div className="flex flex-col">
                        <p className="font-semibold text-gray-900 group-hover:text-primary transition-colors text-[15px]">
                            {name} {surname}
                        </p>
                        <p className="text-xs text-gray-400 font-medium">
                            {dateLabel}
                        </p>
                    </div>
                </div>
                <div className="text-right flex flex-col items-end justify-center gap-1">
                    <div className="flex items-center gap-1.5 mb-0.5">
                        <i className={`fa-duotone ${roleStyle.icon} ${roleStyle.color} text-[10px]`}></i>
                        <span className={`text-[10px] font-bold ${roleStyle.color} uppercase tracking-wider`}>
                            {roleStyle.label}
                        </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                        {primaryValue}
                        {primaryIcon}
                    </div>
                    {secondaryValue && (
                        <div className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                            {secondaryValue}
                            {secondaryIcon}
                        </div>
                    )}
                    <div className="flex items-center gap-2 text-[10px] text-gray-400 font-mono font-semibold">
                        <span>{displayUuid}</span>
                        <i className="fa-duotone fa-fingerprint text-gray-300 text-xs ml-1"></i>
                    </div>
                </div>
            </div>
        </Link>
    );
}
