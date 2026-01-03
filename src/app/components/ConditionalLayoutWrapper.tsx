"use client";
import { usePathname } from "next/navigation";
import Footer from "./Footer";
import { isValidPageRoute } from '@/lib/utils/routes';

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
  const isValidRoute = isValidPageRoute(pathname);

  if (isDashboard || pathname?.startsWith("/admin") || !isValidRoute) {
    return <>{children}</>;
  }

  return (
    <>
      {children}
      <Footer />
    </>
  );
}

