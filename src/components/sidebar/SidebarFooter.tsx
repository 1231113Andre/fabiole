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
        <div className="px-4 py-4 border-t border-gray-200 bg-gray-50/50">
            <div className="flex items-center gap-3">
                <div className="relative shrink-0">
                    <Avatar
                        src={avatarUrl}
                        name={userName}
                        surname={userSurname}
                        size={38}
                        className="shadow-md ring-2 ring-white"
                    />
                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full"></div>
                </div>

                <div className="flex flex-col min-w-0">
                    <p className="text-sm font-bold text-gray-900 leading-none">
                        {footerTitle}
                    </p>
                    <div className="flex items-center text-[10px] text-gray-500 font-medium mt-1 truncate">
                        <span className="italic opacity-80 mr-1">developed. by</span>
                        <a
                            href="mailto:kamszotlol@proton.me"
                            className="text-indigo-600 hover:text-indigo-700 font-semibold transition-colors hover:underline truncate"
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
