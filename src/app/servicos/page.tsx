import type { Metadata } from "next";
import { ServicesClient } from "./ServicesClient";

export const metadata: Metadata = {
  title: "Serviços",
  description: "Conheça os meus serviços de Personal Training, Presencial, Online e Ginástica Laboral.",
};

export default function ServicosPage() {
  return <ServicesClient />;
}
