"use client";

import { useState, useEffect } from "react";
import { useNotification } from "@/components/NotificationContext";
import NewButton from "@/app/components/newButton";

interface PricingCardProps {
    settings: any;
    onUpdate: () => void;
    loading: boolean;
}

// Price field configuration
interface PricingField {
    key: string;
    label: string;
    default: string | number;
    type?: string;
}

interface PricingSection {
    section: string;
    icon: string;
    fields: PricingField[];
}

const PRICING_SECTIONS: PricingSection[] = [
    {
        section: "Treinos Presenciais",
        icon: "fa-dumbbell",
        fields: [
            { key: "price_presencial_30min", label: "30min", default: 30 },
            { key: "price_presencial_45min", label: "45min", default: 35 },
            { key: "price_presencial_1hora", label: "1h", default: 40 },
        ]
    },
    {
        section: "Treinos Online",
        icon: "fa-video",
        fields: [
            { key: "price_online_30min", label: "30min", default: 18 },
            { key: "price_online_45min", label: "45min", default: 24 },
            { key: "price_online_1hora", label: "1h", default: 30 },
        ]
    },
    {
        section: "Acompanhamento",
        icon: "fa-chart-line",
        fields: [
            { key: "price_acompanhamento_mensal", label: "Mensal", default: 35 },
        ]
    },
    {
        section: "Extra Dupla",
        icon: "fa-user-group",
        fields: [
            { key: "price_extra_dupla_30min", label: "30min (+)", default: 10 },
            { key: "price_extra_dupla_45min", label: "45min (+)", default: 9 },
            { key: "price_extra_dupla_1hora", label: "1h (+)", default: 10 },
        ]
    },
    {
        section: "Extra Trio",
        icon: "fa-users",
        fields: [
            { key: "price_extra_trio_30min", label: "30min (+)", default: 15 },
            { key: "price_extra_trio_45min", label: "45min (+)", default: 17 },
            { key: "price_extra_trio_1hora", label: "1h (+)", default: 20 },
        ]
    },
    {
        section: "Empresas",
        icon: "fa-building",
        fields: [
            { key: "price_ginastica_laboral", label: "Ginástica Laboral", default: "Sob consulta", type: "text" },
        ]
    },
];

export function PricingCard({ settings, onUpdate, loading }: PricingCardProps) {
    const { notify } = useNotification();
    const [saving, setSaving] = useState(false);
    const [prices, setPrices] = useState<Record<string, string | number>>({});

    useEffect(() => {
        if (settings) {
            const initialPrices: Record<string, string | number> = {};
            PRICING_SECTIONS.forEach(section => {
                section.fields.forEach(field => {
                    initialPrices[field.key] = settings[field.key] ?? field.default;
                });
            });
            setPrices(initialPrices);
        }
    }, [settings]);

    if (loading && !settings) {
        return <div className="h-64 bg-gray-100 rounded-2xl animate-pulse" />;
    }

    const handlePriceChange = (key: string, value: string, type: string = 'number') => {
        if (type === 'text') {
            setPrices(prev => ({ ...prev, [key]: value }));
        } else {
            const numValue = Number(value);
            if (!isNaN(numValue) && numValue >= 0) {
                setPrices(prev => ({ ...prev, [key]: numValue }));
            }
        }
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const res = await fetch('/api/admin/settings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(prices)
            });

            if (!res.ok) throw new Error('Falha ao guardar');

            notify("Preços atualizados com sucesso", "success");
            onUpdate();
        } catch (error) {
            notify("Erro ao guardar alterações", "error");
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden flex flex-col">
            <div className="p-4 sm:p-6 border-b border-gray-100 bg-gray-50/50">
                <div className="flex items-center gap-3 mb-1">
                    <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center">
                        <i className="fa-duotone fa-euro-sign text-sm"></i>
                    </div>
                    <div>
                        <h3 className="font-bold text-gray-900">Configuração de Preços</h3>
                        <p className="text-xs text-gray-500">Ajuste os valores base dos serviços</p>
                    </div>
                </div>
            </div>

            <div className="p-4 sm:p-6 space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {PRICING_SECTIONS.map((section) => (
                        <div key={section.section} className="bg-gray-50 rounded-xl p-3 space-y-2">
                            <p className="text-xs font-bold text-gray-500 uppercase tracking-wide flex items-center gap-1.5">
                                <i className={`fa-duotone ${section.icon} text-primary`}></i>
                                {section.section}
                            </p>
                            <div className={`grid gap-2 ${section.fields.length === 1 ? 'grid-cols-1' : 'grid-cols-3'}`}>
                                {section.fields.map(field => (
                                    <div key={field.key}>
                                        <label className="block text-xs font-medium text-gray-500 mb-1">{field.label}</label>
                                        <div className="relative">
                                            {/* Show Euro sign only for number inputs */}
                                            {field.type !== 'text' && (
                                                <span className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400 text-xs">€</span>
                                            )}
                                            <input
                                                type={field.type || "number"}
                                                min="0"
                                                step="1"
                                                value={prices[field.key] ?? field.default}
                                                onChange={e => handlePriceChange(field.key, e.target.value, field.type)}
                                                className={`w-full ${field.type === 'text' ? 'px-3' : 'pl-6 pr-2'} py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none`}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

                <div className="pt-4 border-t border-gray-100 flex justify-end">
                    <NewButton
                        onClick={handleSave}
                        disabled={saving}
                        variant="new_primary_rounded"
                        className="w-full sm:w-auto"
                    >
                        {saving ? (
                            <>
                                <i className="fa-duotone fa-spinner-third fa-spin mr-2"></i>
                                Guardar...
                            </>
                        ) : (
                            <>
                                <i className="fa-duotone fa-check mr-2"></i>
                                Guardar Preços
                            </>
                        )}
                    </NewButton>
                </div>
            </div>
        </div>
    );
}
