"use client";

import React, { createContext, useContext, useCallback, memo, type ReactNode } from 'react';
import { ToastContainer, toast, type ToastOptions } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// ============================================
// TYPES
// ============================================
type NotificationType = 'success' | 'error' | 'info' | 'warning' | 'loading';

export type NotificationDetails = string[] | Record<string, string[]>;

interface NotificationContextType {
    notify: (message: string, type: NotificationType, details?: NotificationDetails) => void;
}

interface ToastConfigItem {
    icon: string;
    iconColor: string;
    borderColor: string;
    bgClass: string;
    title: string;
}

// ============================================
// CONSTANTS
// ============================================
const TOAST_CONFIG: Readonly<Record<NotificationType, ToastConfigItem>> = {
    success: {
        icon: "fa-duotone fa-check-circle",
        iconColor: "text-emerald-300",
        borderColor: "border-emerald-500/30",
        bgClass: "bg-emerald-950/95 shadow-emerald-900/20",
        title: "SUCESSO",
    },
    error: {
        icon: "fa-duotone fa-circle-exclamation",
        iconColor: "text-red-300",
        borderColor: "border-red-500/30",
        bgClass: "bg-red-950/95 shadow-red-900/20",
        title: "ERRO",
    },
    info: {
        icon: "fa-duotone fa-circle-info",
        iconColor: "text-blue-300",
        borderColor: "border-blue-500/30",
        bgClass: "bg-blue-950/95 shadow-blue-900/20",
        title: "INFORMAÇÃO",
    },
    warning: {
        icon: "fa-duotone fa-triangle-exclamation",
        iconColor: "text-amber-300",
        borderColor: "border-amber-500/30",
        bgClass: "bg-amber-950/95 shadow-amber-900/20",
        title: "AVISO",
    },
    loading: {
        icon: "fa-solid fa-spinner fa-spin",
        iconColor: "text-purple-300",
        borderColor: "border-purple-500/30",
        bgClass: "bg-purple-950/95 shadow-purple-900/20",
        title: "CARREGANDO",
    },
} as const;

const BASE_TOAST_OPTIONS: ToastOptions = {
    position: "top-right",
    autoClose: 2500,
    hideProgressBar: true,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: false,
    theme: "dark",
    closeButton: false,
    pauseOnFocusLoss: false,
} as const;

// ============================================
// CONTEXT
// ============================================
const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

// ============================================
// COMPONENTS
// ============================================

/** Renders detail items as a list */
const DetailsList = memo(function DetailsList({ details }: { details: NotificationDetails }) {
    const errorList = Array.isArray(details) ? details : Object.values(details).flat();

    if (errorList.length === 0) return null;

    return (
        <ul className="mt-2 space-y-1 list-none p-0 m-0">
            {errorList.map((item, index) => (
                <li key={index} className="flex items-center gap-2 text-[13px] text-gray-400 font-montserrat">
                    <i className="fa-solid fa-chevron-right text-[8px]" aria-hidden="true" />
                    <span>{item}</span>
                </li>
            ))}
        </ul>
    );
});

/** Custom toast content component */
const ToastContent = memo(function ToastContent({
    type,
    message,
    details,
    timestamp
}: {
    type: NotificationType;
    message: string;
    details?: NotificationDetails;
    timestamp: string;
}) {
    const { icon, iconColor, title } = TOAST_CONFIG[type];

    return (
        <div className="flex items-start gap-3.5">
            <i className={`${icon} ${iconColor} text-xl mt-0.5`} aria-hidden="true" />
            <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1.5">
                    <h4 className={`text-[11px] uppercase font-extrabold tracking-wider leading-none ${iconColor.replace('text-', 'text-')}`}>
                        {title}
                    </h4>
                    <span className="text-[10px] text-gray-500 font-medium">
                        <i className="fa-duotone fa-clock mr-1" aria-hidden="true"></i>
                        {timestamp}
                    </span>
                </div>
                <p className="text-[13px] text-gray-300 font-medium leading-relaxed font-montserrat m-0">
                    {message}
                </p>
                {details && <DetailsList details={details} />}
            </div>
        </div>
    );
});

// ============================================
// PROVIDER
// ============================================
export function NotificationProvider({ children }: { children: ReactNode }) {
    const notify = useCallback((
        message: string,
        type: NotificationType,
        details?: NotificationDetails
    ) => {
        const { borderColor, bgClass } = TOAST_CONFIG[type];
        const now = new Date();
        const timestamp = now.toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' });

        // Map our custom types to react-toastify supported types
        const toastType = type === 'warning' ? 'warning' : type === 'loading' ? 'info' : type;

        toast(
            <ToastContent type={type} message={message} details={details} timestamp={timestamp} />,
            {
                ...BASE_TOAST_OPTIONS,
                type: toastType as 'success' | 'error' | 'info' | 'warning',
                icon: false,
                className: `!${bgClass} !backdrop-blur-md !border ${borderColor} !rounded-lg !shadow-lg !p-3 !min-h-0 !mb-2`,
            }
        );
    }, []);

    return (
        <NotificationContext.Provider value={{ notify }}>
            {children}
            <ToastContainer toastClassName="!min-h-0 !p-3" />
        </NotificationContext.Provider>
    );
}

// ============================================
// HOOK
// ============================================
export function useNotification(): NotificationContextType {
    const context = useContext(NotificationContext);

    if (!context) {
        throw new Error('useNotification must be used within a NotificationProvider');
    }

    return context;
}
