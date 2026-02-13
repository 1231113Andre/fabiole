import type { Metadata } from "next";
import { getSession } from "@/lib/security/session";
import { redirect } from "next/navigation";
import { PersonalDataClient } from "./PersonalDataClient";

export const metadata: Metadata = {
    title: "Dashboard | Informações Pessoais",
    description: "Os teus dados pessoais e informações de perfil"
};

export default async function PersonalDataPage() {
    const session = await getSession();
    if (!session || !session.email) {
        redirect("/");
    }
    return <PersonalDataClient />;
}
