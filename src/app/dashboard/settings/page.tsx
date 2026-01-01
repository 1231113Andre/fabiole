import type { Metadata } from "next";
import { SettingsClient } from "./SettingsClient";

export const metadata: Metadata = {
    title: "Dashboard | Definições",
    description: "Configurações da conta, segurança e preferências"
};

export default function SettingsPage() {
    return <SettingsClient />;
}
