import { getAdminUsers, verifyAdminAccess } from "@/lib/api/services/AdminService";
import { UsersPageClient } from "./UsersPageClient";

// Force dynamic rendering - always fresh data
export const dynamic = 'force-dynamic';

export default async function AdminUsersList() {
    // Verify admin access and fetch users server-side
    await verifyAdminAccess();
    const users = await getAdminUsers();

    // Pass pre-fetched data to client component
    return <UsersPageClient initialUsers={users} />;
}
