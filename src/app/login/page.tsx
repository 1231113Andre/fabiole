"use client";
import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useLogin } from "@/lib/react-query/hooks/useAuth";
import ToastContainer from "@/app/components/ToastContainer";

function LoginPageInner() {
  const searchParams = useSearchParams();
  const loginMutation = useLogin();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [toasts, setToasts] = useState<Array<{ id: string; message: string; type: "success" | "danger" | "warning" | "info" }>>([]);

  useEffect(() => {
    // Mostrar mensagem de sucesso se veio do registo
    if (searchParams?.get("registered") === "true") {
      addToast("Conta criada com sucesso! Podes agora iniciar sessão.", "success");
    }
  }, [searchParams]);

  const addToast = (message: string, type: "success" | "danger" | "warning" | "info" = "info") => {
    const id = Date.now().toString();
    setToasts((prev) => [...prev, { id, message, type }]);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  useEffect(() => {
    if (loginMutation.error) {
      addToast(loginMutation.error.message, "danger");
    }
  }, [loginMutation.error]);

  // Handle successful login - redirect to dashboard
  useEffect(() => {
    if (loginMutation.isSuccess && loginMutation.data) {
      addToast("Login realizado com sucesso! A redirecionar...", "success");
      // Use window.location.href for full page reload to ensure cookie is read
      // Wait longer to ensure cookie is set in browser before redirect
      setTimeout(() => {
        window.location.href = "/dashboard";
      }, 1500);
    }
  }, [loginMutation.isSuccess, loginMutation.data]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear errors when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.email.trim()) {
      newErrors.email = "Email é obrigatório";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Email inválido";
    }

    if (!formData.password.trim()) {
      newErrors.password = "Password é obrigatória";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    // Use TanStack Query mutation
    loginMutation.mutate({
      email: formData.email,
      password: formData.password,
    });
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-orange-50 pt-32 pb-20">
      <ToastContainer toasts={toasts} onClose={removeToast} />
      
      <div className="container mx-auto px-4" style={{ maxWidth: '42rem' }}>
        <div className="bg-white shadow-lg border-0 rounded-2xl animate-fade-in-up">
          <div className="p-4">
            <div className="text-center mb-4">
              <h1 className="text-4xl md:text-5xl font-bold mb-3">
                Iniciar <span className="text-primary">Sessão</span>
              </h1>
              <p className="text-gray-600">
                Acede à tua conta para veres as tuas informações e planos
              </p>
            </div>

          <form onSubmit={handleSubmit}>
            {/* Email */}
            <div className="mb-3">
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
              <input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                className={`w-full rounded-lg bg-gray-50 border ${errors.email ? "border-red-500" : "border-gray-300"} px-4 py-3 text-gray-800 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-300`}
                placeholder="joao.silva@email.com"
              />
              {errors.email && (
                <div className="mt-1 text-sm text-red-600">{errors.email}</div>
              )}
            </div>

            {/* Password */}
            <div className="mb-3">
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">Password *</label>
              <input
                id="password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleInputChange}
                className={`w-full rounded-lg bg-gray-50 border ${errors.password ? "border-red-500" : "border-gray-300"} px-4 py-3 text-gray-800 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-300`}
                placeholder="••••••••"
              />
              {errors.password && (
                <div className="mt-1 text-sm text-red-600">{errors.password}</div>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loginMutation.isPending}
              className="modern-btn-submit w-full"
            >
              {loginMutation.isPending ? "A iniciar sessão..." : "Iniciar Sessão"}
            </button>

            {/* Register Link */}
            <div className="text-center mt-3">
              <p className="text-gray-600 mb-0">
                Ainda não tens conta?{" "}
                <Link href="/registar" className="text-primary no-underline font-semibold hover:text-primary/80 transition-colors">
                  Regista-te aqui
                </Link>
              </p>
            </div>
          </form>
          </div>
        </div>
      </div>
    </main>
  );
}

// Wrapper com Suspense para evitar erro no build
export default function LoginPage() {
  return (
    <Suspense fallback={
      <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-orange-50 pt-32 pb-20">
        <div className="container mx-auto px-4" style={{ maxWidth: '42rem' }}>
          <div className="flex items-center justify-center" style={{ minHeight: '400px' }}>
            <div className="text-center">
              <div className="animate-spin rounded-full border-4 border-primary border-t-transparent mb-3 mx-auto" style={{ width: '3rem', height: '3rem' }} role="status">
                <span className="sr-only">A carregar...</span>
              </div>
              <p className="text-gray-600">A carregar...</p>
            </div>
          </div>
        </div>
      </main>
    }>
      <LoginPageInner />
    </Suspense>
  );
}

