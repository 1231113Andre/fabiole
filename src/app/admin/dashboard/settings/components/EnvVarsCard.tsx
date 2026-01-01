import { memo } from "react";

// Update interface for nested structure
interface EnvVarsCardProps {
    envVars: Record<string, Record<string, string>>;
    loading: boolean;
}

export const EnvVarsCard = memo<EnvVarsCardProps>(({ envVars, loading }) => {
    if (loading) {
        return <div className="h-64 bg-gray-100 rounded-2xl animate-pulse" />;
    }

    return (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden flex flex-col h-full">
            <div className="p-6 border-b border-gray-100 bg-gray-50/50">
                <div className="flex items-center gap-3 mb-1">
                    <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center">
                        <i className="fa-duotone fa-code text-sm"></i>
                    </div>
                    <div>
                        <h3 className="font-bold text-gray-900">Variáveis de Ambiente</h3>
                        <p className="text-xs text-gray-500">Configurações ao nível do servidor (Read-Only)</p>
                    </div>
                </div>
            </div>

            <div className="p-6 flex-1 space-y-6">
                {Object.entries(envVars).map(([section, vars]) => (
                    <div key={section} className="space-y-3">
                        <div className="flex items-center justify-between pl-1">
                            <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider">{section}</h4>
                            {section === "Google Integration" && (
                                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-gray-100 text-gray-500 border border-gray-200">
                                    DESATIVADO
                                </span>
                            )}
                        </div>
                        <div className="bg-slate-900 rounded-xl p-4 overflow-x-auto border border-slate-800 shadow-inner relative group">
                            {section === "Google Integration" && (
                                <div className="mb-4 p-3 bg-red-900/20 border border-red-500/20 rounded-lg flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-red-500/10 flex items-center justify-center shrink-0">
                                        <i className="fa-duotone fa-database text-red-400"></i>
                                    </div>
                                    <div>
                                        <p className="text-gray-300 text-xs font-semibold">Integração Desativada</p>
                                        <p className="text-gray-500 text-[10px]">
                                            O sistema utiliza apenas <span className="text-emerald-400 font-medium">Prisma PostgreSQL</span>. Estes dados são mantidos apenas para histórico.
                                        </p>
                                    </div>
                                </div>
                            )}
                            <div className="flex flex-col gap-2 font-mono text-xs">
                                {Object.entries(vars).map(([key, value]) => (
                                    <div key={key} className="flex gap-3 min-w-max">
                                        <span className="text-purple-400 font-semibold">{key}</span>
                                        <span className="text-slate-500">=</span>
                                        <span className="text-emerald-400 break-all">{value}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                ))}
                <div className="flex items-start gap-3 p-3 bg-amber-50 rounded-lg border border-amber-100">
                    <i className="fa-duotone fa-info-circle text-amber-500 mt-0.5"></i>
                    <p className="text-xs text-amber-800 leading-relaxed font-medium">
                        Estas variáveis são definidas no servidor (ex: Vercel) e não podem ser alteradas através desta interface. Para modificar, atualize as variáveis de ambiente no painel de controlo do alojamento ou no ficheiro .env.local em desenvolvimento.
                    </p>
                </div>
            </div>
        </div>
    );
});
