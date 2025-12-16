import type { Metadata } from "next";
import "./globals.css";
import { QueryProvider } from "@/lib/react-query/QueryProvider";
import ConditionalLayoutWrapper from "./components/ConditionalLayoutWrapper";
import MainLayout from "@/components/MainLayout";
import { ThemeProvider } from "./components/ThemeProvider";
import ServiceWorkerUnregister from "./components/ServiceWorkerUnregister";

export const metadata: Metadata = {
  title: {
    default: "Fabio Le — Personal Trainer",
    template: "%s | Fabio Le"
  },
  description: "Personal training presencial e online. Marca já a tua sessão.",
};

// Force dynamic rendering to prevent caching issues with HMR during development
// In production, you can remove this or change to 'auto'
export const dynamic = 'force-dynamic';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Disable caching in development mode */}
        {process.env.NODE_ENV === 'development' && (
          <>
            <meta httpEquiv="Cache-Control" content="no-cache, no-store, must-revalidate" />
            <meta httpEquiv="Pragma" content="no-cache" />
            <meta httpEquiv="Expires" content="0" />
          </>
        )}
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
            <MainLayout>
              <ConditionalLayoutWrapper>
                {children}
              </ConditionalLayoutWrapper>
            </MainLayout>
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
