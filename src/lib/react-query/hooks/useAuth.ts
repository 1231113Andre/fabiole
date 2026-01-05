"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { getCsrfToken, waitForCsrfToken } from "./useCsrfToken";
import { useNotification } from "@/components/NotificationContext";
import { queryKeys } from "../queryKeys";

interface User {
  name: string;
  surname: string;
  email: string;
  birth: string;
  avatarUrl?: string;
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
  rememberMe?: boolean;
}

interface RegisterData {
  name: string;
  surname: string;
  email: string;
  password: string;
  birth: string;
  gender: string;
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
    queryKey: queryKeys.session,
    queryFn: async () => {
      // Quick check - if no session indicator cookie exists, skip the API call
      // This optimization prevents 401 requests on F5 for non-logged users
      if (typeof document !== 'undefined') {
        // Simple check is enough as has_session is a unique enough name
        const hasSessionCookie = document.cookie.includes('has_session=');
        if (!hasSessionCookie) {
          return { authenticated: false };
        }
      }

      const response = await fetch("/api/auth/session");
      if (!response.ok) {
        return { authenticated: false };
      }
      return response.json();
    },
    // placeholderData allows SSR render but doesn't block cache updates
    placeholderData: initialData,
    enabled,
    // Keep data fresh for 5 seconds - this prevents refetch from overriding setQueryData
    // immediately after login/register before navbar has time to update
    staleTime: 5000,
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
      // Login doesn't require CSRF (protected by rate limiting and lockout)
      // Just get it synchronously if available, don't wait
      const csrfToken = getCsrfToken();

      const headers: HeadersInit = {
        "Content-Type": "application/json",
      };

      // Add CSRF token to headers if available (optional for login)
      if (csrfToken) {
        headers["X-CSRF-Token"] = csrfToken;
      }

      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers,
        body: JSON.stringify(credentials),
      });

      if (!response.ok) {
        const errorData = await response.json();
        // Don't show CSRF errors to user, show proper authentication errors
        if (errorData.error && errorData.error.includes('CSRF')) {
          throw new Error("Erro de segurança. Por favor, recarrega a página e tenta novamente.");
        }
        // Handle rate limiting / lockout with lockoutSeconds
        if (response.status === 401 && errorData.details?.lockoutSeconds) {
          const customError = new Error(errorData.error) as Error & { lockoutSeconds?: number };
          customError.lockoutSeconds = errorData.details.lockoutSeconds;
          throw customError;
        }
        // Show proper error messages
        if (response.status === 401) {
          throw new Error(errorData.error || "Email ou password incorretos");
        }
        if (response.status === 400) {
          throw new Error(errorData.error || "Dados inválidos");
        }
        throw new Error(errorData.error || "Erro ao iniciar sessão");
      }

      const json = await response.json();
      // API returns { success: true, data: { message, user } }
      // Extract the data part
      return json.data || json;
    },
    onSuccess: (data) => {
      // Update cache
      queryClient.setQueryData(queryKeys.session, { authenticated: true, user: data.user });
      // Emit event for instant navbar update
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('session-updated', {
          detail: { authenticated: true, user: data.user }
        }));
      }
      // Show success notification
      notify("Bem-vindo de volta! A sua sessão foi iniciada com sucesso.", "success");
    },
  });
}

/**
 * Mutation hook for user registration
 * Invalidates session query on success and redirects to dashboard (auto-login)
 */
export function useRegister() {
  const queryClient = useQueryClient();
  const { notify } = useNotification();

  return useMutation<RegisterResponse, Error, RegisterData>({
    mutationFn: async (registerData: RegisterData) => {
      // Get CSRF token - wait up to 100ms if not immediately available
      // (should already be loaded by the time user fills the form)
      let csrfToken = getCsrfToken();
      if (!csrfToken) {
        csrfToken = await waitForCsrfToken(100);
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

      const json = await response.json();
      // API returns { success: true, data: { message, user } }
      // Extract the data part
      return json.data || json;
    },
    onSuccess: (data) => {
      // Update cache
      queryClient.setQueryData(queryKeys.session, { authenticated: true, user: data.user });
      // Emit event for instant navbar update
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('session-updated', {
          detail: { authenticated: true, user: data.user }
        }));
      }
      // Show success notification
      notify("A sua conta foi criada com sucesso. Bem-vindo à Fabiole!", "success");
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
      // Get CSRF token - wait up to 100ms if not immediately available
      let csrfToken = getCsrfToken();
      if (!csrfToken) {
        csrfToken = await waitForCsrfToken(100);
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
      queryClient.setQueryData(queryKeys.session, { authenticated: false, user: undefined });
      // Clear all other queries
      queryClient.removeQueries({ predicate: (query) => query.queryKey[0] !== queryKeys.session[0] });
      notify("A sua sessão foi terminada. Até breve!", "info");
      // Redirect to home page
      router.push("/");
    },
    onError: () => {
      // Even on error, clear session state and redirect to home
      queryClient.setQueryData(queryKeys.session, { authenticated: false, user: undefined });
      queryClient.removeQueries({ predicate: (query) => query.queryKey[0] !== queryKeys.session[0] });
      notify("Sessão terminada.", "info");
      router.push("/");
    },
  });
}

