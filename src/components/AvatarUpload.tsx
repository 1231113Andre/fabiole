"use client";

import React, { useState, useRef } from "react";
import { toast } from "react-toastify";
import { Avatar } from "./Avatar";
import NewButton from "@/app/components/newButton";

interface AvatarUploadProps {
    userId?: string;
    currentAvatarUrl?: string | null;
    userName: string;
    userSurname: string;
    onUploadSuccess?: (newUrl: string) => void;
    size?: number;
    extraInfo?: React.ReactNode;
}

export const AvatarUpload: React.FC<AvatarUploadProps> = ({
    userId,
    currentAvatarUrl,
    userName,
    userSurname,
    onUploadSuccess,
    size = 120,
    extraInfo,
}) => {
    const [uploading, setUploading] = useState(false);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validations
        if (!file.type.startsWith("image/")) {
            toast.error("Por favor, seleciona uma imagem válida.");
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            toast.error("A imagem deve ter no máximo 5MB.");
            return;
        }

        // Preview
        const reader = new FileReader();
        reader.onloadend = () => {
            setPreviewUrl(reader.result as string);
        };
        reader.readAsDataURL(file);

        try {
            setUploading(true);

            // 1. Get presigned URL
            const urlQuery = userId ? `?userId=${userId}` : "";
            const urlRes = await fetch(`/api/user/avatar/upload-url${urlQuery}`);
            if (!urlRes.ok) throw new Error("Falha ao obter URL de upload");
            const { uploadUrl, publicUrl } = await urlRes.json();

            // 2. Upload directly to R2
            const uploadRes = await fetch(uploadUrl, {
                method: "PUT",
                body: file,
                headers: {
                    "Content-Type": file.type,
                },
            });

            if (!uploadRes.ok) throw new Error("Falha no upload para R2");

            // 3. Update database
            const updateRes = await fetch("/api/user/avatar/update", {
                method: "POST",
                body: JSON.stringify({
                    avatarUrl: publicUrl,
                    userId: userId
                }),
                headers: {
                    "Content-Type": "application/json",
                },
            });

            if (!updateRes.ok) throw new Error("Falha ao atualizar base de dados");

            const { avatarUrl: newFullUrl } = await updateRes.json();

            toast.success("Avatar atualizado com sucesso!");
            if (onUploadSuccess) onUploadSuccess(newFullUrl);

            // Clear preview once done, we'll use the real URL now
            setPreviewUrl(null);
        } catch (error) {
            console.error("Upload error:", error);
            toast.error("Erro ao atualizar o avatar. Tenta novamente.");
            setPreviewUrl(null);
        } finally {
            setUploading(false);
        }
    };

    const triggerFileInput = () => {
        fileInputRef.current?.click();
    };

    return (
        <div className="flex flex-col sm:flex-row items-start gap-8 w-full">
            {/* Left Column: Avatar, Name, Button */}
            <div className="flex flex-col items-center gap-4">
                <div className="relative group cursor-pointer flex-shrink-0" onClick={triggerFileInput}>
                    <Avatar
                        src={previewUrl || currentAvatarUrl}
                        name={userName}
                        surname={userSurname}
                        size={size}
                        className={`transition-all duration-300 shadow-md ${uploading ? "opacity-50 blur-sm" : "group-hover:ring-4 group-hover:ring-primary/20"}`}
                    />

                    {/* Overlay */}
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <i className="fa-duotone fa-camera text-white text-3xl"></i>
                    </div>

                    {/* Loading Spinner */}
                    {uploading && (
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                        </div>
                    )}
                </div>

                <div className="flex flex-col items-center gap-2 text-center">
                    <h4 className="font-bold text-gray-900 text-lg">{userName} {userSurname}</h4>
                    {!uploading ? (
                        <NewButton
                            variant="new_secondary_no_border_on_idle"
                            onClick={triggerFileInput}
                            icon={<i className="fa-duotone fa-pen-to-square"></i>}
                            className="text-sm"
                        >
                            {currentAvatarUrl?.includes('default.png') ? "Adicionar Foto" : "Alterar Foto"}
                        </NewButton>
                    ) : (
                        <div className="flex items-center gap-2 text-primary font-semibold">
                            <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                            <span className="text-sm animate-pulse">A carregar...</span>
                        </div>
                    )}
                </div>
            </div>

            <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/*"
                className="hidden"
            />

            {/* Right Column: Info Section */}
            <div className="flex-1 w-full">
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                    <div className="bg-gray-50 border border-gray-200 rounded-xl p-5 h-full flex flex-col">
                        <div className="flex gap-4 mb-4">
                            <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center flex-shrink-0">
                                <i className="fa-duotone fa-circle-info text-blue-500 text-xl"></i>
                            </div>
                            <div className="flex flex-col gap-2">
                                <p className="text-sm font-bold text-gray-900 leading-tight">Requisitos da Imagem</p>
                                <ul className="text-xs text-gray-600 flex flex-col gap-2 list-none p-0 m-0">
                                    <li className="flex items-center gap-2">
                                        <i className="fa-solid fa-check text-emerald-500 text-[10px]"></i>
                                        <span>Tamanho máximo de <strong>5MB</strong></span>
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <i className="fa-solid fa-check text-emerald-500 text-[10px]"></i>
                                        <span>Formatos suportados: <strong>PNG, JPG, WebP</strong></span>
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <i className="fa-solid fa-check text-emerald-500 text-[10px]"></i>
                                        <span>A imagem será otimizada para carregamento rápido</span>
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <i className="fa-solid fa-star text-amber-500 text-[10px]"></i>
                                        <span>Dica: Use uma foto quadrada com boa iluminação</span>
                                    </li>
                                </ul>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 pt-3 border-t border-gray-200">
                            <div className="w-5 h-5 flex items-center justify-center rounded-full bg-orange-100 flex-shrink-0">
                                <i className="fa-duotone fa-eye text-orange-500 text-[10px]"></i>
                            </div>
                            <span className="font-medium text-xs text-gray-700">A fotografia será visível em todo o sistema</span>
                        </div>
                    </div>

                    {extraInfo && (
                        <div className="h-full">
                            {extraInfo}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
