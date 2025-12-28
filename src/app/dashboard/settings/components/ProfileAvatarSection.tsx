"use client";

import React from "react";
import { AvatarUpload } from "@/components/AvatarUpload";
import { useDashboardData } from "../../hooks/useDashboardData";

interface ProfileAvatarSectionProps {
    isOpen: boolean;
    onToggle: () => void;
}

export const ProfileAvatarSection: React.FC<ProfileAvatarSectionProps> = ({
    isOpen,
    onToggle,
}) => {
    const { user, refetch } = useDashboardData();

    if (!user) return null;

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden text-left">
            <button
                onClick={onToggle}
                className="w-full px-6 py-5 flex items-center justify-between hover:bg-gray-50 transition-colors"
            >
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center text-primary">
                        <i className="fa-duotone fa-image-user text-xl" />
                    </div>
                    <div className="text-left">
                        <h3 className="font-bold text-gray-900">Foto de Perfil</h3>
                        <p className="text-sm text-gray-500">Altera a tua foto de perfil pública</p>
                    </div>
                </div>
                <i className={`fa-duotone fa-chevron-down transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {isOpen && (
                <div className="px-6 py-8 border-t border-gray-50">
                    <AvatarUpload
                        currentAvatarUrl={user.avatarUrl}
                        userName={user.name}
                        userSurname={user.surname}
                        onUploadSuccess={() => {
                            // Re-fetch user data to update avatar across the app
                            refetch();
                        }}
                        size={140}
                    />
                </div>
            )}
        </div>
    );
};
