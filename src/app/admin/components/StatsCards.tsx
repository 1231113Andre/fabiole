import { AdminStats } from "../types";

interface StatsCardsProps {
    stats: AdminStats;
}

export function StatsCards({ stats }: StatsCardsProps) {
    const cards = [
        {
            icon: "fa-sack-dollar",
            label: "Receita Pendente",
            value: `${stats.totalDebt.toFixed(2)} €`,
            bgClass: "from-rose-500/10 to-rose-600/5",
            iconColor: "text-rose-600",
            borderClass: "border-rose-100",
            isFinancial: true
        },
        {
            icon: "fa-users-medical",
            label: "Utilizadores",
            value: stats.totalUsers,
            bgClass: "from-blue-500/10 to-blue-600/5",
            iconColor: "text-blue-600",
            borderClass: "border-blue-100"
        },
        {
            icon: "fa-weight-scale",
            label: "Pesagens",
            value: stats.totalPesagens,
            bgClass: "from-orange-500/10 to-orange-600/5",
            iconColor: "text-orange-600",
            borderClass: "border-orange-100"
        },
        {
            icon: "fa-ruler-combined",
            label: "Perímetros",
            value: stats.totalPerimetros,
            bgClass: "from-purple-500/10 to-purple-600/5",
            iconColor: "text-purple-600",
            borderClass: "border-purple-100"
        },
        {
            icon: "fa-dumbbell",
            label: "Avaliações",
            value: stats.totalAvaliacoes,
            bgClass: "from-emerald-500/10 to-emerald-600/5",
            iconColor: "text-emerald-600",
            borderClass: "border-emerald-100"
        }
    ];

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 mb-8">
            {cards.map((card) => (
                <div
                    key={card.label}
                    className={`relative overflow-hidden bg-white rounded-2xl border ${card.borderClass} p-6 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1 group`}
                >
                    {/* Background Gradient Decoration */}
                    <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${card.bgClass} rounded-bl-full -mr-8 -mt-8 opacity-50 transaction-opacity group-hover:opacity-100`} />

                    <div className="relative flex flex-col justify-between h-full">
                        <div className="flex items-start justify-between mb-4">
                            <div className={`flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${card.bgClass} ${card.iconColor} shadow-inner`}>
                                <i className={`fa-duotone ${card.icon} text-2xl`}></i>
                            </div>
                            {card.isFinancial && (
                                <span className="bg-rose-100 text-rose-700 text-xs font-bold px-2 py-1 rounded-full uppercase tracking-wide">
                                    Dívida
                                </span>
                            )}
                        </div>

                        <div>
                            <p className="text-sm text-gray-500 font-semibold uppercase tracking-wider mb-1">{card.label}</p>
                            <h3 className="text-2xl font-bold text-gray-900 tracking-tight">
                                {card.value}
                            </h3>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}
