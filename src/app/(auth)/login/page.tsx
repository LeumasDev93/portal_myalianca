/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useState, FormEvent, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { CheckCircle2 } from "lucide-react";
import ImageBG from "@/assets/img_background.png";
import { Label } from "@radix-ui/react-label";
import Input from "@/components/Input";

export default function LoginPage() {
  const { login, isLoading, error, clearError } = useAuth();
  const router = useRouter();
  const [showNewPassword, setShowNewPassword] = useState(false);

  const [isLoginForm, setIsLoginForm] = useState(true);
  const [loginType, setLoginType] = useState<"personal" | "business">(
    "personal"
  );
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isloading, setIsLoading] = useState(false);
  const [erro, setErro] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [step, setStep] = useState<"email" | "otp" | "password">("email");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    clearError();

    try {
      if (!username || !password) {
        throw new Error("Por favor, preencha todos os campos");
      }

      await login(username, password);
    } catch (err) {
      // console.error("Erro no login:", err);
    }
  };

  const handleSendEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErro("");
    setSuccessMessage("");

    try {
      const res = await fetch("/api/auth/recover-password", {
        method: "POST",
        body: JSON.stringify({ email }),
      });

      const data = await res.json();
      if (data.message === "SUCCESS") {
        setSuccessMessage("Código OTP enviado com sucesso.");
        setStep("otp");
      } else {
        setErro(data.message || "Erro ao enviar código.");
      }
    } catch (err) {
      setErro("Erro ao enviar código.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleValidateOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErro("");
    setSuccessMessage("");

    try {
      const res = await fetch("/api/auth/validate-otp", {
        method: "POST",
        body: JSON.stringify({ email, otp }),
      });

      const data = await res.json();

      if (data.message === "SUCCESS") {
        setSuccessMessage("Código validado com sucesso.");
        setStep("password");
      } else {
        setErro(data.message || "Código inválido.");
      }
    } catch (err) {
      setErro("Erro ao validar código.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErro("");
    setSuccessMessage("");

    try {
      const res = await fetch("/api/auth/recover-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp, newPassword }),
      });

      const data = await res.json();

      if (data.message === "SUCCESS") {
        setSuccessMessage("Senha redefinida com sucesso!");
      } else {
        setErro(data.message || "Erro ao redefinir senha.");
      }
    } catch (err) {
      setErro("Erro ao redefinir senha.");
    } finally {
      setIsLoading(false);
    }
  };

  // console.log(useAuth());
  return (
    <div className="flex h-screen flex-col md:flex-row bg-gray-50">
      {/* Banner Side */}
      <div className="hidden md:flex md:w-1/2 relative bg-gradient-to-br from-blue-800 to-blue-600">
        <div className="absolute h-full inset-0 opacity-50">
          <Image
            src={ImageBG}
            alt="Insurance portal"
            fill
            className="object-cover"
            priority
          />
        </div>

        <div className="relative z-10 flex flex-col justify-between h-full p-8 text-white">
          <div className="bg-white/10 p-4 rounded-lg backdrop-blur-sm">
            <h1 className="text-4xl font-bold">MY ALIANCA</h1>
            <p className="text-xl mt-2">Descomplicar e ter</p>
          </div>

          <div className="bg-white/10 p-6 rounded-lg backdrop-blur-sm">
            <h2 className="text-xl font-semibold mb-4">Benefícios:</h2>
            <ul className="space-y-3">
              {[
                "Gerenciamento de apólices",
                "Acompanhamento de sinistros",
                "Pagamentos online",
                "Atendimento personalizado",
              ].map((benefit) => (
                <li key={benefit} className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-300" />
                  <span>{benefit}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Login Form */}
      <div className="flex-1 flex items-center justify-center xl:p-6">
        <div className="w-full sm:max-w-sm xl:max-w-md bg-white p-8 rounded-xl shadow-sm border border-gray-200">
          <div className="mb-8 text-center">
            <h1 className="text-lg xl:text-3xl font-bold text-gray-900 mb-2">
              Bem-vindo
            </h1>
            <p className="text-sm xl:text-lg text-gray-600">
              {loginType === "personal"
                ? "Acesse sua conta pessoal"
                : "Acesse sua conta empresarial"}
            </p>
          </div>
          {error && (
            <div className="absolute -mt-10 flex items-center justify-center w-full xl:max-w-sm py-2 bg-red-500 border shadow-2xl text-white rounded-md text-sm">
              {error}
            </div>
          )}
          {isLoginForm ? (
            <form onSubmit={handleSubmit} className="space-y-2 xl:space-y-4">
              <div>
                <label className="block text-xs xl:text-sm font-medium text-gray-700 mb-2">
                  Tipo de Conta
                </label>
                <div className="inline-flex rounded-md shadow-sm">
                  <button
                    type="button"
                    onClick={() => setLoginType("personal")}
                    className={`px-2 py-1 xl:px-4 xl:py-2 text-xs xl:text-sm font-medium rounded-l-lg border ${
                      loginType === "personal"
                        ? "bg-blue-600 text-white border-blue-600"
                        : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                    }`}
                  >
                    Pessoal
                  </button>
                  <button
                    type="button"
                    onClick={() => setLoginType("business")}
                    className={`px-2 py-1 xl:px-4 xl:py-2 text-xs xl:text-sm font-medium rounded-r-lg border ${
                      loginType === "business"
                        ? "bg-blue-600 text-white border-blue-600"
                        : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                    }`}
                  >
                    Empresarial
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="email"
                  className="block text-xs xl:text-sm font-medium text-gray-700"
                >
                  Email ou NIF
                </label>
                <div className="relative">
                  <input
                    id="email"
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    minLength={8}
                    placeholder="Digite seu email ou NIF"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-xs xl:text-sm"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="password"
                  className="block text-xs xl:text-sm font-medium text-gray-700"
                >
                  Senha
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={8}
                    placeholder="••••••••"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-xs xl:text-sm"
                  />
                  <button
                    type="button"
                    className="absolute right-2 top-2.5 text-gray-500 hover:text-gray-700"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div className="flex justify-between items-center">
                <button
                  type="button"
                  onClick={() => setIsLoginForm(false)}
                  className="text-xs xl:text-sm text-blue-600 hover:text-blue-800"
                >
                  Esqueceu a senha?
                </button>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-blue-600 text-white text-xs xl:text-sm py-1 xl:py-3 rounded-md hover:bg-blue-700 disabled:opacity-70 flex justify-center items-center gap-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="animate-spin h-3 w-3 xl:h-5 xl:w-5" />
                    <span>Entrando...</span>
                  </>
                ) : (
                  "Entrar"
                )}
              </button>
            </form>
          ) : (
            // Formulário de Recuperação de Senha
            <form
              onSubmit={
                step === "email"
                  ? handleSendEmail
                  : step === "otp"
                  ? handleValidateOtp
                  : handleResetPassword
              }
              className="space-y-4"
            >
              <div className="text-center">
                <h3 className="text-lg font-medium text-gray-900">
                  {step === "email"
                    ? "Recuperar Senha"
                    : step === "otp"
                    ? "Validar Código OTP"
                    : "Nova Senha"}
                </h3>
                <p className="mt-2 text-sm text-gray-600">
                  {step === "email" &&
                    "Digite seu email para receber o código OTP"}
                  {step === "otp" &&
                    `Digite o código OTP enviado para ${email}`}
                  {step === "password" && "Digite sua nova senha"}
                </p>
              </div>

              {step === "email" && (
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Email
                  </label>
                  <input
                    type="email"
                    placeholder="seu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full px-3 py-2 border rounded-md text-sm"
                    disabled={isLoading}
                  />
                </div>
              )}

              {step === "otp" && (
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Código OTP
                  </label>
                  <input
                    type="text"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    required
                    className="w-full px-3 py-2 border rounded-md text-sm"
                    disabled={isLoading}
                  />
                </div>
              )}

              {step === "password" && (
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Nova Senha
                  </label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    className="w-full px-3 py-2 border rounded-md text-sm"
                    disabled={isLoading}
                  />
                </div>
              )}

              {error && (
                <p className="text-red-600 text-center text-sm">{error}</p>
              )}
              {successMessage && (
                <p className="text-green-600 text-center text-sm">
                  {successMessage}
                </p>
              )}

              <button
                type="submit"
                className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 flex justify-center items-center gap-2"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Carregando...</span>
                  </>
                ) : step === "email" ? (
                  "Enviar Código"
                ) : step === "otp" ? (
                  "Validar Código"
                ) : (
                  "Redefinir Senha"
                )}
              </button>
            </form>
          )}
          {!isLoginForm && (
            <div className="mt-6 text-center text-xs xl:text-sm text-gray-600">
              <button
                type="button"
                onClick={() => setIsLoginForm(true)}
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                Voltar para login
              </button>
            </div>
          )}

          <div className="mt-2 text-center text-xs xl:text-sm text-gray-600">
            <p>
              Não tem uma conta?{" "}
              <Link href="/cadastro" className="text-blue-600 hover:underline">
                Cadastre-se
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
