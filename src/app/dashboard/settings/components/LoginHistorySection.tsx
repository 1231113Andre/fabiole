"use client";

import { useState, useEffect } from "react";
import { useNotification } from "@/components/NotificationContext";

interface LoginSession {
    id: string;
    device: string;
    browser: string;
    ip: string;
    location: string;
    lastActive: string;
    isCurrent: boolean;
}

interface Props {
    isOpen: boolean;
    onToggle: () => void;
}

export function LoginHistorySection({ isOpen, onToggle }: Props) {
    const { notify } = useNotification();
    const [sessions, setSessions] = useState<LoginSession[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (isOpen && sessions.length === 0) {
            loadSessions();
        }
    }, [isOpen]);

    const loadSessions = async () => {
        setIsLoading(true);
        try {
            const response = await fetch("/api/auth/login-history");
            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || "Erro ao carregar histórico");
            }

            setSessions(result.data || []);
        } catch (error: any) {
            notify(error.message, "error");
        } finally {
            setIsLoading(false);
        }
    };

    const revokeSession = async (sessionId: string) => {
        try {
            const response = await fetch(`/api/auth/revoke-session/${sessionId}`, {
                method: "DELETE",
            });

            if (!response.ok) {
                throw new Error("Erro ao revogar sessão");
            }

            setSessions(sessions.filter(s => s.id !== sessionId));
            notify("Sessão revogada com sucesso", "success");
        } catch (error: any) {
            notify(error.message, "error");
        }
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return new Intl.DateTimeFormat("pt-PT", {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        }).format(date);
    };

    return (
        <div className="rounded-2xl border border-stroke bg-white shadow-default overflow-hidden">
            {/* Header */}
            <button
                onClick={onToggle}
                className="w-full flex items-center justify-between p-6 hover:bg-gray-50 transition-colors cursor-pointer border-none bg-transparent text-left"
            >
                <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
                        <i className="fa-duotone fa-clock-rotate-left text-xl"></i>
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-black">Histórico de Sessões</h3>
                        <p className="text-sm text-muted-foreground">Ver dispositivos e sessões ativas</p>
                    </div>
                </div>
                <i className={`fa-duotone fa-chevron-down text-gray-400 transition-transform ${isOpen ? "rotate-180" : ""}`}></i>
            </button>

            {/* Content */}
            <div className={`grid transition-all duration-300 ease-in-out ${isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}>
                <div className="overflow-hidden">
                    <div className="px-6 pb-6 border-t border-stroke">
                        {isLoading ? (
                            <div className="flex flex-col items-center justify-center gap-2 py-8">
                                <i className="fa-solid fa-spinner fa-spin text-2xl text-[var(--primary)]" aria-hidden />
                                <span className="text-sm text-muted-foreground">A carregar...</span>
                            </div>
                        ) : sessions.length === 0 ? (
                            <div className="text-center py-8 text-muted-foreground">
                                <i className="fa-duotone fa-inbox text-4xl mb-2"></i>
                                <p>Nenhum histórico de sessões disponível</p>
                            </div>
                        ) : (
                            <div className="mt-4 space-y-3">
                                {sessions.map((session) => (
                                    <div
                                        key={session.id}
                                        className={`p-4 rounded-xl border ${session.isCurrent ? "border-primary bg-primary/5" : "border-gray-200 bg-gray-50"}`}
                                    >
                                        <div className="flex items-start justify-between">
                                            <div className="flex items-start gap-3">
                                                <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${session.isCurrent ? "bg-primary text-white" : "bg-gray-200 text-gray-600"}`}>
                                                    <i className="fa-duotone fa-desktop"></i>
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-black flex items-center gap-2">
                                                        {session.device}
                                                        {session.isCurrent && (
                                                            <span className="text-xs bg-primary text-white px-2 py-0.5 rounded-full">
                                                                Sessão atual
                                                            </span>
                                                        )}
                                                    </p>
                                                    <p className="text-sm text-muted-foreground">
                                                        {session.browser} • {session.ip}
                                                    </p>
                                                    <p className="text-xs text-muted-foreground mt-1">
                                                        <i className="fa-duotone fa-clock mr-1"></i>
                                                        {formatDate(session.lastActive)}
                                                        {session.location && ` • ${session.location}`}
                                                    </p>
                                                </div>
                                            </div>
                                            {!session.isCurrent && (
                                                <button
                                                    onClick={() => revokeSession(session.id)}
                                                    className="text-sm text-destructive hover:text-destructive/80 font-medium border-none bg-transparent cursor-pointer"
                                                >
                                                    Revogar
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
