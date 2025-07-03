/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useState, FormEvent, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import {
  AlertCircle,
  ArrowRight,
  Eye,
  EyeOff,
  Loader2,
  LockKeyhole,
  Mail,
  User,
  Lock,
  ArrowLeft,
} from "lucide-react";
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
        <div className="absolute h-full inset-0 opacity-90">
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
            <h1 className="text-4xl font-bold">MY ALIANÇA</h1>
            <p className="text-xl mt-2">Descomplicar e ter My Aliança</p>
          </div>

          <div className="bg-white/50 p-6 rounded-lg backdrop-blur-sm text-blue-900">
            <h2 className="text-xl font-semibold mb-4 ">Serviços:</h2>
            <ul className="space-y-3">
              {[
                "Gerenciamento de apólices",
                "Acompanhamento de sinistros",
                "Pagamentos online",
                "Atendimento personalizado",
              ].map((benefit) => (
                <li key={benefit} className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 " />
                  <span>{benefit}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Login Form */}
      <div className="flex-1 flex items-center justify-center xl:p-6">
        <div className="w-full sm:max-w-sm xl:max-w-md bg-white p-8 rounded-xl shadow-lg border border-gray-100 transition-all duration-300 hover:shadow-xl">
          {/* Cabeçalho com animação sutil */}
          <div className="mb-8 text-center transform transition-transform duration-300 hover:scale-[1.01]">
            <h1 className="text-2xl xl:text-3xl font-bold text-gray-900 mb-2 bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text ">
              Bem-vindo(a) de volta
            </h1>
            <div className="w-20 h-1 bg-gradient-to-r from-blue-400 to-blue-600 mx-auto rounded-full"></div>
          </div>

          {/* Mensagem de erro com animação */}
          {error && (
            <div className="mb-4 animate-fade-in-down">
              <div className="flex items-center justify-center w-full py-3 px-4 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm">
                <AlertCircle className="h-5 w-5 mr-2" />
                {error}
              </div>
            </div>
          )}

          {isLoginForm ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Input de Email/NIF com efeito flutuante */}
              <div className="relative group">
                <input
                  id="email"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  minLength={8}
                  className="block w-full px-4 py-3 text-sm bg-white border border-gray-200 rounded-lg transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent peer"
                  placeholder=" "
                />
                <label
                  htmlFor="email"
                  className="absolute text-sm text-gray-500 duration-300 transform -translate-y-4 scale-75 top-3 left-4 z-10 origin-[0] bg-white px-1 peer-focus:px-1 peer-focus:text-blue-600 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-4"
                >
                  Email ou NIF
                </label>
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-gray-400 group-focus-within:text-blue-500 transition-colors">
                  <User className="h-5 w-5" />
                </div>
              </div>

              {/* Input de Senha com toggle integrado */}
              <div className="relative group">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={8}
                  className="block w-full px-4 py-3 text-sm bg-white border border-gray-200 rounded-lg transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent peer"
                  placeholder=" "
                />
                <label
                  htmlFor="password"
                  className="absolute text-sm text-gray-500 duration-300 transform -translate-y-4 scale-75 top-3 left-4 z-10 origin-[0] bg-white px-1 peer-focus:px-1 peer-focus:text-blue-600 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-4"
                >
                  Senha
                </label>
                <button
                  type="button"
                  className="absolute right-3 top-3.5 text-gray-400 hover:text-blue-500 transition-colors"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>

              {/* Link de esqueci senha com animação */}
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => setIsLoginForm(false)}
                  className="text-sm text-blue-600 hover:text-blue-800 transition-colors duration-200 underline-offset-4 hover:underline"
                >
                  Esqueceu a senha?
                </button>
              </div>

              {/* Botão de submit com efeitos */}
              <button
                type="submit"
                disabled={isLoading}
                className={`w-full py-3 px-4 inline-flex justify-center items-center gap-2 rounded-lg font-medium text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 ${
                  isLoading
                    ? "bg-blue-400 cursor-not-allowed"
                    : "bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-md hover:shadow-lg"
                }`}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="animate-spin h-5 w-5" />
                    <span>Entrando...</span>
                  </>
                ) : (
                  <>
                    <span>Entrar</span>
                    <ArrowRight className="h-5 w-5" />
                  </>
                )}
              </button>
            </form>
          ) : (
            // Formulário de Recuperação de Senha (estilizado)
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
              <div className="text-center transform transition-transform duration-300 hover:scale-[1.01]">
                <h3 className="text-xl font-bold text-gray-900 bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text">
                  {step === "email"
                    ? "Recuperar Senha"
                    : step === "otp"
                    ? "Validar Código"
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
                <div className="relative group">
                  <input
                    type="email"
                    placeholder=" "
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="block w-full px-4 py-3 text-sm bg-white border border-gray-200 rounded-lg transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent peer"
                    disabled={isLoading}
                  />
                  <label className="absolute text-sm text-gray-500 duration-300 transform -translate-y-4 scale-75 top-3 left-4 z-10 origin-[0] bg-white px-1 peer-focus:px-1 peer-focus:text-blue-600 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-4">
                    Seu Email
                  </label>
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-gray-400 group-focus-within:text-blue-500 transition-colors">
                    <Mail className="h-5 w-5" />
                  </div>
                </div>
              )}

              {step === "otp" && (
                <div className="relative group">
                  <input
                    type="text"
                    placeholder=" "
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    required
                    className="block w-full px-4 py-3 text-sm bg-white border border-gray-200 rounded-lg transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent peer"
                    disabled={isLoading}
                  />
                  <label className="absolute text-sm text-gray-500 duration-300 transform -translate-y-4 scale-75 top-3 left-4 z-10 origin-[0] bg-white px-1 peer-focus:px-1 peer-focus:text-blue-600 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-4">
                    Código OTP
                  </label>
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-gray-400 group-focus-within:text-blue-500 transition-colors">
                    <LockKeyhole className="h-5 w-5" />
                  </div>
                </div>
              )}

              {step === "password" && (
                <div className="relative group">
                  <input
                    type="password"
                    placeholder=" "
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    className="block w-full px-4 py-3 text-sm bg-white border border-gray-200 rounded-lg transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent peer"
                    disabled={isLoading}
                  />
                  <label className="absolute text-sm text-gray-500 duration-300 transform -translate-y-4 scale-75 top-3 left-4 z-10 origin-[0] bg-white px-1 peer-focus:px-1 peer-focus:text-blue-600 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-4">
                    Nova Senha
                  </label>
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-gray-400 group-focus-within:text-blue-500 transition-colors">
                    <Lock className="h-5 w-5" />
                  </div>
                </div>
              )}

              {successMessage && (
                <div className="animate-fade-in-down">
                  <div className="flex items-center justify-center w-full py-3 px-4 bg-green-50 border border-green-200 text-green-600 rounded-lg text-sm">
                    <CheckCircle2 className="h-5 w-5 mr-2" />
                    {successMessage}
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className={`w-full py-3 px-4 inline-flex justify-center items-center gap-2 rounded-lg font-medium text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 ${
                  isLoading
                    ? "bg-blue-400 cursor-not-allowed"
                    : "bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-md hover:shadow-lg"
                }`}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="animate-spin h-5 w-5" />
                    <span>Processando...</span>
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

          {/* Botão de voltar para login */}
          {!isLoginForm && (
            <div className="mt-6 text-center">
              <button
                type="button"
                onClick={() => setIsLoginForm(true)}
                className="text-sm text-blue-600 hover:text-blue-800 transition-colors duration-200 underline-offset-4 hover:underline flex items-center justify-center gap-1"
              >
                <ArrowLeft className="h-4 w-4" />
                Voltar para login
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
