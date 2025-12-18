
import type { Metadata } from "next";

import { QueryProvider } from "@/lib/react-query/QueryProvider";
import ConditionalLayoutWrapper from "./components/ConditionalLayoutWrapper";
import MainLayout from "@/components/MainLayout";
import { ThemeProvider } from "./components/ThemeProvider";
import ServiceWorkerUnregister from "./components/ServiceWorkerUnregister";
import ServerNavbar from "@/components/navbar/ServerNavbar";
import { NotificationProvider } from "@/components/NotificationContext";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Fabio Le — Personal Trainer",
    template: "%s | Fabio Le"
  },
  description: "Personal training presencial e online. Marca já a tua sessão.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Preload critical Font Awesome webfonts for immediate SSR rendering */}
        <link
          rel="preload"
          href="/fontawesome/webfonts/fa-duotone-900.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
        <link
          rel="preload"
          href="/fontawesome/webfonts/fa-solid-900.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
        <link
          rel="preload"
          href="/fontawesome/webfonts/fa-brands-400.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />

        {/* Load Font Awesome CSS with high priority */}
        <link
          rel="preload"
          href="/fontawesome/css/all.min.css"
          as="style"
        />
        <link
          rel="stylesheet"
          href="/fontawesome/css/all.min.css"
        />
      </head>
      <body
        className="antialiased"
        suppressHydrationWarning
      >
        <ServiceWorkerUnregister />
        <ThemeProvider>
          <QueryProvider>
            <NotificationProvider>
              <MainLayout navbar={<ServerNavbar />}>
                <ConditionalLayoutWrapper>
                  {children}
                </ConditionalLayoutWrapper>
              </MainLayout>
            </NotificationProvider>
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
