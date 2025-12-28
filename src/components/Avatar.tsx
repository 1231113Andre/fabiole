"use client";

import React from "react";
import Image from "next/image";

interface AvatarProps {
    src?: string | null;
    name?: string;
    surname?: string;
    size?: number;
    className?: string;
}

export const Avatar: React.FC<AvatarProps> = ({
    src,
    name = "",
    surname = "",
    size = 40,
    className = "",
}) => {
    const [error, setError] = React.useState(false);

    // Fallback to default avatar if src is null/empty
    const imageSrc = src || "/images/avatars/default.png";

    const getInitials = () => {
        if (!name && !surname) return "";
        return `${name.charAt(0)}${surname.charAt(0)}`.toUpperCase();
    };

    const placeholderColor = React.useMemo(() => {
        const colors = [
            "bg-blue-100 text-blue-600",
            "bg-emerald-100 text-emerald-600",
            "bg-indigo-100 text-indigo-600",
            "bg-purple-100 text-purple-600",
            "bg-orange-100 text-orange-600",
            "bg-rose-100 text-rose-600",
        ];
        const index = ((name?.length || 0) + (surname?.length || 0)) % colors.length;
        return colors[index];
    }, [name, surname]);

    // If we have an image source and haven't hit an error yet
    if (!error) {
        return (
            <div
                className={`relative overflow-hidden rounded-full border border-gray-200 ${className}`}
                style={{ width: size, height: size }}
            >
                <Image
                    src={imageSrc}
                    alt={`${name} ${surname}`}
                    fill
                    className="object-cover"
                    onError={() => setError(true)}
                    sizes={`${size}px`}
                    priority={size > 100}
                />
            </div>
        );
    }

    // Final fallback to initials
    return (
        <div
            className={`flex items-center justify-center rounded-full font-bold border border-gray-200 ${placeholderColor} ${className}`}
            style={{ width: size, height: size, fontSize: size * 0.4 }}
        >
            {getInitials() || <i className="fa-duotone fa-user"></i>}
        </div>
    );
};
