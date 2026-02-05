import { LoadingSpinner as UiSpinner } from "@/components/ui/spinner";

const ADMIN_DEFAULT_STEPS = [
    { label: "A carregar o painel...", description: "A carregar as ferramentas administrativas." },
    { label: "A validar acessos", description: "A verificar as suas permissões de administrador." },
    { label: "A preparar dados", description: "A organizar as estatísticas e utilizadores." },
    { label: "Quase lá", description: "A abrir a consola de administração." }
];

export function LoadingSpinner() {
    return (
        <div className="flex items-center justify-center min-h-screen bg-boxdark-2">
            <UiSpinner
                steps={ADMIN_DEFAULT_STEPS}
                size="text-5xl"
            />
        </div>
    );
}

export function ErrorMessage({ message }: { message: string }) {
    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-50">
            <div className="text-center">
                <i className="fa-duotone fa-triangle-exclamation text-4xl text-red-500 mb-4"></i>
                <p className="text-lg text-gray-600">{message}</p>
            </div>
        </div>
    );
}

/**
 * Small spinner for use inside buttons
 * @param color - 'white' for primary buttons, 'primary' for ghost buttons
 */
export function ButtonSpinner({ color = 'white' }: { color?: 'white' | 'primary' }) {
    const borderColor = color === 'white'
        ? 'border-t-white border-r-white'
        : 'border-t-primary border-r-primary';
    const innerBorderColor = color === 'white'
        ? 'border-b-white/60 border-l-white/60'
        : 'border-b-primary/60 border-l-primary/60';

    return (
        <div className="relative w-5 h-5">
            <div className={`absolute inset-0 rounded-full border-2 border-transparent ${borderColor} animate-spin`} />
            <div
                className={`absolute inset-1 rounded-full border-2 border-transparent ${innerBorderColor} animate-spin`}
                style={{ animationDirection: 'reverse', animationDuration: '0.6s' }}
            />
        </div>
    );
}
