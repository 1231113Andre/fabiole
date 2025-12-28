import { AdminStats } from "../types";

interface StatsCardsProps {
    stats: AdminStats;
}

export function StatsCards({ stats }: StatsCardsProps) {
    const cards = [
        {
            icon: "fa-users",
            label: "Utilizadores",
            value: stats.totalUsers,
            bgClass: "bg-blue-100",
            textClass: "text-blue-600"
        },
        {
            icon: "fa-weight-scale",
            label: "Pesagens",
            value: stats.totalPesagens,
            bgClass: "bg-orange-100",
            textClass: "text-orange-600"
        },
        {
            icon: "fa-ruler-combined",
            label: "Perímetros",
            value: stats.totalPerimetros,
            bgClass: "bg-purple-100",
            textClass: "text-purple-600"
        },
        {
            icon: "fa-dumbbell",
            label: "Avaliações",
            value: stats.totalAvaliacoes,
            bgClass: "bg-emerald-100",
            textClass: "text-emerald-600"
        }
    ];

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {cards.map((card) => (
                <div
                    key={card.label}
                    className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow"
                >
                    <div className="flex items-center gap-4">
                        <div className={`flex h-14 w-14 items-center justify-center rounded-xl ${card.bgClass} ${card.textClass}`}>
                            <i className={`fa-duotone ${card.icon} text-2xl`}></i>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 font-medium">{card.label}</p>
                            <p className="text-2xl font-bold text-gray-900">{card.value}</p>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}
