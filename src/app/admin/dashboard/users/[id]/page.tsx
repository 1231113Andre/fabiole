import { notFound } from "next/navigation";
import { getAdminUserById } from "@/lib/api/services/AdminService";
import { UserEditClient } from "./UserEditClient";

// Force dynamic rendering - always fresh data
export const dynamic = 'force-dynamic';

interface PageProps {
    params: Promise<{ id: string }>;
}

export default async function UserEditPage({ params }: PageProps) {
    const { id } = await params;

    // Server-side data fetching - no loading spinner needed!
    const user = await getAdminUserById(id);

    if (!user) {
        notFound();
    }

    // Pass pre-fetched data to client component
    return <UserEditClient initialUser={user} />;
}
