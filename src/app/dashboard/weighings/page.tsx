import type { Metadata } from "next";
import { getSession } from "@/lib/security/session";
import { UserService } from "@/lib/api/services/UserService";
import { redirect } from "next/navigation";
import { WeighingsClient } from "./components/WeighingsClient";

export const metadata: Metadata = {
    title: "Dashboard | Pesagens",
    description: "Histórico de pesagens e composição corporal"
};

export const dynamic = 'force-dynamic';

export default async function WeighingsPage() {
    // 1. Get Session
    const session = await getSession();
    if (!session || !session.email) {
        redirect("/auth/login");
    }

    // 2. Fetch Data (Server-Side Cache)
    const userData = await UserService.getUserData(session.email);

    // 3. Render Client Wrapper with Data
    return <WeighingsClient initialData={userData} />;
}
