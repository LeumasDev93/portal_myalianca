/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useState, FormEvent, useEffect } from "react";
import { useAuth } from "@/contexts/auth-context";
import Logo from "@/assets/logo_fundo_branco.png";
import LogoMobile from "@/assets/AlincaSeguros.png";
import LogoForm from "@/assets/alianca.png";
import {
  AlertCircle,
  ArrowRight,
  Eye,
  EyeOff,
  Loader2,
  LockKeyhole,
  Mail,
  User,
  ArrowLeft,
} from "lucide-react";
import Image from "next/image";
import { CheckCircle2 } from "lucide-react";

interface ApiErrorDetails {
  response?: {
    code: string;
    desc: string;
    type: string;
  };
}

interface ApiResponse {
  error?: string;
  details?: ApiErrorDetails;
  response?: {
    code: string;
    desc?: string;
    type?: string;
  };
}

export default function LoginPage() {
  const { login, isLoading, error, clearError } = useAuth();
  const [showNewPassword, setShowNewPassword] = useState(false);

  const [isLoginForm, setIsLoginForm] = useState(true);

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isloading, setIsLoading] = useState(false);
  const [erro, setErro] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [step, setStep] = useState<"email" | "otp" | "password">("email");
  const [otp, setOtp] = useState("");
  const [new_password, setNewPassword] = useState("");

  const ImageCapa = `/api/proxy-image?url=${encodeURIComponent(
    `${process.env.NEXT_PUBLIC_API_BASE_URL_DEFAULT}/files/1.0.0/login-file`
  )}`;
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
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();
      console.log("Recover password response:", data);
      console.log("Response status:", res.status);

      // Tratamento de erro
      if (data.error) {
        setErro(data.error);
        setTimeout(() => {
          setErro("");
        }, 5000);
        return;
      }

      // Tratamento de sucesso - API retorna results.code === 1 e results.message === "SUCCESS"
      if (data.results?.code === 1 && data.results?.message === "SUCCESS") {
        setSuccessMessage(
          data.results.message_details || "Código OTP enviado com sucesso."
        );
        setTimeout(() => {
          setStep("otp");
          setSuccessMessage("");
        }, 2000);
        return;
      }

      // Verificar se há erro na estrutura info
      if (data.info?.errors && data.info.errors.length > 0) {
        setErro(data.info.errors.join(" / "));
        setTimeout(() => {
          setErro("");
        }, 5000);
        return;
      }

      // Formato não reconhecido
      console.log("Resposta não reconhecida:", data);
      setErro("Resposta do servidor não reconhecida");
      setTimeout(() => {
        setErro("");
      }, 5000);
    } catch (err) {
      setErro("Erro ao conectar com o servidor");
      setTimeout(() => {
        setErro("");
      }, 5000);
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
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, otp }),
      });

      const data = await res.json();
      console.log("Validate OTP response:", data);

      // Tratamento de erro - API retorna code: 0 ou 3 para erros
      if (data.code === 0 || data.code === 3) {
        setErro(data.message || "Código inválido.");
        setTimeout(() => {
          setErro("");
        }, 5000);
        return;
      }

      // Tratamento de sucesso - API retorna code: 1
      if (data.code === 1) {
        setSuccessMessage("Código validado com sucesso!");
        setTimeout(() => {
          setStep("password");
          setSuccessMessage("");
        }, 2000);
      } else {
        setErro(data.message || "Código inválido.");
        setTimeout(() => {
          setErro("");
        }, 5000);
      }
    } catch (err) {
      setErro("Erro ao validar código.");
      setTimeout(() => {
        setErro("");
      }, 5000);
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
      const res = await fetch("/api/auth/confirm-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, otp, new_password }),
      });

      const data = await res.json();

      // Tratamento de erro - pegar o erro diretamente do campo `error`
      if (!res.ok || data.error || data.code === 3) {
        setErro(data.error || "Erro ao redefinir senha.");
        setTimeout(() => setErro(""), 5000);
        return;
      }

      // Tratamento de sucesso - API retorna code: 1
      if (data.code === 1) {
        setSuccessMessage("Senha redefinida com sucesso!");
        setTimeout(() => {
          setIsLoginForm(true);
          setStep("email");
          setEmail("");
          setOtp("");
          setNewPassword("");
        }, 2000);
      } else {
        setErro(data.message || "Erro ao redefinir senha.");
        setTimeout(() => {
          setErro("");
        }, 5000);
      }
    } catch (err) {
      setErro("Erro de rede ao redefinir senha.");
      setTimeout(() => {
        setErro("");
      }, 5000);
    } finally {
      setIsLoading(false);
    }
  };

  // console.log(useAuth());
  return (
    <div className="relative h-screen w-full bg-gradient-to-br from-blue-900 to-red-800 overflow-hidden">
      {/* Logo e Texto - Mobile no centro da página */}
      <div className="lg:hidden absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 text-center px-4">
        <Image src={Logo} alt="Logo" width={200} height={80} className="w-44 md:w-56 h-auto mx-auto mb-4 md:mb-6" />
        <h1 className="text-3xl md:text-4xl font-bold text-white mb-2 md:mb-3">MYALIANÇA</h1>
        <p className="text-base md:text-lg text-white/90">Descomplicar É Ter MyAliança</p>
      </div>

      {/* Logo - Apenas no Desktop, no canto superior esquerdo */}
      <div className="hidden lg:block absolute top-6 left-6 z-30">
        <Image src={Logo} alt="Logo" width={100} height={100} className="w-44 h-16" />
      </div>

      {/* Banner Semi-Transparente no Centro - Largura Full */}
      <div className="hidden lg:block absolute top-1/2 left-0 right-0 -translate-y-1/2 z-10">
        <div className="bg-white/10 backdrop-blur-md py-8 lg:py-10 xl:py-12 2xl:py-14 px-6 lg:px-8 xl:px-10 2xl:px-12">
          <div className="max-w-2xl lg:max-w-3xl xl:max-w-4xl 2xl:max-w-5xl mx-auto text-left text-white">
            <h1 className="text-3xl lg:text-4xl xl:text-5xl 2xl:text-6xl font-bold mb-2 lg:mb-3 xl:mb-4">MYALIANÇA</h1>
            <p className="text-base lg:text-lg xl:text-xl 2xl:text-2xl">Descomplicar É Ter MyAliança</p>
          </div>
        </div>
      </div>

      {/* Serviços na Parte Inferior Esquerda - Oculto no Mobile e Tablet */}
      <div className="hidden lg:block absolute bottom-8 left-8 lg:left-16 z-10 max-w-sm">
        <div className="bg-white/10 backdrop-blur-md rounded-lg p-4 lg:p-5 xl:p-6 text-white space-y-2 lg:space-y-2.5 xl:space-y-3">
          {[
            "Gerenciamento de apólices",
            "Acompanhamento de sinistros",
            "Pagamentos online",
            "Atendimento personalizado",
          ].map((benefit) => (
            <div key={benefit} className="flex items-center gap-2.5 lg:gap-3">
              <CheckCircle2 className="h-4 lg:h-4 xl:h-5 w-4 lg:w-4 xl:w-5 text-white flex-shrink-0" />
              <span className="text-xs lg:text-sm xl:text-base">{benefit}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Formulário de Login - Mobile fixo no bottom, Desktop/Tablet à direita */}
      <div className="fixed bottom-0 left-0 right-0 md:absolute md:left-1/2 md:top-1/2 lg:left-auto lg:right-48 md:-translate-x-1/2 lg:translate-x-0 md:-translate-y-1/2 z-20 w-full md:max-w-sm lg:max-w-md md:px-6 lg:px-0">
        <div className="bg-gray-100 rounded-t-3xl md:rounded-2xl shadow-2xl p-6 md:p-6 lg:p-7 xl:p-6 2xl:p-8 max-h-[75vh] md:max-h-[85vh] lg:max-h-[90vh] 2xl:max-h-[100vh] overflow-y-auto">
          {/* Barra de indicação - Apenas Mobile */}
          <div className="md:hidden w-12 h-1.5 bg-gray-400 rounded-full mx-auto mb-4"></div>
          
          <div className="w-full transition-all duration-300">
          {/* Logo acima do formulário */}
          <div className="hidden lg:flex justify-center mb-3 md:mb-4 lg:mb-5 xl:mb-4 2xl:mb-6 w-20 h-16 mx-auto">
            <Image src={LogoForm} alt="Aliança Seguros" width={100} height={100} className="w-full h-full" />
          </div>

          {/* Cabeçalho com animação sutil */}
          <div className="mb-3 md:mb-5 lg:mb-6 xl:mb-5 2xl:mb-7 w-full max-w-sm mx-auto text-center transform transition-transform duration-300 hover:scale-[1.01]">
            <h1 className="text-sm md:text-base lg:text-lg xl:text-xl font-bold text-gray-900 mb-2 bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text w-full max-w-xs mx-auto leading-tight">
              {isLoginForm
                ? "FAÇA LOGIN NA SUA ÁREA DE CLIENTE"
                : step === "email"
                ? "RECUPERAR SENHA"
                : step === "otp"
                ? "VALIDAR CÓDIGO"
                : "REDEFINIR SENHA"}
            </h1>
            <div className="w-12 md:w-16 lg:w-20 h-0.5 md:h-1 bg-gradient-to-r from-blue-400 to-blue-600 mx-auto rounded-full"></div>
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
            <form onSubmit={handleSubmit} className="space-y-3 md:space-y-4 lg:space-y-5 xl:space-y-4 2xl:space-y-6">
              {/* Input de Email/NIF com efeito flutuante */}
              <div className="relative group">
                <input
                  id="email"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  minLength={8}
                  className="block w-full px-3 md:px-4 py-2.5 md:py-3 text-sm bg-white border border-gray-200 rounded-lg transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent peer"
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
                  className="block w-full px-3 md:px-4 py-2.5 md:py-3 text-sm bg-white border border-gray-200 rounded-lg transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent peer"
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
                  className="absolute right-3 top-3.5 text-gray-400 hover:text-blue-500 transition-colors cursor-pointer"
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
                  onClick={() => {
                    setIsLoginForm(false);
                    setStep("email");
                  }}
                  className="text-sm text-blue-600 cursor-pointer hover:text-blue-800 transition-colors duration-200 underline-offset-4 hover:underline"
                >
                  Esqueceu a senha?
                </button>
              </div>

              {/* Botão de submit com efeitos */}
              <button
                type="submit"
                disabled={isLoading}
                className={`w-full py-2.5 md:py-3 px-4 inline-flex justify-center items-center gap-2 rounded-lg font-medium text-sm md:text-base text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 ${
                  isLoading
                    ? "bg-blue-400 cursor-not-allowed"
                    : "bg-gradient-to-r from-blue-600 cursor-pointer to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-md hover:shadow-lg"
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
              className="space-y-3 md:space-y-4 lg:space-y-5 xl:space-y-4 2xl:space-y-6"
            >
              <div className="text-center transform transition-transform duration-300 hover:scale-[1.01]">
                <p className="mt-2 text-sm text-gray-600">
                  {step === "email" &&
                    "Digite seu email para receber o código OTP"}
                  {step === "otp" &&
                    `Digite o código OTP enviado para ${email}`}
                  {step === "password" && "Digite sua nova senha"}
                </p>
              </div>
              {erro && (
                <div className="mb-4 animate-fade-in-down">
                  <div className="flex items-center justify-center w-full py-3 px-4 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm">
                    <AlertCircle className="h-5 w-5 mr-2" />
                    {erro}
                  </div>
                </div>
              )}
              {step === "email" && (
                <div className="relative group">
                  <input
                    type="email"
                    placeholder=" "
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="block w-full px-3 md:px-4 py-2.5 md:py-3 text-sm bg-white border border-gray-200 rounded-lg transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent peer"
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
                    className="block w-full px-3 md:px-4 py-2.5 md:py-3 text-sm bg-white border border-gray-200 rounded-lg transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent peer"
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
                    type={showNewPassword ? "text" : "password"}
                    placeholder=" "
                    value={new_password}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    className="block w-full px-3 md:px-4 py-2.5 md:py-3 text-sm bg-white border border-gray-200 rounded-lg transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent peer"
                    disabled={isLoading}
                  />
                  <label className="absolute text-sm text-gray-500 duration-300 transform -translate-y-4 scale-75 top-3 left-4 z-10 origin-[0] bg-white px-1 peer-focus:px-1 peer-focus:text-blue-600 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-4">
                    Nova Senha
                  </label>
                  <button
                    type="button"
                    className="absolute right-3 top-3.5 text-gray-400 hover:text-blue-500 transition-colors"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    aria-label={
                      showNewPassword ? "Ocultar senha" : "Mostrar senha"
                    }
                  >
                    {showNewPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
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
                disabled={isloading}
                className={`w-full py-2.5 md:py-3 px-4 inline-flex justify-center items-center gap-2 rounded-lg font-medium text-sm md:text-base text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 ${
                  isloading
                    ? "bg-blue-400 cursor-not-allowed"
                    : "bg-gradient-to-r cursor-pointer from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-md hover:shadow-lg"
                }`}
              >
                {isloading ? (
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
            <div className="mt-5 md:mt-6 xl:mt-5 2xl:mt-7 text-center">
              <button
                type="button"
                onClick={() => setIsLoginForm(true)}
                className="text-sm text-blue-600 cursor-pointer hover:text-blue-800 transition-colors duration-200 underline-offset-4 hover:underline flex items-center justify-center gap-1"
              >
                <ArrowLeft className="h-4 w-4" />
                Voltar para login
              </button>
            </div>
          )}
          </div>
        </div>
      </div>
    </div>
  );
}
