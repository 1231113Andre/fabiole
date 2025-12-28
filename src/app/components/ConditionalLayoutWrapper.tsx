"use client";
import { usePathname } from "next/navigation";
import Footer from "./Footer";

/**
 * Conditional Layout Wrapper - Client Component
 * Handles layout conditionally based on route (CSR) to ensure updates on navigation
 */
export default function ConditionalLayoutWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isDashboard = pathname?.startsWith("/dashboard");

  if (isDashboard || pathname?.startsWith("/admin")) {
    return <>{children}</>;
  }

  return (
    <>
      {children}
      <Footer />
    </>
  );
}

