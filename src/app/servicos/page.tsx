import type { Metadata } from "next";
import { ServicesClient } from "./ServicesClient";

export const metadata: Metadata = {
  title: "Planos e Preços | Fábio Lé Personal Trainer",
  description: "Consulta os preços dos planos de personal training presencial em Lisboa e online. Flexibilidade, personalização e resultados.",
};

import { SettingsService } from "@/lib/api/services/SettingsService";

export default async function ServicosPage() {
  const settings = await SettingsService.getSettings();

  return <ServicesClient initialSettings={settings} />;
}
