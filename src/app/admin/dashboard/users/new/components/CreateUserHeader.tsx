import NewButton from "@/app/components/newButton";

export function CreateUserHeader() {
    return (
        <>
            {/* Top Navigation */}
            <div className="mb-4">
                <NewButton
                    href="/admin/dashboard/overview"
                    variant="new_primary_rounded"
                    icon={<i className="fa-duotone fa-arrow-left" />}
                    className="shadow-lg font-bold uppercase tracking-widest text-sm h-12 px-6"
                >
                    Visão Geral
                </NewButton>
            </div>

            {/* Header Area */}
            <div className="relative mb-6 p-6 bg-white rounded-2xl border border-gray-200 shadow-sm flex items-center gap-6">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                    <i className="fa-duotone fa-user-plus text-3xl"></i>
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Criar Novo Utilizador</h1>
                    <p className="text-gray-500 font-medium">Registo manual de um novo cliente no sistema</p>
                </div>
            </div>
        </>
    );
}
