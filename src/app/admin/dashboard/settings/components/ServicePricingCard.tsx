"use client";

import { useState, useEffect } from "react";
import { useNotification } from "@/components/NotificationContext";
import NewButton from "@/app/components/newButton";

interface ServicePricingCardProps {
    settings: any;
    onUpdate: () => void;
    loading: boolean;
}

// Price field configuration
const PRICING_FIELDS = [
    {
        section: "Treinos Presenciais",
        icon: "fa-dumbbell",
        fields: [
            { key: "price_presencial_30min", label: "30 minutos", default: 22 },
            { key: "price_presencial_45min", label: "45 minutos", default: 28 },
            { key: "price_presencial_1hora", label: "1 hora", default: 35 },
        ]
    },
    {
        section: "Treinos Online",
        icon: "fa-video",
        fields: [
            { key: "price_online_30min", label: "30 minutos", default: 18 },
            { key: "price_online_45min", label: "45 minutos", default: 24 },
            { key: "price_online_1hora", label: "1 hora", default: 30 },
        ]
    },
    {
        section: "Acompanhamento Online",
        icon: "fa-chart-line",
        fields: [
            { key: "price_acompanhamento_mensal", label: "Mensal", default: 35 },
        ]
    },
    {
        section: "Extras (Dupla)",
        icon: "fa-user-group",
        fields: [
            { key: "price_extra_dupla_30min", label: "30 minutos", default: 2 },
            { key: "price_extra_dupla_45min", label: "45 minutos", default: 3 },
            { key: "price_extra_dupla_1hora", label: "1 hora", default: 6 },
        ]
    },
    {
        section: "Extras (Trio)",
        icon: "fa-users",
        fields: [
            { key: "price_extra_trio_30min", label: "30 minutos", default: 4 },
            { key: "price_extra_trio_45min", label: "45 minutos", default: 7 },
            { key: "price_extra_trio_1hora", label: "1 hora", default: 9 },
        ]
    },
];

export function ServicePricingCard({ settings, onUpdate, loading }: ServicePricingCardProps) {
    const { notify } = useNotification();
    const [saving, setSaving] = useState(false);
    const [prices, setPrices] = useState<Record<string, number>>({});

    // Initialize prices from settings or defaults
    useEffect(() => {
        const initialPrices: Record<string, number> = {};
        PRICING_FIELDS.forEach(section => {
            section.fields.forEach(field => {
                initialPrices[field.key] = settings?.[field.key] ?? field.default;
            });
        });
        setPrices(initialPrices);
    }, [settings]);

    if (loading && !settings) {
        return <div className="h-64 bg-gray-100 rounded-2xl animate-pulse" />;
    }

    const handlePriceChange = (key: string, value: string) => {
        const numValue = Number(value);
        if (!isNaN(numValue) && numValue >= 0) {
            setPrices(prev => ({ ...prev, [key]: numValue }));
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
            notify("Erro ao guardar preços", "error");
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-100 bg-gray-50/50">
                <div className="flex items-center gap-3 mb-1">
                    <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center">
                        <i className="fa-duotone fa-euro-sign text-sm"></i>
                    </div>
                    <div>
                        <h3 className="font-bold text-gray-900">Configuração de Preços</h3>
                        <p className="text-xs text-gray-500">Preços base por tipo de treino e duração</p>
                    </div>
                </div>
            </div>

            <div className="p-6 space-y-6">
                {PRICING_FIELDS.map((section, sectionIndex) => (
                    <div key={section.section} className="space-y-3">
                        <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                            <i className={`fa-duotone ${section.icon}`}></i> {section.section}
                        </h4>

                        <div className={`grid gap-3 ${section.fields.length === 1 ? 'grid-cols-1' : 'grid-cols-3'}`}>
                            {section.fields.map(field => (
                                <div key={field.key}>
                                    <label className="block text-xs font-bold text-gray-700 mb-1.5">{field.label}</label>
                                    <div className="relative">
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">€</span>
                                        <input
                                            type="number"
                                            min="0"
                                            step="1"
                                            value={prices[field.key] ?? field.default}
                                            onChange={e => handlePriceChange(field.key, e.target.value)}
                                            className="w-full pl-7 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>

                        {sectionIndex < PRICING_FIELDS.length - 1 && (
                            <div className="border-b border-gray-100 pt-3"></div>
                        )}
                    </div>
                ))}

                {/* Actions */}
                <div className="pt-4 border-t border-gray-100 flex justify-end">
                    <NewButton
                        onClick={handleSave}
                        disabled={saving}
                        variant="new_primary_rounded"
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
