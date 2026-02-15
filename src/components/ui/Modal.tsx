import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";

// Types
interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    children: React.ReactNode;
    size?: "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | "4xl" | "5xl" | "6xl";
    className?: string;
}

interface ModalHeaderProps {
    title: string;
    description?: string;
    icon?: string;
    iconColor?: "primary" | "danger" | "warning" | "success" | "info";
    onClose?: () => void;
    className?: string;
}

interface ModalBodyProps {
    children: React.ReactNode;
    className?: string;
}

interface ModalFooterProps {
    children: React.ReactNode;
    className?: string;
}

// Modal Root Component
const Modal = ({ isOpen, onClose, children, size = "4xl", className = "" }: ModalProps) => {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        if (isOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "unset";
        }
        return () => {
            document.body.style.overflow = "unset";
        };
    }, [isOpen]);

    if (!mounted || !isOpen) return null;

    // Advanced granular sizing classes for fluid responsiveness
    // Each size maps to:
    // 1. Full width on mobile/tablet (up to a point)
    // 2. Specific max-width on larger screens
    // 3. Fluid margins to prevent touching edges
    const sizeClasses = {
        sm: "w-[95%] sm:max-w-sm",
        md: "w-[95%] sm:max-w-md",
        lg: "w-[95%] sm:max-w-lg",
        xl: "w-[95%] sm:max-w-lg md:max-w-xl",
        "2xl": "w-[95%] sm:max-w-xl md:max-w-2xl",
        "3xl": "w-[95%] sm:max-w-xl md:max-w-2xl lg:max-w-3xl",
        "4xl": "w-[95%] sm:max-w-xl md:max-w-2xl lg:max-w-4xl xl:max-w-5xl",
        "5xl": "w-[95%] sm:max-w-xl md:max-w-2xl lg:max-w-4xl xl:max-w-6xl",
        "6xl": "w-[95%] sm:max-w-xl md:max-w-2xl lg:max-w-4xl xl:max-w-7xl", // Extra large
    };

    const modalContent = (
        <div
            className="fixed inset-0 z-[1050] flex items-end sm:items-center justify-center p-0 sm:p-4 md:p-6 lg:p-8"
            role="presentation"
        >
            {/* Validated Backdrop with stronger blur for premium feel */}
            <div
                className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm transition-opacity animate-in fade-in duration-300"
                onClick={onClose}
                aria-hidden="true"
            />

            <div
                className={`
                    relative bg-white text-gray-900 
                    w-full ${sizeClasses[size]} 
                    
                    /* Mobile: Bottom Sheet Styles */
                    rounded-t-[32px] sm:rounded-2xl 
                    
                    /* Shadows */
                    shadow-[0_-8px_30px_rgba(0,0,0,0.15)] sm:shadow-2xl sm:shadow-black/20 
                    
                    /* Heights */
                    max-h-[85dvh] h-auto sm:h-auto sm:max-h-[92vh] 
                    
                    /* Animation & Transitions */
                    animate-in duration-300
                    slide-in-from-bottom-full sm:slide-in-from-bottom-8 sm:zoom-in-95 
                    fade-in
                    
                    /* Layout */
                    flex flex-col 
                    border border-white/20 sm:border-gray-100 
                    
                    /* Mobile safe area spacing */
                    pb-safe sm:pb-0
                    ${className}
                `}
                onClick={(e) => e.stopPropagation()}
                role="dialog"
                aria-modal="true"
            >
                {/* Mobile Handle for bottom sheet feel */}
                <div className="absolute top-3 left-1/2 -translate-x-1/2 w-12 h-1.5 bg-gray-300 rounded-full sm:hidden z-50 pointer-events-none opacity-50"></div>

                {children}
            </div>
        </div>
    );

    return createPortal(modalContent, document.body);
};

// Modal Header
const Header = ({ title, description, icon, iconColor = "primary", onClose, className = "" }: ModalHeaderProps) => {
    // Subtle background colors using global vars via Tailwind opacity utils
    const iconColors = {
        primary: "bg-primary/10 text-primary ring-primary/20",
        danger: "bg-red-50 text-red-600 ring-red-100",
        warning: "bg-amber-50 text-amber-600 ring-amber-100",
        success: "bg-emerald-50 text-emerald-600 ring-emerald-100",
        info: "bg-blue-50 text-blue-600 ring-blue-100",
    };

    return (
        <div className={`relative px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-100 flex justify-between items-start sm:items-center bg-white ${className}`}>
            <div className="flex items-center gap-3 pr-8 sm:pr-0">
                {icon && (
                    <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg ${iconColors[iconColor]} flex items-center justify-center flex-shrink-0 transition-all duration-200`}>
                        <i className={`fa-duotone ${icon} text-base sm:text-lg`}></i>
                    </div>
                )}
                <div>
                    <h3 className="font-bold text-base sm:text-lg text-gray-900 flex items-center gap-2 tracking-tight leading-tight">
                        {title}
                    </h3>
                    {description && (
                        <p className="text-[11px] sm:text-xs text-gray-500 mt-0.5 font-medium leading-tight">{description}</p>
                    )}
                </div>
            </div>
            {onClose && (
                <button
                    onClick={onClose}
                    className="absolute top-3 right-3 sm:static w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-gray-700 hover:bg-gray-50 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary/20"
                    aria-label="Close modal"
                >
                    <i className="fa-solid fa-xmark text-lg"></i>
                </button>
            )}
        </div>
    );
};

// Modal Body
const Body = ({ children, className = "" }: ModalBodyProps) => {
    return (
        <div className={`overflow-y-auto flex-1 p-4 sm:p-5 bg-white overscroll-contain ${className}`}>
            {children}
        </div>
    );
};

// Modal Footer
const Footer = ({ children, className = "" }: ModalFooterProps) => {
    return (
        <div className={`mt-auto px-4 sm:px-6 py-3 sm:py-4 border-t border-gray-100 bg-gray-50/50 backdrop-blur-sm flex flex-col-reverse sm:flex-row justify-end gap-2 sm:gap-3 sticky bottom-0 z-10 ${className}`}>
            {children}
        </div>
    );
};

// Attach subcomponents
Modal.Header = Header;
Modal.Body = Body;
Modal.Footer = Footer;

export { Modal };
