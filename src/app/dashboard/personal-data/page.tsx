import type { Metadata } from "next";
import { PersonalDataClient } from "./PersonalDataClient";

export const metadata: Metadata = {
    title: "Dashboard | Informações Pessoais",
    description: "Os teus dados pessoais e informações de perfil"
};

export default function PersonalDataPage() {
    return <PersonalDataClient />;
}
