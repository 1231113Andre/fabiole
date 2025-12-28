import { RecentPesagem } from "@/app/admin/types";
import { UserActivityCard } from "./UserActivityCard";

interface RecentMeasurementsWidgetProps {
    pesagens: RecentPesagem[];
}

export function RecentMeasurementsWidget({ pesagens }: RecentMeasurementsWidgetProps) {
    const filteredPesagens = pesagens.filter(item => item.peso !== null && item.peso !== undefined);

    return (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden h-full flex flex-col">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                <h3 className="font-bold text-lg text-gray-900 flex items-center gap-2">
                    <i className="fa-duotone fa-weight-scale text-orange-500"></i>
                    Últimas Pesagens
                </h3>
            </div>
            <div className="divide-y divide-gray-100">
                {filteredPesagens.length === 0 ? (
                    <p className="p-6 text-gray-500 text-center">Sem dados recentes</p>
                ) : (
                    filteredPesagens.map((item) => (
                        <UserActivityCard
                            key={item.id}
                            userId={item.userId}
                            name={item.userName || ""}
                            surname={item.userSurname || ""}
                            avatarUrl={item.avatarUrl}
                            role={item.userRole || "USER"}
                            dateLabel={new Date(item.date).toLocaleDateString('pt-PT')}
                            primaryValue={<span className="font-bold text-primary">{item.peso} kg</span>}
                            primaryIcon={<i className="fa-duotone fa-weight-scale text-orange-500 text-xs ml-1"></i>}
                        />
                    ))
                )}
            </div>
        </div>
    );
}
