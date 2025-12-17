
import type { Metadata } from "next";
import { QueryProvider } from "@/lib/react-query/QueryProvider";
import ConditionalLayoutWrapper from "./components/ConditionalLayoutWrapper";
import MainLayout from "@/components/MainLayout";
import { ThemeProvider } from "./components/ThemeProvider";
import ServiceWorkerUnregister from "./components/ServiceWorkerUnregister";
import StaticNavbar from "@/components/navbar/StaticNavbar";
import { NotificationProvider } from "@/components/NotificationContext";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Fabio Le — Personal Trainer",
    template: "%s | Fabio Le"
  },
  description: "Personal training presencial e online. Marca já a tua sessão.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Critical inline CSS to prevent Font Awesome icon flash */}


        {/* Preload Font Awesome CSS for immediate rendering - prevents icon flickering */}
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
              <MainLayout navbar={<StaticNavbar />}>
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
