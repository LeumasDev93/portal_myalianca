/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useState, FormEvent, useEffect } from "react";
import { useAuth } from "@/contexts/auth-context";
import Logo from "@/assets/alianca.png";
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

      // Tratamento de erro
      if (data.error) {
        const errorMessage = data.details?.response?.desc || data.error;
        setErro(errorMessage);
        setTimeout(() => {
          setErro("");
        }, 5000);
        return;
      }

      // Tratamento de sucesso
      if (data.message === "SUCCESS") {
        setSuccessMessage(data.details || "Código OTP enviado com sucesso.");
        console.log(data.details, "chedou");
        setTimeout(() => {
          setStep("otp");
          setSuccessMessage("");
        }, 2000);
        return;
      }

      // Formato não reconhecido
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

      if (data.error) {
        const errorMessage = data.details?.response?.desc || data.error;
        setErro(errorMessage);
        setTimeout(() => {
          setErro("");
        }, 5000);
        return;
      }

      if (data.message === "SUCCESS") {
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

      console.log(res);
      const data = await res.json();

      // ✅ Se a resposta NÃO for 200–299
      if (!res.ok) {
        // Se existir o array de erros dentro de info, mostre só a mensagem do array
        if (data.details?.info?.errors?.length > 0) {
          setErro(data.details.info.errors.join(" / "));
        } else {
          // Outras mensagens
          setErro(data.message || data.error || "Erro desconhecido");
        }
        setTimeout(() => setErro(""), 5000);
        return;
      }

      // ✅ Sucesso
      if (data.message === "SUCCESS") {
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
    <div className="flex h-screen flex-col md:flex-row bg-gray-50">
      {/* Banner Side */}
      <div className="hidden md:flex md:w-1/2 relative bg-gradient-to-br from-blue-800 to-blue-600">
        <div className="absolute h-full inset-0 opacity-90">
          <Image
            src={ImageCapa}
            alt="Insurance portal"
            fill
            className="object-cover"
            priority
          />
        </div>

        <div className="relative z-10 flex flex-col items-end justify-between w-full h-full p-8 text-white">
          <div className="bg-white/10 p-4 rounded-lg backdrop-blur-sm">
            <h1 className="text-4xl font-bold">MYALIANÇA</h1>
            <p className="text-xl mt-2">Descomplicar É Ter MyAliança</p>
          </div>

          <div className="bg-white/90 p-6 rounded-lg backdrop-blur-sm text-blue-900">
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
      <div className="flex-1 flex flex-col items-center justify-center p-4">
        <Image src={Logo} alt="Logo" width={100} height={100} />
        <div className="w-full sm:max-w-sm xl:max-w-md  transition-all duration-300 mt-10">
          {/* Cabeçalho com animação sutil */}
          <div className="mb-8 text-center transform transition-transform duration-300 hover:scale-[1.01]">
            <h1 className="text-lg xl:text-xl font-bold text-gray-900 mb-2 bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text">
              {isLoginForm
                ? "FAÇA LOGIN NA SUA ÁREA DE CLIENTE"
                : step === "email"
                ? "RECUPERAR SENHA"
                : step === "otp"
                ? "VALIDAR CÓDIGO"
                : "REDEFINIR SENHA"}
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
                  onClick={() => {
                    setIsLoginForm(false);
                    setStep("email");
                  }}
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
                    type={showNewPassword ? "text" : "password"}
                    placeholder=" "
                    value={new_password}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    className="block w-full px-4 py-3 text-sm bg-white border border-gray-200 rounded-lg transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent peer"
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
                className={`w-full py-3 px-4 inline-flex justify-center items-center gap-2 rounded-lg font-medium text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 ${
                  isloading
                    ? "bg-blue-400 cursor-not-allowed"
                    : "bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-md hover:shadow-lg"
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
