import { verifyAdminAccess } from "@/lib/api/services/AdminService";
import { CreateUserClient } from "./CreateUserClient";

export const dynamic = 'force-dynamic';

export default async function CreateUserPage() {
    // Verify admin access server-side
    await verifyAdminAccess();

    return <CreateUserClient />;
}
