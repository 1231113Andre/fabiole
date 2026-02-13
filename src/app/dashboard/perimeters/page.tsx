import type { Metadata } from "next";
import { getSession } from "@/lib/security/session";
import { redirect } from "next/navigation";
import { PerimetersClient } from "./PerimetersClient";

export const metadata: Metadata = {
    title: "Dashboard | Perímetros",
    description: "Medidas corporais e evolução"
};

export default async function PerimetersPage() {
    const session = await getSession();
    if (!session || !session.email) {
        redirect("/");
    }
    return <PerimetersClient />;
}
