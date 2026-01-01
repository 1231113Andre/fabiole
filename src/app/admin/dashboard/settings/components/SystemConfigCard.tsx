import { useState, useEffect } from "react";
import { useNotification } from "@/components/NotificationContext";
import NewButton from "@/app/components/newButton";

interface SystemConfigCardProps {
    settings: any;
    onUpdate: () => void;
    loading: boolean;
}

export function SystemConfigCard({ settings, onUpdate, loading }: SystemConfigCardProps) {
    const { notify } = useNotification();
    const [saving, setSaving] = useState(false);

    // We maintain local state for form inputs
    const [limitMax, setLimitMax] = useState(settings?.rateLimitMax || 100);
    const [limitWindow, setLimitWindow] = useState(settings?.rateLimitWindow || 15);
    const [limitMessage, setLimitMessage] = useState(settings?.rateLimitMessage || "Too many requests.");

    // Update local state when settings are loaded from API
    useEffect(() => {
        if (settings) {
            setLimitMax(settings.rateLimitMax || 100);
            setLimitWindow(settings.rateLimitWindow || 15);
            setLimitMessage(settings.rateLimitMessage || "Too many requests.");
        }
    }, [settings]);

    // Sync state when props load
    if (loading && !settings) {
        return <div className="h-64 bg-gray-100 rounded-2xl animate-pulse" />;
    }

    const handleSave = async () => {
        setSaving(true);
        try {
            const res = await fetch('/api/admin/settings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    rateLimitMax: Number(limitMax),
                    rateLimitWindow: Number(limitWindow),
                    rateLimitMessage: limitMessage
                })
            });

            if (!res.ok) throw new Error('Falha ao guardar');

            notify("Configurações atualizadas com sucesso", "success");
            onUpdate();
        } catch (error) {
            notify("Erro ao guardar alterações", "error");
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden flex flex-col h-full">
            <div className="p-6 border-b border-gray-100 bg-gray-50/50">
                <div className="flex items-center gap-3 mb-1">
                    <div className="w-8 h-8 rounded-lg bg-orange-100 text-orange-600 flex items-center justify-center">
                        <i className="fa-duotone fa-sliders text-sm"></i>
                    </div>
                    <div>
                        <h3 className="font-bold text-gray-900">Configuração Dinâmica</h3>
                        <p className="text-xs text-gray-500">Parâmetros ajustáveis em tempo real</p>
                    </div>
                </div>
            </div>

            <div className="p-6 space-y-8">
                {/* Rate Limiting Section */}
                <div className="space-y-4">
                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                        <i className="fa-duotone fa-shield-halved"></i> Rate Limiting (API)
                    </h4>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-700 mb-1.5">Max Requests</label>
                            <input
                                type="number"
                                value={limitMax}
                                onChange={e => setLimitMax(e.target.value)}
                                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                            />
                            <p className="text-[10px] text-gray-400 mt-1">Requisições máximas por janela</p>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-700 mb-1.5">Janela (Minutos)</label>
                            <input
                                type="number"
                                value={limitWindow}
                                onChange={e => setLimitWindow(e.target.value)}
                                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                            />
                            <p className="text-[10px] text-gray-400 mt-1">Duração da janela de tempo</p>
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1.5">Mensagem de Bloqueio</label>
                        <textarea
                            value={limitMessage}
                            onChange={e => setLimitMessage(e.target.value)}
                            rows={2}
                            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                        />
                    </div>
                </div>

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
                                Guardar Alterações
                            </>
                        )}
                    </NewButton>
                </div>
            </div>
        </div>
    );
}
