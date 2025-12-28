/**
 * Loading States for Admin Panel
 * Using the same spinner style as the main app LoadingSpinner
 */

export function LoadingSpinner() {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
            {/* Two-part spinner - same as main app */}
            <div className="relative w-16 h-16">
                {/* Outer ring - slower rotation */}
                <div
                    className="absolute inset-0 rounded-full border-4 border-transparent border-t-primary border-r-primary"
                    style={{ animation: 'spin 1.5s linear infinite' }}
                />
                {/* Inner ring - faster rotation, opposite direction */}
                <div
                    className="absolute inset-2 rounded-full border-4 border-transparent border-b-primary/70 border-l-primary/70"
                    style={{ animation: 'spin-reverse 1s linear infinite' }}
                />
                {/* Center dot */}
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-2.5 h-2.5 rounded-full bg-primary animate-pulse" />
                </div>
            </div>

            {/* Loading text */}
            <p className="mt-6 text-gray-500 text-sm font-medium tracking-wide">
                A carregar...
            </p>

            {/* Custom keyframes */}
            <style jsx>{`
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
                @keyframes spin-reverse {
                    from { transform: rotate(360deg); }
                    to { transform: rotate(0deg); }
                }
            `}</style>
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
