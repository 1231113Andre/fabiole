"use client";

import { useState, useEffect } from "react";
import { useNotification } from "@/components/NotificationContext";
import { AdminHeader } from "@/app/admin/components/AdminHeader";
import NewButton from "@/app/components/newButton";

import { PricingCard } from "./components/PricingCard";
import { RateLimitCard } from "./components/RateLimitCard";
import { SystemStatusCard } from "./components/SystemStatusCard";
import { EnvVarsCard } from "./components/EnvVarsCard";

interface SettingsPageClientProps {
    initialData?: {
        config: any;
        env: any;
        status: any;
    };
}

type TabType = 'status' | 'pricing' | 'api' | 'system';

export function SettingsPageClient({ initialData }: SettingsPageClientProps) {
    const { notify } = useNotification();
    const [loading, setLoading] = useState(!initialData);
    const [settings, setSettings] = useState<any>(initialData || null);
    const [activeTab, setActiveTab] = useState<TabType>('status');

    useEffect(() => {
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

    const TABS = [
        { id: 'status', label: 'Estado', icon: 'fa-heart-pulse' },
        { id: 'pricing', label: 'Preços', icon: 'fa-euro-sign' },
        { id: 'api', label: 'API / Segurança', icon: 'fa-shield-halved' },
        { id: 'system', label: 'Sistema', icon: 'fa-server' },
    ];

    return (
        <div className="space-y-6">
            <AdminHeader
                title="Definições de Sistema"
                subtitle="Gerir configurações globais, variáveis de ambiente e parâmetros de segurança."
                icon="fa-gears"
            />

            {/* Navigation Tabs */}
            <div className="flex overflow-x-auto pb-4 gap-2 border-b border-gray-100 no-scrollbar sm:flex-wrap">
                {TABS.map((tab) => (
                    <NewButton
                        key={tab.id}
                        variant={activeTab === tab.id ? 'new_primary_rounded' : 'new_primary_no_bg_rounded'}
                        onClick={() => setActiveTab(tab.id as TabType)}
                        className="!justify-start"
                    >
                        <i className={`fa-duotone ${tab.icon} mr-2`}></i>
                        {tab.label}
                    </NewButton>
                ))}
            </div>

            {/* Content Area */}
            <div className="min-h-[400px]">
                {activeTab === 'status' && (
                    <div className="animate-fade-in-up">
                        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <i className="fa-duotone fa-heart-pulse text-emerald-500"></i>
                            Estado dos Serviços
                        </h3>
                        <SystemStatusCard status={settings?.status} loading={loading} />
                    </div>
                )}

                {activeTab === 'pricing' && (
                    <div className="animate-fade-in-up">
                        <PricingCard
                            settings={settings?.config || {}}
                            onUpdate={fetchSettings}
                            loading={loading}
                        />
                    </div>
                )}

                {activeTab === 'api' && (
                    <div className="animate-fade-in-up">
                        <RateLimitCard
                            settings={settings?.config || {}}
                            onUpdate={fetchSettings}
                            loading={loading}
                        />
                    </div>
                )}

                {activeTab === 'system' && (
                    <div className="animate-fade-in-up">
                        <EnvVarsCard
                            envVars={settings?.env || {}}
                            loading={loading}
                        />
                    </div>
                )}
            </div>
        </div>
    );
}
