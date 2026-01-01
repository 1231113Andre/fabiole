"use client";

import { useState, useEffect } from "react";
import { useNotification } from "@/components/NotificationContext";
import { AdminHeader } from "@/app/admin/components/AdminHeader";
import { EnvVarsCard } from "./components/EnvVarsCard";
import { SystemConfigCard } from "./components/SystemConfigCard";

interface SettingsPageClientProps {
    initialData?: {
        config: any;
        env: any;
        status: any;
    };
}

export function SettingsPageClient({ initialData }: SettingsPageClientProps) {
    const { notify } = useNotification();
    const [loading, setLoading] = useState(!initialData);
    const [settings, setSettings] = useState<any>(initialData || null);

    useEffect(() => {
        // If we have initial data, we already rendered. 
        // We still fetch once to ensure alignment if something changed in that tiny window
        if (initialData) {
            setLoading(false);
        } else {
            fetchSettings();
        }
    }, [initialData]);

    const fetchSettings = async () => {
        try {
            const res = await fetch('/api/admin/settings');
            const data = await res.json();
            setSettings(data);
        } catch (err) {
            notify("Erro ao carregar definições. Por favor, tente novamente.", "error");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <AdminHeader
                title="Definições de Sistema"
                subtitle="Gerir configurações globais, variáveis de ambiente e parâmetros de segurança."
                icon="fa-gears"
            />

            {/* Service Status Summary */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                {settings?.status && Object.entries(settings.status).map(([key, info]: [string, any]) => (
                    <div key={key} className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex items-start gap-4 hover:border-primary/20 transition-colors">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-sm shrink-0 ${info.online ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                            <i className={`fa-duotone ${info.icon} text-xl`}></i>
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-0.5">
                                <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider ">{key}</p>
                                {info.online && (
                                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                )}
                            </div>
                            <p className={`text-sm font-bold mb-1 ${info.online ? 'text-emerald-700' : 'text-red-600'}`}>
                                {info.message}
                            </p>
                            <p className="text-xs text-gray-500 leading-relaxed font-medium">
                                {info.description}
                            </p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Content Grid */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                {/* Left Column: Editable Settings */}
                <div className="space-y-6">
                    <SystemConfigCard
                        settings={settings?.config || {}}
                        onUpdate={() => fetchSettings()}
                        loading={loading}
                    />
                </div>

                {/* Right Column: Read-Only Env Vars */}
                <div className="space-y-6">
                    <EnvVarsCard envVars={settings?.env || {}} loading={loading} />
                </div>
            </div>
        </div>
    );
}
