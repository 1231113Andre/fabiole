import { getServerPathname } from "@/lib/utils/pathname";
import Footer from "./Footer";

/**
 * Conditional Layout Wrapper - Server Component
 * Handles layout conditionally based on route (SSR)
 * Note: Navbar is now rendered directly in layout.tsx for proper fixed positioning
 */
export const dynamic = 'force-dynamic';

export default async function ConditionalLayoutWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  // Get pathname from headers (server-side)
  const pathname = await getServerPathname();
  const isDashboard = pathname.startsWith("/dashboard");

  if (isDashboard) {
    return <>{children}</>;
  }

  return (
    <>
      {children}
      <Footer />
    </>
  );
}

