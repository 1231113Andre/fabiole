import { cookies } from "next/headers";
import DashboardLayoutClient from "./DashboardLayoutClient";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const collapsed = cookieStore.get("sidebar:collapsed")?.value === "true";

  return (
    <DashboardLayoutClient defaultCollapsed={collapsed}>
      {children}
    </DashboardLayoutClient>
  );
}
