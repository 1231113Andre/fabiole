import type { Metadata } from "next";
import { verifyAdminAccess } from "@/lib/api/services/AdminService";
import { CreateUserClient } from "./CreateUserClient";

export const metadata: Metadata = {
    title: "Admin Dashboard | Utilizadores | Novo Utilizador",
    description: "Criar nova conta de utilizador"
};

export const dynamic = 'force-dynamic';

export default async function CreateUserPage() {
    // Verify admin access server-side
    await verifyAdminAccess();

    return <CreateUserClient />;
}
