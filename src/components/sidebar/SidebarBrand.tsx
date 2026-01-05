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
            className={`flex items-center px-6 py-5 mb-2 no-underline transition-all duration-300 group ${isCollapsed ? "justify-center" : ""
                }`}
        >
            {/* Logo Container */}
            <div className="relative flex h-14 w-14 flex-shrink-0 items-center justify-center transition-transform duration-300 group-hover:scale-105">
                <Image
                    src={brandLogo}
                    alt="Brand Logo"
                    width={128}
                    height={128}
                    quality={85}
                    priority
                    loading="eager"
                    className="absolute left-1/2 top-[65%] h-32 w-32 -translate-x-1/2 -translate-y-1/2 object-contain drop-shadow-md max-w-none"
                />
            </div>

            {/* Brand Text */}
            {!isCollapsed && (
                <div className="flex flex-col justify-center ml-4 -mt-1 transition-transform duration-300 group-hover:translate-x-1">
                    <span className="font-montserrat text-lg font-bold leading-none tracking-wide text-gray-900 whitespace-nowrap">
                        FÁBIO LÉ
                    </span>
                    <span className="font-montserrat text-[10px] font-bold leading-none tracking-[0.35em] text-primary mt-1 whitespace-nowrap">
                        PERSONAL TRAINER
                    </span>
                </div>
            )}
        </Link>
    );
});
