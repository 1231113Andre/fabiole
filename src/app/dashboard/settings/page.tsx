import type { Metadata } from "next";
import { SettingsClient } from "./SettingsClient";
import { getSession } from "@/lib/security/session";
import { UserService } from "@/lib/api/services/UserService";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
    title: "Dashboard | Definições",
    description: "Configurações da conta, segurança e preferências"
};

export default async function SettingsPage() {
    const session = await getSession();

    if (!session) {
        redirect("/");
    }

    // Fetch user data server-side (uses Redis cache) for instant rendering
    const initialData = await UserService.getUserData(session.email);

    return <SettingsClient initialData={initialData} />;
}
