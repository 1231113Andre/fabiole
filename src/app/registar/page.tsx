"use client";
import { useState } from "react";
import Link from "next/link";
import { useRegister } from "@/lib/react-query/hooks/useAuth";

export default function RegisterPage() {
  const registerMutation = useRegister();
  const [step, setStep] = useState<"form" | "verify">("form");
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    birthDate: "",
  });
  const [verificationCode, setVerificationCode] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [emailExists, setEmailExists] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
    setEmailExists(false);
    // Clear mutation error when user starts typing
    if (registerMutation.error) {
      registerMutation.reset();
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = "Nome próprio é obrigatório";
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = "Apelido é obrigatório";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email é obrigatório";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Email inválido";
    }

    if (!formData.password.trim()) {
      newErrors.password = "Password é obrigatória";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password deve ter pelo menos 6 caracteres";
    }

    if (!formData.birthDate) {
      newErrors.birthDate = "Data de nascimento é obrigatória";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setEmailExists(false);
    setErrors({});

    // Use TanStack Query mutation
    registerMutation.mutate(
      {
        name: formData.firstName,
        surname: formData.lastName,
        email: formData.email,
        password: formData.password,
        birth: formData.birthDate,
      },
      {
        onError: (error: Error & { status?: number }) => {
          if (error.status === 409) {
            setEmailExists(true);
          } else {
            setErrors({ general: error.message || "Erro ao criar conta" });
          }
        },
      }
    );
  };

  // Get general error from mutation
  const generalError = registerMutation.error && !emailExists 
    ? registerMutation.error.message 
    : errors.general;

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    // This step is now skipped - registration happens directly
  };

  const resendCode = () => {
    // TODO: Backend vai reenviar código
    setVerificationCode("");
    setErrors({});
    alert("Código reenviado! Verifica o teu email.");
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-orange-50 pt-32 pb-20">
      <div className="container mx-auto px-4 max-w-2xl">
        <div className="bg-white rounded-2xl p-8 border border-blue-200 shadow-lg animate-fade-in-up">
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
              Criar <span className="text-[#1E90FF]">Conta</span>
            </h1>
            <p className="text-gray-600">
              {step === "form"
                ? "Preenche os teus dados para começares a tua jornada"
                : "Verifica o teu email e insere o código de confirmação"}
            </p>
          </div>

          {step === "form" ? (
            <form onSubmit={handleSubmit}>
              {/* Email Exists Alert */}
              {emailExists && (
                <div className="bg-red-50 border border-red-200 text-red-800 rounded-lg p-4 mb-4" role="alert">
                  Este email já está registado.{" "}
                  <Link href="/login" className="font-semibold underline hover:text-red-900">
                    Inicia sessão aqui
                  </Link>
                </div>
              )}

              {/* Nome Próprio */}
              <div className="mb-3">
                <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-2">Nome Próprio *</label>
                <input
                  id="firstName"
                  name="firstName"
                  type="text"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  className={`w-full rounded-lg bg-gray-50 border ${errors.firstName ? "border-red-500" : "border-gray-300"} px-4 py-3 text-gray-800 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-300`}
                  placeholder="João"
                />
                {errors.firstName && (
                  <div className="mt-1 text-sm text-red-600">{errors.firstName}</div>
                )}
              </div>

              {/* Apelido */}
              <div className="mb-3">
                <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-2">Apelido *</label>
                <input
                  id="lastName"
                  name="lastName"
                  type="text"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  className={`w-full rounded-lg bg-gray-50 border ${errors.lastName ? "border-red-500" : "border-gray-300"} px-4 py-3 text-gray-800 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-300`}
                  placeholder="Silva"
                />
                {errors.lastName && (
                  <div className="mt-1 text-sm text-red-600">{errors.lastName}</div>
                )}
              </div>

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

              {/* Data de Nascimento */}
              <div className="mb-3">
                <label htmlFor="birthDate" className="block text-sm font-medium text-gray-700 mb-2">
                  Data de Nascimento *
                </label>
                <input
                  id="birthDate"
                  name="birthDate"
                  type="date"
                  value={formData.birthDate}
                  onChange={handleInputChange}
                  className={`w-full rounded-lg bg-gray-50 border ${errors.birthDate ? "border-red-500" : "border-gray-300"} px-4 py-3 text-gray-800 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-300`}
                />
                {errors.birthDate && (
                  <div className="mt-1 text-sm text-red-600">{errors.birthDate}</div>
                )}
              </div>

              {/* General Error */}
              {generalError && (
                <div className="bg-red-50 border border-red-200 text-red-800 rounded-lg p-4 mb-4" role="alert">
                  {generalError}
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={registerMutation.isPending}
                className="modern-btn-submit w-full"
              >
                {registerMutation.isPending ? "A processar..." : "Continuar"}
              </button>

              {/* Login Link */}
              <div className="text-center">
                <p className="text-gray-600">
                  Já tens conta?{" "}
                  <Link href="/login" className="text-[#1E90FF] hover:text-[#1E90FF]/80 font-semibold">
                    Inicia sessão
                  </Link>
                </p>
              </div>
            </form>
          ) : (
            <form onSubmit={handleVerifyCode} className="space-y-6">
              {/* Info Message */}
              <div className="bg-blue-50 border border-blue-200 text-blue-800 rounded-lg p-4 mb-4" role="alert">
                Enviámos um código de verificação para <strong>{formData.email}</strong>
              </div>

              {/* Verification Code */}
              <div>
                <label htmlFor="verificationCode" className="block text-sm font-medium text-gray-700 mb-2">
                  Código de Verificação (6 dígitos) *
                </label>
                <input
                  id="verificationCode"
                  name="verificationCode"
                  type="text"
                  value={verificationCode}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, "").slice(0, 6);
                    setVerificationCode(value);
                    if (errors.verificationCode) {
                      setErrors((prev) => ({ ...prev, verificationCode: "" }));
                    }
                  }}
                  className={`w-full rounded-lg bg-gray-50 border ${
                    errors.verificationCode ? "border-red-500" : "border-gray-300"
                  } px-4 py-3 text-gray-800 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-[#1E90FF] focus:border-transparent transition-all duration-300 text-center text-2xl tracking-widest font-mono`}
                  placeholder="000000"
                  maxLength={6}
                />
                {errors.verificationCode && (
                  <p className="mt-1 text-sm text-red-600">{errors.verificationCode}</p>
                )}
              </div>

              {/* Resend Code */}
              <div className="text-center">
                <button
                  type="button"
                  onClick={resendCode}
                  className="text-primary no-underline font-semibold hover:text-primary/80 transition-colors bg-transparent border-0 cursor-pointer"
                >
                  Reenviar código
                </button>
              </div>

              {/* Verify Button */}
              <button
                type="submit"
                disabled={registerMutation.isPending || verificationCode.length !== 6}
                className="modern-btn-submit w-full"
              >
                {registerMutation.isPending ? "A verificar..." : "Verificar e Criar Conta"}
              </button>

              {/* Back Button */}
              <div className="text-center">
                <button
                  type="button"
                  onClick={() => {
                    setStep("form");
                    setVerificationCode("");
                    setErrors({});
                  }}
                  className="text-gray-600 no-underline font-semibold inline-flex items-center gap-2 bg-transparent border-0 cursor-pointer hover:text-gray-800 transition-colors"
                >
                  <i className="fas fa-arrow-left"></i>
                  Voltar
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </main>
  );
}

