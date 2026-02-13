import type { Metadata } from "next";
import { getSession } from "@/lib/security/session";
import { redirect } from "next/navigation";
import { ReferencesClient } from "./ReferencesClient";

export const metadata: Metadata = {
    title: "Dashboard | Referências",
    description: "Tabelas de referência e consulta"
};

export default async function ReferencesPage() {
    const session = await getSession();
    if (!session || !session.email) {
        redirect("/");
    }
    return <ReferencesClient />;
}
