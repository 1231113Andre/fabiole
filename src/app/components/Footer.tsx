"use client";

import { memo } from "react";
import Link from "next/link";
import SocialIcons from "./SocialIcons";

const Footer = memo(function Footer() {
  return (
    <footer className="bg-primary">
      <div className="container mx-auto px-4 py-5">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-1">
            <h3 className="text-white font-semibold mb-3">Fábio Lé</h3>
            <p className="text-white/70 text-sm">Personal training presencial e online. Resultados reais, plano personalizado.</p>
          </div>
          <div className="md:col-span-1">
            <h4 className="text-white font-semibold mb-3">Links</h4>
            <ul className="list-none space-y-2">
              <li>
                <Link className="text-white/70 no-underline hover:text-secondary transition-colors" href="/">
                  Home
                </Link>
              </li>
              <li>
                <Link className="text-white/70 no-underline hover:text-secondary transition-colors" href="/sobre">
                  Sobre
                </Link>
              </li>
              <li>
                <Link className="text-white/70 no-underline hover:text-secondary transition-colors" href="/servicos">
                  Serviços
                </Link>
              </li>
              <li>
                <Link className="text-white/70 no-underline hover:text-secondary transition-colors" href="/contacto">
                  Contacto
                </Link>
              </li>
            </ul>
          </div>
          <div className="md:col-span-1">
            <h4 className="text-white font-semibold mb-3">Redes sociais</h4>
            <div className="flex gap-3">
              <SocialIcons className="text-white/70" iconSize="w-6 h-6" />
            </div>
          </div>
        </div>
      </div>
      <div className="border-t border-primary/50">
        <div className="container mx-auto px-4 py-3 text-center">
          <small className="text-white/70">© 2024 Fábio Lé. Todos os direitos reservados.</small>
        </div>
      </div>
    </footer>
  );
});

Footer.displayName = "Footer";

export default Footer;
