import { notFound } from "next/navigation";
import { getAdminUserById } from "@/lib/api/services/AdminService";
import { BulkAddClient } from "../../components/BulkAddClient";
import { UserData } from "../../../[id]/types";

import type { Metadata } from "next";

export const dynamic = 'force-dynamic';

interface PageProps {
    params: Promise<{ type: string; userId: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { type } = await params;

    const typeLabel = type === 'pesagens' ? 'Pesagens' :
        type === 'perimetros' ? 'Perímetros' :
            type === 'avaliacoes' ? 'Avaliações' : type;

    return {
        title: `Admin Dashboard | Utilizadores | Importar ${typeLabel}`,
        description: `Importação em massa de dados de ${typeLabel.toLowerCase()}`
    };
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
