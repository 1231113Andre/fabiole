import NewButton from "@/app/components/newButton";
import { DashboardClient } from "./components/DashboardClient";
import { getSession } from "@/lib/security/session";
import { redirect } from "next/navigation";
import { UserService } from "@/lib/api/services/UserService";
import { UserSheetData } from "@/lib/types/dashboard";

export const dynamic = 'force-dynamic';

export default async function DashboardOverviewPage() {
  const session = await getSession();

  if (!session || !session.email) {
    redirect("/");
  }

  // Fetch full user data using centralized service (Source of Truth: Prisma)
  // This ensures consistency between server-side render and client-side API calls
  let userData: UserSheetData | null = null;
  try {
    userData = await UserService.getUserData(session.email);
  } catch (error) {
    console.error("Error fetching user data:", error);
    // If user not found or error, handle gracefully
    return (
      <div className="flex items-center justify-center min-h-screen text-gray-500">
        Utilizador não encontrado ou erro ao carregar dados.
      </div>
    );
  }

  if (!userData) {
    return (
      <div className="flex items-center justify-center min-h-screen text-gray-500">
        Utilizador não encontrado.
      </div>
    );
  }

  // Create a minimal object for the header greeting since we have full data in userData
  // But we use session name/surname as fallback or source
  const user = {
    name: session.name,
    surname: session.surname,
    email: session.email,
    birth: session.birth
  };

  // We can determine admin status from session usually, or fetch from DB if needed.
  // Session verifySession usually returns role. 
  // But previously we checked DB. 
  // Let's assume session is valid. 
  // Wait, session object from verifySession usually has role? 
  // getSession returns payload. Payload has role?
  // Let's check getSession. 
  // If not, we can check DB. UserService doesn't return role explicitly in UserSheetData.

  // Let's fetch role separately or assume session role if available. 
  // Previous code: db.user.findUnique({ select: { role: true } })
  // I'll keep a lightweight DB check for admin role ONLY, to be safe.
  const { db } = await import("@/lib/db/client");
  const adminCheck = await db.user.findUnique({
    where: { email: session.email },
    select: { role: true }
  });
  const isAdmin = adminCheck?.role === 'ADMINISTRATOR';

  return (
    <>
      {/* Page Header */}
      <div className="mb-6 sm:mb-8">
        {/* Navigation Buttons */}
        <div className="mb-6 flex flex-wrap gap-4">
          <NewButton
            href="/"
            variant="new_primary_rounded"
            icon={<i className="fa-duotone fa-home-lg" />}
            iconPosition="left"
            className="w-full sm:w-auto min-w-[200px] shadow-md uppercase font-bold"
          >
            Voltar ao Site
          </NewButton>

          {/* Admin Panel Button - Only visible for administrators */}
          {isAdmin && (
            <div className="relative inline-block group/admin-btn">
              <NewButton
                href="/admin/dashboard/overview"
                variant="new_destructive_rounded"
                icon={<i className="fa-duotone fa-lock-keyhole" />}
                iconPosition="left"
                className="w-full sm:w-auto min-w-[200px] shadow-md uppercase font-bold pr-10"
              >
                Painel Admin
              </NewButton>

              {/* Tooltip Wrapper - Positioned Top Right */}
              <div className="absolute -top-2 -right-2 z-20 group/tooltip">
                {/* Icon Trigger */}
                <div className="bg-white text-gray-400 hover:text-red-600 rounded-full w-6 h-6 flex items-center justify-center shadow-md border border-gray-100 cursor-help transition-all transform hover:scale-110">
                  <i className="fa-duotone fa-circle-info text-xs"></i>
                </div>

                {/* Tooltip Content - Compact & Bottom Positioned */}
                <div className="absolute top-full right-0 mt-2 w-64 bg-white/95 backdrop-blur-sm border border-gray-100 rounded-xl shadow-xl opacity-0 invisible group-hover/tooltip:opacity-100 group-hover/tooltip:visible transition-all duration-200 transform origin-top-right scale-95 group-hover/tooltip:scale-100 z-50 text-left overflow-hidden">

                  {/* Header - Compact */}
                  <div className="bg-red-50/80 px-3 py-2 border-b border-red-100/50 flex items-center gap-2">
                    <i className="fa-duotone fa-shield-check text-red-600 text-sm"></i>
                    <span className="font-bold text-xs text-gray-900">Acesso Administrativo</span>
                  </div>

                  {/* Body - Compact */}
                  <div className="p-3 space-y-2">
                    <div className="flex items-center gap-2 text-[10px] text-gray-500 border-b border-gray-50 pb-1">
                      <i className="fa-duotone fa-user-circle"></i>
                      <span className="truncate flex-1 font-medium text-gray-700">{session.email}</span>
                    </div>
                    <p className="text-[10px] text-gray-400 leading-tight">
                      Permissões totais de gestão do sistema.
                    </p>
                  </div>

                  {/* Decorative Arrow pointing up */}
                  <div className="absolute bottom-full right-2 border-8 border-transparent border-b-white/95 filter drop-shadow-sm"></div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Page Title */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
          <div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-black mb-2 flex items-center gap-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-primary to-primary-hover flex items-center justify-center shadow-lg">
                <i className="fa-duotone fa-user-circle text-white text-lg sm:text-xl" />
              </div>
              <span>Dashboard do Cliente</span>
            </h1>
            <p className="text-muted-foreground text-lg sm:text-xl font-medium flex items-center gap-2 mt-1 animate-in fade-in slide-in-from-left-4 duration-700 delay-200">
              <span className="text-2xl hover:animate-pulse cursor-default">👋</span>
              Bem-vindo de volta,{" "}
              <span className="text-primary font-bold">
                {user ? `${user.name} ${user.surname}!` : "Visitante!"}
              </span>
            </p>
          </div>
        </div>
      </div>

      {/* Content - Hydrated Client Component */}
      <DashboardClient initialData={userData} />
    </>
  );
}

