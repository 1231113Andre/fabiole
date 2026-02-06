"use client";

import React, { memo } from "react";
import Link from "next/link";
import Image from "next/image";
import { ASSETS } from "@/lib/constants/assets";

interface SidebarBrandProps {
    isCollapsed: boolean;
    brandLogo?: string;
    brandName?: string;
}

export const SidebarBrand = memo(function SidebarBrand({
    isCollapsed,
    brandLogo = ASSETS.logo,
}: SidebarBrandProps) {
    return (
        <Link
            href="/"
            className={`flex items-center px-4 py-3 mb-1 no-underline transition-all duration-300 group border-b border-gray-100 ${isCollapsed ? "justify-center" : ""
                }`}
        >
            {/* Logo Container - More compact */}
            <div className="relative flex h-11 w-11 flex-shrink-0 items-center justify-center transition-transform duration-300 group-hover:scale-105">
                <Image
                    src={brandLogo}
                    alt="Brand Logo"
                    width={110}
                    height={110}
                    quality={85}
                    priority
                    loading="eager"
                    className="absolute left-1/2 top-[65%] h-28 w-28 -translate-x-1/2 -translate-y-1/2 object-contain drop-shadow-md max-w-none"
                />
            </div>

            {/* Brand Text - More compact */}
            {!isCollapsed && (
                <div className="flex flex-col justify-center ml-3 -mt-1 transition-transform duration-300 group-hover:translate-x-1">
                    <span className="font-montserrat text-base font-bold leading-none tracking-wide text-gray-900 whitespace-nowrap">
                        FÁBIO LÉ
                    </span>
                    <span className="font-montserrat text-[9px] font-bold leading-none tracking-[0.35em] text-primary mt-1 whitespace-nowrap">
                        PERSONAL TRAINER
                    </span>
                </div>
            )}
        </Link>
    );
});
