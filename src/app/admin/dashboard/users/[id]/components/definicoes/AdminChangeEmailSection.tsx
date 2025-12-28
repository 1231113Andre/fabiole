"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useNotification } from "@/components/NotificationContext";
import NewButton from "@/app/components/newButton";
import { ButtonSpinner } from "@/app/admin/components/LoadingStates";

const changeEmailSchema = z.object({
    newEmail: z.string().email("Email inválido"),
});

type ChangeEmailForm = z.infer<typeof changeEmailSchema>;

interface Props {
    userId: string;
    currentEmail: string;
    isOpen: boolean;
    onToggle: () => void;
    onEmailChanged: (newEmail: string) => void;
}

export function AdminChangeEmailSection({ userId, currentEmail, isOpen, onToggle, onEmailChanged }: Props) {
    const { notify } = useNotification();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    const { register, handleSubmit, formState: { errors }, reset } = useForm<ChangeEmailForm>({
        resolver: zodResolver(changeEmailSchema),
    });

    const onSubmit = async (data: ChangeEmailForm) => {
        setIsSubmitting(true);
        setSuccessMessage(null);
        try {
            const response = await fetch(`/api/admin/users/${userId}/change-email`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ newEmail: data.newEmail }),
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || "Erro ao alterar email");
            }

            setSuccessMessage("Email alterado com sucesso!");
            notify("Email alterado com sucesso!", "success");
            onEmailChanged(data.newEmail);
            reset();
        } catch (error: any) {
            notify(error.message, "error");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="rounded-2xl border border-stroke bg-white shadow-default overflow-hidden">
            <button
                onClick={onToggle}
                className="w-full flex items-center justify-between p-6 hover:bg-gray-50 transition-colors cursor-pointer border-none bg-transparent text-left"
            >
                <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-50 text-amber-600">
                        <i className="fa-duotone fa-envelope text-xl"></i>
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-black">Alterar Email</h3>
                        <p className="text-sm text-muted-foreground">
                            Email atual: <span className="font-medium text-black">{currentEmail || "N/A"}</span>
                        </p>
                    </div>
                </div>
                <i className={`fa-duotone fa-chevron-down text-gray-400 transition-transform ${isOpen ? "rotate-180" : ""}`}></i>
            </button>

            <div className={`grid transition-all duration-300 ease-in-out ${isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}>
                <div className="overflow-hidden">
                    <div className="px-6 pb-6 border-t border-stroke">
                        <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                            <p className="text-sm text-amber-800">
                                <i className="fa-duotone fa-shield-check mr-2"></i>
                                <strong>Modo Administrador:</strong> O email será alterado imediatamente sem verificação.
                            </p>
                        </div>

                        {successMessage && (
                            <div className="mt-4 p-4 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center gap-3">
                                <i className="fa-solid fa-circle-check text-xl"></i>
                                <span className="font-medium">{successMessage}</span>
                            </div>
                        )}

                        <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4 max-w-md">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Novo Email
                                </label>
                                <input
                                    type="email"
                                    {...register("newEmail")}
                                    className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-white text-black focus:outline-none focus:border-primary focus:ring-0 transition-all placeholder:text-gray-400"
                                    placeholder="novo@email.com"
                                    disabled={isSubmitting}
                                />
                                {errors.newEmail && (
                                    <p className="mt-1 text-sm text-destructive">{errors.newEmail.message}</p>
                                )}
                            </div>

                            <div className="flex justify-center mt-4">
                                <NewButton
                                    type="submit"
                                    variant="new_primary_rounded"
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting ? (
                                        <div className="flex items-center gap-2">
                                            <ButtonSpinner />
                                            <span>A alterar...</span>
                                        </div>
                                    ) : (
                                        <>
                                            <i className="fa-duotone fa-envelope mr-2"></i>
                                            Alterar Email
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
