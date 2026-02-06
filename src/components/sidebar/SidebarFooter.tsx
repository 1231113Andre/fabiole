"use client";

import { memo } from "react";
import { Avatar } from "@/components/Avatar";

interface SidebarFooterProps {
    isCollapsed: boolean;
    userName?: string;
    userSurname?: string;
    avatarUrl?: string | null;
    footerTitle?: string;
}

export const SidebarFooter = memo(function SidebarFooter({
    isCollapsed,
    userName,
    userSurname,
    avatarUrl,
    footerTitle = "Cliente Panel"
}: SidebarFooterProps) {
    if (isCollapsed) return null;

    return (
        <div className="px-3 py-3 border-t border-gray-100 bg-gradient-to-br from-gray-50/50 to-white">
            <div className="flex items-center gap-2.5">
                <div className="relative shrink-0">
                    <Avatar
                        src={avatarUrl}
                        name={userName}
                        surname={userSurname}
                        size={34}
                        className="shadow-md ring-2 ring-white"
                    />
                    <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-white rounded-full"></div>
                </div>

                <div className="flex flex-col min-w-0">
                    <p className="text-xs font-bold text-gray-900 leading-none">
                        {footerTitle}
                    </p>
                    <div className="flex items-center text-[9px] text-gray-500 font-medium mt-1 truncate">
                        <span className="italic opacity-80 mr-1">developed. by</span>
                        <a
                            href="mailto:kamszotlol@proton.me"
                            className="text-primary hover:text-primary-hover font-semibold transition-colors hover:underline truncate"
                            title="Contact Developer"
                        >
                            kamszotlol@proton.me
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
});
