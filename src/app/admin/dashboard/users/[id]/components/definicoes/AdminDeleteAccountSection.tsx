"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useNotification } from "@/components/NotificationContext";
import NewButton from "@/app/components/newButton";
import { LoadingSpinner } from "@/components/ui/spinner";

const deleteAccountSchema = z.object({
    confirmText: z.string().refine((val) => val === "ELIMINAR", {
        message: "Escreve 'ELIMINAR' para confirmar",
    }),
});

type DeleteAccountForm = z.infer<typeof deleteAccountSchema>;

interface Props {
    userId: string;
    userName: string;
    isOpen: boolean;
    onToggle: () => void;
}

export function AdminDeleteAccountSection({ userId, userName, isOpen, onToggle }: Props) {
    const router = useRouter();
    const { notify } = useNotification();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const { register, handleSubmit, formState: { errors } } = useForm<DeleteAccountForm>({
        resolver: zodResolver(deleteAccountSchema),
    });

    const onSubmit = async () => {
        setIsSubmitting(true);
        try {
            const response = await fetch(`/api/admin/users/${userId}`, {
                method: "DELETE",
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || "Erro ao eliminar conta");
            }

            notify("Conta eliminada com sucesso!", "success");
            router.push("/admin/dashboard");
        } catch (error: any) {
            notify(error.message, "error");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="rounded-2xl border border-red-200 bg-white shadow-default overflow-hidden">
            <button
                onClick={onToggle}
                className="w-full flex items-center justify-between p-6 hover:bg-red-50/50 transition-colors cursor-pointer border-none bg-transparent text-left"
            >
                <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-red-600">
                        <i className="fa-duotone fa-trash-can text-xl"></i>
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-red-600">Eliminar Conta</h3>
                        <p className="text-sm text-muted-foreground">Elimina permanentemente a conta de {userName}</p>
                    </div>
                </div>
                <i className={`fa-duotone fa-chevron-down text-gray-400 transition-transform ${isOpen ? "rotate-180" : ""}`}></i>
            </button>

            <div className={`grid transition-all duration-300 ease-in-out ${isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}>
                <div className="overflow-hidden">
                    <div className="px-6 pb-6 border-t border-red-200">
                        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                            <p className="text-sm text-red-800 font-medium">
                                <i className="fa-duotone fa-triangle-exclamation mr-2"></i>
                                <strong>Atenção:</strong> Esta ação é irreversível!
                            </p>
                            <ul className="mt-2 text-sm text-red-700 list-disc list-inside space-y-1">
                                <li>Todos os dados do utilizador serão eliminados permanentemente</li>
                                <li>Pesagens, perímetros e avaliações serão removidos</li>
                                <li>Esta ação não pode ser desfeita</li>
                            </ul>
                        </div>

                        <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4 max-w-md">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Escreve <span className="font-bold text-red-600">ELIMINAR</span> para confirmar
                                </label>
                                <input
                                    type="text"
                                    {...register("confirmText")}
                                    className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-white text-black focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all placeholder:text-gray-400"
                                    placeholder="ELIMINAR"
                                    disabled={isSubmitting}
                                />
                                {errors.confirmText && (
                                    <p className="mt-1 text-sm text-destructive">{errors.confirmText.message}</p>
                                )}
                            </div>

                            <div className="flex justify-center mt-4">
                                <NewButton
                                    type="submit"
                                    variant="destructive"
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting ? <LoadingSpinner size="h-5 w-5" /> : (
                                        <>
                                            <i className="fa-duotone fa-trash-can mr-2"></i>
                                            Eliminar Conta
                                        </>
                                    )}
                                </NewButton>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}
