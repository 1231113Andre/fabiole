import type { Metadata } from "next";
import { ReferencesClient } from "./ReferencesClient";

export const metadata: Metadata = {
    title: "Dashboard | Referências",
    description: "Tabelas de referência e consulta"
};

export default function ReferencesPage() {
    return <ReferencesClient />;
}
