import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";

interface BulkSaveParams {
    userId: string;
    type: string;
    records: any[];
}

export function useBulkMutations() {
    const queryClient = useQueryClient();
    const router = useRouter();

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
            toast.success("Registos guardados com sucesso!");
            // Invalidate user query to refetch fresh data
            queryClient.invalidateQueries({ queryKey: ['adminUser', userId] });
            router.push(`/admin/dashboard/users/${userId}`);
        },
        onError: (error: Error) => {
            console.error(error);
            toast.error(error.message || "Erro ao guardar registos.");
        }
    });

    return {
        bulkSaveMutation
    };
}
