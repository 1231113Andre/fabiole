import type { Metadata } from "next";
import { ContactClient } from "./ContactClient";

export const metadata: Metadata = {
  title: "Contactos",
  description: "Entre em contacto com Fábio Lé para marcar a sua sessão de treino ou tirar dúvidas.",
};

export default function ContactoPage() {
  return <ContactClient />;
}
