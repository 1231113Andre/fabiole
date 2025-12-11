"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const router = useRouter();
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
  const [isLoading, setIsLoading] = useState(false);
  const [emailExists, setEmailExists] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
    setEmailExists(false);
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

    setIsLoading(true);

    // Simular verificação de email existente
    // TODO: Backend vai implementar verificação real na coluna C do Google Sheets
    setTimeout(() => {
      // Simular que email já existe (pode remover/alterar depois)
      // const emailExistsInDB = false; // Simulação
      
      // Por agora, vamos assumir que o email não existe e passar para verificação
      // Se o backend retornar erro de email existente, mostrar mensagem
      
      // Simulação: se quiseres testar o erro de email existente, descomenta:
      // if (formData.email === "teste@teste.com") {
      //   setEmailExists(true);
      //   setIsLoading(false);
      //   return;
      // }

      // Continuar para verificação de email
      setStep("verify");
      setIsLoading(false);
      // TODO: Backend vai enviar email com código de 6 dígitos
      // Por agora, simulação - código gerado: 123456
    }, 1500);
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();

    if (verificationCode.length !== 6) {
      setErrors({ verificationCode: "Código deve ter 6 dígitos" });
      return;
    }

    setIsLoading(true);

    // Simular verificação do código
    // TODO: Backend vai verificar o código enviado por email
    setTimeout(() => {
      // Por agora, qualquer código funciona (pode remover depois)
      // if (verificationCode !== "123456") {
      //   setErrors({ verificationCode: "Código inválido" });
      //   setIsLoading(false);
      //   return;
      // }

      // Simular sucesso - registrar na sheet
      // TODO: Backend vai criar nova linha na sheet com os dados
      
      // Redirecionar para login após sucesso
      router.push("/login?registered=true");
    }, 1000);
  };

  const resendCode = () => {
    // TODO: Backend vai reenviar código
    setVerificationCode("");
    setErrors({});
    alert("Código reenviado! Verifica o teu email.");
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
              Criar <span className="text-[#1E90FF]">Conta</span>
            </h1>
            <p className="text-gray-600">
              {step === "form"
                ? "Preenche os teus dados para começares a tua jornada"
                : "Verifica o teu email e insere o código de confirmação"}
            </p>
          </div>

          {step === "form" ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email Exists Alert */}
              {emailExists && (
                <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
                  <div className="flex">
                    <div className="ml-3">
                      <p className="text-sm text-red-700">
                        Este email já está registado.{" "}
                        <Link href="/login" className="font-semibold underline">
                          Inicia sessão aqui
                        </Link>
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Nome Próprio */}
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-2">
                  Nome Próprio *
                </label>
                <input
                  id="firstName"
                  name="firstName"
                  type="text"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  className={`w-full rounded-lg bg-gray-50 border ${
                    errors.firstName ? "border-red-500" : "border-gray-300"
                  } px-4 py-3 text-gray-800 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-[#1E90FF] focus:border-transparent transition-all duration-300`}
                  placeholder="João"
                />
                {errors.firstName && (
                  <p className="mt-1 text-sm text-red-600">{errors.firstName}</p>
                )}
              </div>

              {/* Apelido */}
              <div>
                <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-2">
                  Apelido *
                </label>
                <input
                  id="lastName"
                  name="lastName"
                  type="text"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  className={`w-full rounded-lg bg-gray-50 border ${
                    errors.lastName ? "border-red-500" : "border-gray-300"
                  } px-4 py-3 text-gray-800 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-[#1E90FF] focus:border-transparent transition-all duration-300`}
                  placeholder="Silva"
                />
                {errors.lastName && (
                  <p className="mt-1 text-sm text-red-600">{errors.lastName}</p>
                )}
              </div>

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

              {/* Data de Nascimento */}
              <div>
                <label htmlFor="birthDate" className="block text-sm font-medium text-gray-700 mb-2">
                  Data de Nascimento *
                </label>
                <input
                  id="birthDate"
                  name="birthDate"
                  type="date"
                  value={formData.birthDate}
                  onChange={handleInputChange}
                  className={`w-full rounded-lg bg-gray-50 border ${
                    errors.birthDate ? "border-red-500" : "border-gray-300"
                  } px-4 py-3 text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#1E90FF] focus:border-transparent transition-all duration-300`}
                />
                {errors.birthDate && (
                  <p className="mt-1 text-sm text-red-600">{errors.birthDate}</p>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-[#1E90FF] to-blue-600 hover:from-[#1E90FF]/90 hover:to-blue-600/90 text-white font-bold text-lg py-4 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {isLoading ? "A processar..." : "Continuar"}
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
              <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
                <p className="text-sm text-blue-700">
                  Enviámos um código de verificação para <strong>{formData.email}</strong>
                </p>
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
                  className="text-[#1E90FF] hover:text-[#1E90FF]/80 font-semibold text-sm"
                >
                  Reenviar código
                </button>
              </div>

              {/* Verify Button */}
              <button
                type="submit"
                disabled={isLoading || verificationCode.length !== 6}
                className="w-full bg-gradient-to-r from-[#FF6B35] to-orange-600 hover:from-[#FF6B35]/90 hover:to-orange-600/90 text-white font-bold text-lg py-4 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {isLoading ? "A verificar..." : "Verificar e Criar Conta"}
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
                  className="text-gray-600 hover:text-gray-800 font-semibold text-sm"
                >
                  ← Voltar
                </button>
              </div>
            </form>
          )}
        </motion.div>
      </div>
    </main>
  );
}

