"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useNotification } from "@/components/NotificationContext";
import { CreateUserFormData } from "./components/types";
import { CreateUserHeader } from "./components/CreateUserHeader";
import { PersonalInfoSection } from "./components/PersonalInfoSection";
import { FinancialForm } from "@/components/admin/users/forms/FinancialForm";
import { NotesForm } from "@/components/admin/users/forms/NotesForm";
import { FormActions } from "./components/FormActions";

import { useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/react-query/queryKeys";

export function CreateUserClient() {
    const queryClient = useQueryClient();
    const router = useRouter();
    const { notify } = useNotification();
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [availableRoles, setAvailableRoles] = useState<string[]>([]);

    const [formData, setFormData] = useState<CreateUserFormData>({
        name: "",
        surname: "",
        email: "",
        phone: "",
        password: "",
        gender: "Masculino",
        birth: "",
        role: "USER",
        sendNotification: true,
        // Additional fields
        trainingCredit: 0,
        trainingsScheduled: 0,
        debtValue: 0,
        goals: "",
        notes: ""
    });

    useEffect(() => {
        // Fetch available roles from API
        fetch('/api/admin/roles')
            .then(res => res.json())
            .then(data => {
                if (data.roles) setAvailableRoles(data.roles);
            })
            .catch(err => console.error('Failed to load roles', err));
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;

        if (type === 'checkbox') {
            const checked = (e.target as HTMLInputElement).checked;
            setFormData(prev => ({ ...prev, [name]: checked }));
            return;
        }

        // Handle numeric inputs
        if (type === 'number') {
            setFormData(prev => ({ ...prev, [name]: Number(value) }));
            return;
        }

        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const generatePassword = () => {
        const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%&*";
        let pass = "";
        for (let i = 0; i < 12; i++) {
            pass += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        setFormData(prev => ({ ...prev, password: pass }));
        setShowPassword(true); // Show the password when generated
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await fetch("/api/admin/users", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData)
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Erro ao criar utilizador");
            }

            notify("Utilizador criado com sucesso!", "success");
            queryClient.invalidateQueries({ queryKey: queryKeys.adminUsers });
            router.push(`/admin/dashboard/users/${data.user.id}`);
            router.refresh();
        } catch (error: any) {
            notify(error.message, "error");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <CreateUserHeader />

            {/* Form Card */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                <form onSubmit={handleSubmit} className="p-6 space-y-6">

                    <PersonalInfoSection
                        formData={formData}
                        handleChange={handleChange}
                        availableRoles={availableRoles}
                        showPassword={showPassword}
                        togglePassword={() => setShowPassword(!showPassword)}
                        generatePassword={generatePassword}
                    />

                    <FinancialForm
                        data={formData}
                        onChange={(field, value) => setFormData(prev => ({ ...prev, [field]: value }))}
                    />

                    <NotesForm
                        data={formData}
                        onChange={(field, value) => setFormData(prev => ({ ...prev, [field]: value }))}
                    />

                    <FormActions
                        loading={loading}
                        role={formData.role}
                    />
                </form>
            </div>
        </div>
    );
}
