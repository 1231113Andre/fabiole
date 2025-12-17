"use client";

import React, { createContext, useContext, useCallback, memo, type ReactNode } from 'react';
import { ToastContainer, toast, type ToastOptions } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// ============================================
// TYPES
// ============================================
type NotificationType = 'success' | 'error' | 'info';

export type NotificationDetails = string[] | Record<string, string[]>;

interface NotificationContextType {
    notify: (message: string, type: NotificationType, details?: NotificationDetails) => void;
}

interface ToastConfigItem {
    icon: string;
    iconColor: string;
    borderColor: string;
}

// ============================================
// CONSTANTS
// ============================================
const TOAST_CONFIG: Readonly<Record<NotificationType, ToastConfigItem>> = {
    success: {
        icon: "fa-duotone fa-circle-check",
        iconColor: "text-emerald-500",
        borderColor: "border-emerald-200",
    },
    error: {
        icon: "fa-duotone fa-circle-xmark",
        iconColor: "text-red-500",
        borderColor: "border-red-200",
    },
    info: {
        icon: "fa-duotone fa-circle-info",
        iconColor: "text-primary",
        borderColor: "border-primary/30",
    },
} as const;

const BASE_TOAST_OPTIONS: ToastOptions = {
    position: "top-right",
    autoClose: 3000,
    hideProgressBar: true,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: false,
    theme: "light",
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
                <li key={index} className="flex items-center gap-2 text-xs text-gray-500 font-montserrat">
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
    details
}: {
    type: NotificationType;
    message: string;
    details?: NotificationDetails;
}) {
    const { icon, iconColor } = TOAST_CONFIG[type];

    return (
        <div className="flex items-center gap-3 py-0.5">
            <i className={`${icon} ${iconColor} text-xl flex-shrink-0`} aria-hidden="true" />
            <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-800 leading-tight font-montserrat m-0">
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
        const { borderColor } = TOAST_CONFIG[type];

        toast(
            <ToastContent type={type} message={message} details={details} />,
            {
                ...BASE_TOAST_OPTIONS,
                type,
                icon: false,
                className: `!bg-white !backdrop-blur-sm !border ${borderColor} !rounded-xl !shadow-lg !shadow-gray-200/50`,
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
