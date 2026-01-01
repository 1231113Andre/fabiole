export interface CreateUserFormData {
    name: string;
    surname: string;
    email: string;
    password?: string;
    gender: string;
    birth: string;
    role: string;
    sendNotification: boolean;
    trainingCredit: number;
    trainingsScheduled: number;
    debtValue: number;
    goals: string;
    notes: string;
    phone?: string;
}

export const INPUT_CLASSES = "w-full px-4 py-2.5 text-sm border border-gray-200 rounded-xl bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all duration-200 hover:border-gray-300";
export const LABEL_CLASSES = "block text-xs font-bold text-gray-600 mb-1.5 flex items-center gap-2";
