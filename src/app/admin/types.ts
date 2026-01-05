export type AccountStatus = 'ACTIVE' | 'SUSPENDED' | 'BANNED';

export interface AdminStats {
    totalUsers: number;
    totalPesagens: number;
    totalPerimetros: number;
    totalAvaliacoes: number;
    totalDebt: number;
}

export interface AdminUser {
    id: string;
    name: string;
    surname: string;
    email: string;
    role: string;
    gender: string | null;
    birth: string;
    createdAt: string;
    avatarUrl?: string | null;
    pesagensCount: number;
    perimetrosCount: number;
    avaliacoesCount: number;
    trainingCredit: number;
    trainingsScheduled: number;
    debtValue: number;
    status: AccountStatus;
    statusChangedBy?: string | null;
    statusChangedAt?: string | null;
}

export interface RecentUser {
    id: string;
    name: string;
    surname: string;
    email: string;
    role: string;
    avatarUrl?: string | null;
    createdAt: string;
    birth: string | null;
}

export interface RecentPesagem {
    id: number;
    userId: string;
    date: string;
    peso: number | null;
    userName?: string;
    userSurname?: string;
    avatarUrl?: string | null;
    userRole?: string;
    userBirth?: string | null;
}

export interface AdminStatsData {
    stats: AdminStats;
    users: AdminUser[];
    recentSignups: RecentUser[];
    recentPesagens: RecentPesagem[];
}
