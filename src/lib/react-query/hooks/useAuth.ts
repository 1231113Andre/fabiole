"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { getCsrfToken, waitForCsrfToken } from "./useCsrfToken";
import { useNotification } from "@/components/NotificationContext";

interface User {
  name: string;
  surname: string;
  email: string;
  birth: string;
}

interface SessionResponse {
  authenticated: boolean;
  user?: User;
}

interface LoginResponse {
  message: string;
  user: User;
}

interface LoginData {
  email: string;
  password: string;
}

interface RegisterData {
  name: string;
  surname: string;
  email: string;
  password: string;
  birth: string;
}

interface RegisterResponse {
  message: string;
  user: User;
}

interface UseSessionOptions {
  initialData?: SessionResponse;
  enabled?: boolean;
}

/**
 * Query hook to check authentication session
 * - Uses placeholderData for SSR initial render (no loading spinner)
 * - setQueryData still works for instant updates on login/logout
 */
export function useSession(options: UseSessionOptions = {}) {
  const { initialData, enabled = true } = options;

  return useQuery<SessionResponse>({
    queryKey: ["session"],
    queryFn: async () => {
      const response = await fetch("/api/auth/session");
      if (!response.ok) {
        return { authenticated: false };
      }
      return response.json();
    },
    // placeholderData allows SSR render but doesn't block cache updates
    placeholderData: initialData,
    enabled,
    staleTime: 0, // Always refetch to sync with server
    gcTime: 5 * 60 * 1000,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
    retry: false,
  });
}

/**
 * Mutation hook for user login
 * Invalidates session query on success and redirects to dashboard
 */
export function useLogin() {
  const queryClient = useQueryClient();
  const { notify } = useNotification();

  return useMutation<LoginResponse, Error, LoginData>({
    mutationFn: async (credentials: LoginData) => {
      // Try to get CSRF token, wait up to 500ms if not immediately available
      let csrfToken = getCsrfToken();
      if (!csrfToken) {
        csrfToken = await waitForCsrfToken(500);
      }

      const headers: HeadersInit = {
        "Content-Type": "application/json",
      };

      // Add CSRF token to headers if available
      if (csrfToken) {
        headers["X-CSRF-Token"] = csrfToken;
      }

      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers,
        body: JSON.stringify(credentials),
      });

      if (!response.ok) {
        const error = await response.json();
        // Don't show CSRF errors to user, show proper authentication errors
        if (error.error && error.error.includes('CSRF')) {
          throw new Error("Erro de segurança. Por favor, recarrega a página e tenta novamente.");
        }
        // Show proper error messages
        if (response.status === 401) {
          throw new Error("Email ou password incorretos");
        }
        if (response.status === 400) {
          throw new Error(error.error || "Dados inválidos");
        }
        throw new Error(error.error || "Erro ao iniciar sessão");
      }

      return response.json();
    },
    onSuccess: (data) => {
      // Immediately update session state for instant navbar refresh
      queryClient.setQueryData(["session"], { authenticated: true, user: data.user });
      // Show success notification
      notify("Bem-vindo de volta! A sua sessão foi iniciada com sucesso.", "success");
      // Note: Redirect is handled in the component to ensure cookie is set
    },
  });
}

/**
 * Mutation hook for user registration
 * Invalidates session query on success and redirects to dashboard (auto-login)
 */
export function useRegister() {
  const queryClient = useQueryClient();
  const router = useRouter();
  const { notify } = useNotification();

  return useMutation<RegisterResponse, Error, RegisterData>({
    mutationFn: async (registerData: RegisterData) => {
      // Try to get CSRF token, wait up to 500ms if not immediately available
      let csrfToken = getCsrfToken();
      if (!csrfToken) {
        csrfToken = await waitForCsrfToken(500);
      }

      const headers: HeadersInit = {
        "Content-Type": "application/json",
      };

      // Add CSRF token to headers if available
      if (csrfToken) {
        headers["X-CSRF-Token"] = csrfToken;
      }

      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers,
        body: JSON.stringify(registerData),
      });

      if (!response.ok) {
        const error = await response.json();
        // Don't show CSRF errors to user
        if (error.error && error.error.includes('CSRF')) {
          throw new Error("Erro de segurança. Por favor, recarrega a página e tenta novamente.");
        }
        // Preserve status code for 409 (email exists) handling
        const errorMessage = error.error || "Erro ao criar conta";
        const customError = new Error(errorMessage) as Error & { status?: number };
        customError.status = response.status;
        throw customError;
      }

      return response.json();
    },
    onSuccess: (data) => {
      // Immediately update session state for instant navbar refresh
      queryClient.setQueryData(["session"], { authenticated: true, user: data.user });
      notify("A sua conta foi criada com sucesso. Bem-vindo à Fabiole!", "success");
      // Redirect to dashboard (auto-login after registration)
      router.push("/dashboard");
    },
  });
}

/**
 * Mutation hook for user logout
 * Invalidates all queries and redirects to login
 */
export function useLogout() {
  const queryClient = useQueryClient();
  const router = useRouter();
  const { notify } = useNotification();

  return useMutation<void, Error, void>({
    mutationFn: async () => {
      // Try to get CSRF token, wait up to 500ms if not immediately available
      let csrfToken = getCsrfToken();
      if (!csrfToken) {
        csrfToken = await waitForCsrfToken(500);
      }

      const headers: HeadersInit = {};

      // Add CSRF token to headers if available
      if (csrfToken) {
        headers["X-CSRF-Token"] = csrfToken;
      }

      const response = await fetch("/api/auth/session", {
        method: "DELETE",
        headers,
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        if (error.error && error.error.includes('CSRF')) {
          throw new Error("Erro de segurança. Por favor, recarrega a página e tenta novamente.");
        }
        throw new Error("Erro ao terminar sessão");
      }
    },
    onSuccess: () => {
      // Immediately clear session state for instant navbar refresh
      queryClient.setQueryData(["session"], { authenticated: false, user: undefined });
      // Clear all other queries
      queryClient.removeQueries({ predicate: (query) => query.queryKey[0] !== "session" });
      notify("A sua sessão foi terminada. Até breve!", "info");
      // Redirect to home page
      router.push("/");
    },
    onError: () => {
      // Even on error, clear session state and redirect to home
      queryClient.setQueryData(["session"], { authenticated: false, user: undefined });
      queryClient.removeQueries({ predicate: (query) => query.queryKey[0] !== "session" });
      notify("Sessão terminada.", "info");
      router.push("/");
    },
  });
}

