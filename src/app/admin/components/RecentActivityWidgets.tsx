import { RecentUser, RecentPesagem } from "@/app/admin/types";
import { RecentSignupsWidget } from "./widgets/RecentSignupsWidget";
import { RecentMeasurementsWidget } from "./widgets/RecentMeasurementsWidget";

interface RecentActivityWidgetsProps {
    recentUsers: RecentUser[];
    recentPesagens: RecentPesagem[];
}

export function RecentActivityWidgets({
    recentUsers,
    recentPesagens
}: RecentActivityWidgetsProps) {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            <RecentSignupsWidget users={recentUsers} />
            <RecentMeasurementsWidget pesagens={recentPesagens} />
        </div>
    );
}
