
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
    template: "%s | Fabio Le — Personal Trainer"
  },
  description: "Personal training presencial e online. Marca já a tua sessão.",
  icons: {
    icon: [
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon-96x96.png', sizes: '96x96', type: 'image/png' },
      { url: '/favicon-192x192.png', sizes: '192x192', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
      { url: '/apple-touch-icon-57x57.png', sizes: '57x57', type: 'image/png' },
      { url: '/apple-touch-icon-60x60.png', sizes: '60x60', type: 'image/png' },
      { url: '/apple-touch-icon-72x72.png', sizes: '72x72', type: 'image/png' },
      { url: '/apple-touch-icon-76x76.png', sizes: '76x76', type: 'image/png' },
      { url: '/apple-touch-icon-114x114.png', sizes: '114x114', type: 'image/png' },
      { url: '/apple-touch-icon-120x120.png', sizes: '120x120', type: 'image/png' },
      { url: '/apple-touch-icon-144x144.png', sizes: '144x144', type: 'image/png' },
      { url: '/apple-touch-icon-152x152.png', sizes: '152x152', type: 'image/png' },
      { url: '/apple-touch-icon-180x180.png', sizes: '180x180', type: 'image/png' },
    ],
    other: [
      { rel: 'mask-icon', url: '/favicon-32x32.png' },
    ],
  },
  manifest: '/manifest.json',
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
