import type { Metadata } from "next";
import { PerimetersClient } from "./PerimetersClient";

export const metadata: Metadata = {
    title: "Dashboard | Perímetros",
    description: "Medidas corporais e evolução"
};

export default function PerimetersPage() {
    return <PerimetersClient />;
}
