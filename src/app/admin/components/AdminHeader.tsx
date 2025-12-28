import NewButton from "@/app/components/newButton";

interface AdminHeaderProps {
    title?: string;
    subtitle?: string;
    icon?: string;
}

/**
 * AdminHeader - Server Component compatible
 * Shows page title with optional subtitle
 * When subtitle is provided, displays it; otherwise shows generic admin welcome
 */
export function AdminHeader({
    title = "Painel de Administração",
    subtitle,
    icon = "fa-shield-halved"
}: AdminHeaderProps) {
    return (
        <div className="mb-6 sm:mb-8">
            <div className="flex justify-start mb-6">
                <div className="flex items-center gap-3">
                    <NewButton
                        href="/dashboard"
                        variant="new_destructive_rounded"
                        icon={<i className="fa-duotone fa-lock-keyhole" />}
                        className="shadow-lg font-bold uppercase tracking-widest text-sm h-12 px-6"
                    >
                        DASHBOARD DO CLIENTE
                    </NewButton>
                </div>
            </div>

            {/* Page Title */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-black mb-2 flex items-center gap-3">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-primary to-orange-600 flex items-center justify-center shadow-lg">
                            <i className={`fa-duotone ${icon} text-white text-lg sm:text-xl`}></i>
                        </div>
                        <span>{title}</span>
                    </h1>
                    {subtitle && (
                        <p className="text-muted-foreground text-lg sm:text-xl font-medium mt-1">
                            {subtitle}
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
}
