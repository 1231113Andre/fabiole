import { notFound } from "next/navigation";
import { getAdminUserById } from "@/lib/api/services/AdminService";
import { BulkAddClient } from "../../components/BulkAddClient";
import { UserData } from "../../../[id]/types";

export const dynamic = 'force-dynamic';

interface PageProps {
    params: Promise<{ type: string; userId: string }>;
}

export default async function BulkAddPage({ params }: PageProps) {
    const { type, userId } = await params;

    // Server-side data fetching - no loading spinner needed!
    const user = await getAdminUserById(userId);

    if (!user) {
        notFound();
    }

    // Validate type
    if (!['pesagens', 'perimetros', 'avaliacoes'].includes(type)) {
        notFound();
    }

    return (
        <BulkAddClient
            initialUser={user as unknown as UserData}
            type={type as 'pesagens' | 'perimetros' | 'avaliacoes'}
        />
    );
}
