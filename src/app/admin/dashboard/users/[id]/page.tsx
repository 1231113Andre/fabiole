import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getAdminUserById } from "@/lib/api/services/AdminService";
import { UserEditClient } from "./UserEditClient";
import type { UserData } from "./types";

// Force dynamic rendering - always fresh data
export const dynamic = 'force-dynamic';

interface PageProps {
    params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { id } = await params;
    const user = await getAdminUserById(id);

    if (!user) {
        return {
            title: "Admin Dashboard | Utilizador Não Encontrado"
        };
    }

    return {
        title: `Admin Dashboard | Utilizadores | Editar: ${user.name} ${user.surname}`,
        description: `Editar dados e permissões de ${user.name} ${user.surname}`
    };
}

export default async function UserEditPage({ params }: PageProps) {
    const { id } = await params;

    // Server-side data fetching - no loading spinner needed!
    const user = await getAdminUserById(id);

    if (!user) {
        notFound();
    }

    // Pass pre-fetched data to client component (AdminUserDetail matches UserData shape)
    return <UserEditClient initialUser={user as UserData} />;
}
