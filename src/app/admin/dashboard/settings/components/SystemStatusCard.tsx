"use client";

interface SystemStatusCardProps {
    status: any;
    loading: boolean;
}

export function SystemStatusCard({ status, loading }: SystemStatusCardProps) {
    if (loading && !status) {
        return <div className="h-32 bg-gray-100 rounded-2xl animate-pulse" />;
    }

    if (!status) return null;

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(status).map(([key, info]: [string, any]) => (
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
    );
}
