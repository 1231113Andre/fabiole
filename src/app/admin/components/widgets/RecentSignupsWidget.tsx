import { RecentUser } from "@/app/admin/types";
import { UserActivityCard } from "./UserActivityCard";

interface RecentSignupsWidgetProps {
    users: RecentUser[];
}

export function RecentSignupsWidget({ users }: RecentSignupsWidgetProps) {
    return (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden h-full flex flex-col">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                <h3 className="font-bold text-lg text-gray-900 flex items-center gap-2">
                    <i className="fa-duotone fa-user-plus text-primary"></i>
                    Novos Utilizadores
                </h3>
            </div>
            <div className="divide-y divide-gray-100">
                {users.length === 0 ? (
                    <p className="p-6 text-gray-500 text-center">Sem registos recentes</p>
                ) : (
                    users.map((user) => {
                        const birthDate = user.birth ? new Date(user.birth) : null;
                        const age = birthDate ? new Date().getFullYear() - birthDate.getFullYear() : null;

                        return (
                            <UserActivityCard
                                key={user.id}
                                userId={user.id}
                                name={user.name}
                                surname={user.surname}
                                avatarUrl={user.avatarUrl}
                                role={user.role}
                                dateLabel={new Date(user.createdAt).toLocaleDateString('pt-PT')}
                                primaryValue={
                                    <>
                                        <span>{birthDate ? birthDate.toLocaleDateString('pt-PT') : '-'}</span>
                                        {age !== null && <span className="text-gray-500 text-xs font-semibold">({age} anos)</span>}
                                    </>
                                }
                                primaryIcon={<i className="fa-duotone fa-cake-candles text-primary text-xs ml-1"></i>}
                            />
                        );
                    })
                )}
            </div>
        </div>
    );
}
