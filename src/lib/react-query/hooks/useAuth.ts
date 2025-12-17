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

/**
 * Query hook to check authentication session
 * Cache: 5 minutes staleTime
 * Refetch on window focus
 * @param initialData - Optional initial session data from server (SSR)
 */
export function useSession(initialData?: SessionResponse) {
  return useQuery<SessionResponse>({
    queryKey: ["session"],
    queryFn: async () => {
      const response = await fetch("/api/auth/session");
      if (!response.ok) {
        return { authenticated: false };
      }
      return response.json();
    },
    initialData: initialData, // Use SSR data as initial data to prevent flickering
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: true,
    retry: false, // Don't retry on 401 errors
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
    onSuccess: () => {
      // Invalidate session query to refetch with new auth state
      queryClient.invalidateQueries({ queryKey: ["session"] });
      // Show success notification
      notify("Login efetuado com sucesso!", "success");
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
    onSuccess: () => {
      // Invalidate session query to refetch with new auth state
      queryClient.invalidateQueries({ queryKey: ["session"] });
      notify("Conta criada com sucesso!", "success");
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
      // Invalidate all queries to clear cache
      queryClient.clear();
      notify("Sessão terminada com sucesso", "info");
      // Redirect to home page
      router.push("/");
    },
    onError: () => {
      // Even on error, clear cache and redirect to home
      queryClient.clear();
      notify("Sessão terminada", "info");
      router.push("/");
    },
  });
}

