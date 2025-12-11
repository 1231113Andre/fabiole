"use client";
import { useState, useEffect, Suspense } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

function LoginPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loginError, setLoginError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    // Mostrar mensagem de sucesso se veio do registo
    if (searchParams?.get("registered") === "true") {
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 5000);
    }
  }, [searchParams]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear errors when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
    if (loginError) {
      setLoginError("");
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

    setIsLoading(true);
    setLoginError("");

    // Simular verificação no backend
    // TODO: Backend vai:
    // 1. Verificar se email existe na coluna C do Google Sheets
    // 2. Se não existir, mostrar erro "Email não encontrado"
    // 3. Se existir, identificar a linha
    // 4. Verificar se password corresponde à da linha
    // 5. Se corresponder, fazer login e redirecionar para dashboard

    setTimeout(() => {
      // Simulação: se quiseres testar erros, descomenta:
      // if (formData.email === "naoexiste@teste.com") {
      //   setLoginError("Este email não está registado.");
      //   setIsLoading(false);
      //   return;
      // }
      // if (formData.password !== "password123") {
      //   setLoginError("Password incorreta.");
      //   setIsLoading(false);
      //   return;
      // }

      // Simular sucesso - redirecionar para dashboard
      // TODO: Backend vai guardar sessão/autenticação
      router.push("/dashboard");
    }, 1500);
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-orange-50 pt-32 pb-20">
      <div className="container max-w-2xl">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-white rounded-2xl p-8 border border-blue-200 shadow-lg"
        >
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
              Iniciar <span className="text-[#1E90FF]">Sessão</span>
            </h1>
            <p className="text-gray-600">
              Acede à tua conta para veres as tuas informações e planos
            </p>
          </div>

          {/* Success Message */}
          {showSuccess && (
            <div className="mb-6 bg-green-50 border-l-4 border-green-500 p-4 rounded">
              <p className="text-sm text-green-700">
                ✓ Conta criada com sucesso! Podes agora iniciar sessão.
              </p>
            </div>
          )}

          {/* Login Error */}
          {loginError && (
            <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded">
              <p className="text-sm text-red-700">{loginError}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email *
              </label>
              <input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                className={`w-full rounded-lg bg-gray-50 border ${
                  errors.email ? "border-red-500" : "border-gray-300"
                } px-4 py-3 text-gray-800 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-[#1E90FF] focus:border-transparent transition-all duration-300`}
                placeholder="joao.silva@email.com"
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password *
              </label>
              <input
                id="password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleInputChange}
                className={`w-full rounded-lg bg-gray-50 border ${
                  errors.password ? "border-red-500" : "border-gray-300"
                } px-4 py-3 text-gray-800 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-[#1E90FF] focus:border-transparent transition-all duration-300`}
                placeholder="••••••••"
              />
              {errors.password && (
                <p className="mt-1 text-sm text-red-600">{errors.password}</p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-[#FF6B35] to-orange-600 hover:from-[#FF6B35]/90 hover:to-orange-600/90 text-white font-bold text-lg py-4 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {isLoading ? "A iniciar sessão..." : "Iniciar Sessão"}
            </button>

            {/* Register Link */}
            <div className="text-center">
              <p className="text-gray-600">
                Ainda não tens conta?{" "}
                <Link href="/registar" className="text-[#1E90FF] hover:text-[#1E90FF]/80 font-semibold">
                  Regista-te aqui
                </Link>
              </p>
            </div>
          </form>
        </motion.div>
      </div>
    </main>
  );
}

// Wrapper com Suspense para evitar erro no build
export default function LoginPage() {
  return (
    <Suspense fallback={
      <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-orange-50 pt-32 pb-20">
        <div className="container max-w-2xl">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1E90FF] mx-auto mb-4"></div>
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

