import { useQuery } from "@tanstack/react-query";
import { UserData } from "../types";

export function useAdminUser(userId: string, initialData?: UserData) {
    return useQuery<UserData, Error>({
        queryKey: ["adminUser", userId],
        queryFn: async () => {
            const response = await fetch(`/api/admin/users/${userId}`);

            if (response.status === 403) {
                throw new Error("ACCESS_DENIED");
            }

            if (!response.ok) {
                const error = await response.json().catch(() => ({}));
                throw new Error(error.error || "Erro ao carregar utilizador");
            }

            return response.json();
        },
        initialData,
        staleTime: 1000 * 60, // 1 minute
        gcTime: 1000 * 60 * 5 // 5 minutes
    });
}
