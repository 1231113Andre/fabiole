import { LoadingSpinner as FullPageSpinner } from "@/components/LoadingSpinner";

export function LoadingSpinner() {
    return <FullPageSpinner />;
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
 * Small Font Awesome Pro spinner for use inside buttons
 * @param color - 'white' for primary buttons, 'primary' for ghost buttons
 */
export function ButtonSpinner({ color = 'white' }: { color?: 'white' | 'primary' }) {
    const textClass = color === 'white' ? 'text-white' : 'text-[var(--primary)]';
    return <i className={`fa-solid fa-spinner fa-spin ${textClass}`} aria-hidden />;
}
