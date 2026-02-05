"use client";

export const CustomChartTooltip = ({ active, payload, label, unit }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-white/95 backdrop-blur-sm border border-gray-100 p-3 rounded-xl shadow-xl animate-in fade-in zoom-in duration-200 min-w-[140px]">
                <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2 border-b border-gray-50 pb-1">
                    {label}
                </div>
                <div className="space-y-1.5">
                    {payload.map((entry: any, index: number) => {
                        const nameMap: Record<string, string> = {
                            peso: 'Peso',
                            massaGorda: '% MG',
                            massaMuscular: 'Massa Muscular',
                            gorduraVisceral: 'G. Visceral'
                        };
                        const displayName = nameMap[entry.dataKey] || entry.name || entry.dataKey;

                        return (
                            <div key={index} className="flex items-center justify-between gap-4">
                                <div className="flex items-center gap-2">
                                    <div
                                        className="w-2.5 h-2.5 rounded-full shadow-sm"
                                        style={{ backgroundColor: entry.stroke || entry.color || entry.fill }}
                                    />
                                    <span className="text-xs font-semibold text-gray-600">
                                        {displayName}
                                    </span>
                                </div>
                                <span className="text-sm font-bold text-gray-900">
                                    {entry.value}
                                    {unit && <span className="text-[10px] ml-0.5 text-gray-500">{unit}</span>}
                                </span>
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    }
    return null;
};
