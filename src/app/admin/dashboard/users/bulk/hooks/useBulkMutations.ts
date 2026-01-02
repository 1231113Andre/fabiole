import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useNotification } from "@/components/NotificationContext";

interface BulkSaveParams {
    userId: string;
    type: string;
    records: any[];
}

export function useBulkMutations() {
    const queryClient = useQueryClient();
    const router = useRouter();
    const { notify } = useNotification();

    const bulkSaveMutation = useMutation({
        mutationFn: async ({ userId, type, records }: BulkSaveParams) => {
            const response = await fetch(`/api/admin/users/${userId}/${type}/bulk`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(records)
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error || "Erro ao guardar registos");
            }

            return response.json();
        },
        onSuccess: (_, { userId }) => {
            notify("Registos guardados com sucesso!", 'success');
            // Invalidate user query to refetch fresh data
            queryClient.invalidateQueries({ queryKey: ['adminUser', userId] });
            router.push(`/admin/dashboard/users/${userId}`);
        },
        onError: (error: Error) => {
            console.error(error);
            notify(error.message || "Erro ao guardar registos.", 'error');
        }
    });

    return {
        bulkSaveMutation
    };
}

