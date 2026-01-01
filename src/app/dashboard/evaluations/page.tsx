import type { Metadata } from "next";
import { getSession } from "@/lib/security/session";
import { UserService } from "@/lib/api/services/UserService";
import { redirect } from "next/navigation";
import { EvaluationsClient } from "./components/EvaluationsClient";

export const metadata: Metadata = {
    title: "Dashboard | Avaliações",
    description: "Avaliações físicas e testes de performance"
};

export const dynamic = 'force-dynamic';

export default async function EvaluationsPage() {
    // 1. Get Session
    const session = await getSession();
    if (!session || !session.email) {
        redirect("/auth/login");
    }

    // 2. Fetch Data (Server-Side Cache)
    const userData = await UserService.getUserData(session.email);

    // 3. Render Client Wrapper with Data
    return <EvaluationsClient initialData={userData} />;
}
