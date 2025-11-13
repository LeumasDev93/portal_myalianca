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
import { ForcePasswordChangeModal } from "@/components/auth/ForcePasswordChangeModal";

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
  
  // Estados para mudança obrigatória de senha
  const [showForcePasswordChange, setShowForcePasswordChange] = useState(false);
  const [userIdForPasswordChange, setUserIdForPasswordChange] = useState("");
  const [savedUsername, setSavedUsername] = useState("");
  const [isloading, setIsLoading] = useState(false);
  const [erro, setErro] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [step, setStep] = useState<"email" | "otp" | "password">("email");
  const [otp, setOtp] = useState("");
  const [new_password, setNewPassword] = useState("");
  const [imageError, setImageError] = useState(false);

  // Usar proxy para carregar a imagem com API Key
  const ImageCapa = `/api/proxy-image?url=${encodeURIComponent('https://api.aliancaseguros.cv/files/1.0.0/login-file')}`;
  
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    clearError();

    try {
      if (!username || !password) {
        throw new Error("Por favor, preencha todos os campos");
      }

      // Chamar API de login primeiro para verificar needPasswordChange
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      // Verificar se precisa trocar senha
      if (data.needPasswordChange) {
        setSavedUsername(username);
        setUserIdForPasswordChange(data.userId);
        setShowForcePasswordChange(true);
        return;
      }

      // Se não precisa trocar senha, continuar com login normal
      await login(username, password);
    } catch (err) {
      // console.error("Erro no login:", err);
    }
  };

  const handlePasswordChangeSuccess = async (newPassword: string) => {
    setShowForcePasswordChange(false);
    // Após trocar senha, fazer login automaticamente com a NOVA senha
    try {
      await login(savedUsername, newPassword);
    } catch (err) {
      console.error("Erro ao fazer login após troca de senha:", err);
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

  // Tentar carregar a imagem através do proxy ao montar o componente
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const img = document.createElement('img');
    img.onload = () => {
      console.log('✅ Imagem carregada com sucesso via proxy');
      setImageError(false);
    };
    img.onerror = () => {
      console.warn('⚠️ Erro ao carregar imagem via proxy, usando gradiente como fallback');
      setImageError(true);
    };
    img.src = ImageCapa;
    
    return () => {
      img.onload = null;
      img.onerror = null;
    };
  }, [ImageCapa]);

  // console.log(useAuth());
  return (
    <div className="h-screen w-full flex flex-col lg:flex-row overflow-hidden">
      {/* Lado Esquerdo - Imagem e Banner (65%) - Mobile ocupa topo */}
      <div className="relative lg:w-[66%] h-1/3 lg:h-full flex flex-col">
        {/* Background: Gradiente sempre presente como base */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900 to-red-800"></div>
        
        {/* Background Image da API por cima do gradiente (se carregar) */}
        {!imageError && (
          <>
            <div className="absolute inset-0 w-full h-full">
              <Image
                src={ImageCapa}
                alt="Background"
                fill
                priority
                quality={100}
                className="object-cover object-center"
                style={{
                  imageRendering: 'auto',
                  WebkitBackfaceVisibility: 'hidden',
                  backfaceVisibility: 'hidden',
                  transform: 'translateZ(0)',
                  willChange: 'transform',
                } as React.CSSProperties}
                sizes="(max-width: 1024px) 100vw, 65vw"
                unoptimized
              />
            </div>
            {/* Overlay Escuro sobre a imagem */}
            <div className="absolute inset-0 bg-black/40"></div>
          </>
        )}
        
        {/* Logo no topo */}
        <div className="relative z-10 p-6 lg:p-8 xl:p-10">
          <Image src={Logo} alt="Logo" width={200} height={80} className="w-32 md:w-40 lg:w-44 xl:w-48 h-auto" />
        </div>
        
        {/* Banner Semi-Transparente */}
        <div className="hidden lg:block absolute top-1/2 left-0 right-0 -translate-y-1/2 z-10">
          <div className="bg-white/10 backdrop-blur-md py-8 lg:py-10 xl:py-12 px-8 lg:px-12 xl:px-16">
            <div className="text-white space-y-4 lg:space-y-6 xl:space-y-8">
              <div className="text-left">
                <h1 className="text-3xl lg:text-4xl xl:text-4xl 2xl:text-6xl font-bold mb-2 lg:mb-3 xl:mb-4">MYALIANÇA</h1>
                <p className="text-base lg:text-lg 2xl:text-2xl">Descomplicar é ter <span className="font-bold">MyAliança</span></p>
              </div>
              
              {/* Serviços */}
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-3 lg:gap-4 pt-4 lg:pt-6 border-t border-white/20">
                {[
                  "Gerenciamento de apólices",
                  "Acompanhamento de sinistros",
                  "Pagamentos online",
                  "Atendimento personalizado",
                ].map((benefit) => (
                  <div key={benefit} className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 lg:h-5 w-4 lg:w-5 text-white flex-shrink-0" />
                    <span className="text-sm lg:text-base 2xl:text-lg">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
        
        {/* Conteúdo Mobile centralizado */}
        <div className="lg:hidden relative z-10 flex-1 flex items-center justify-center px-6">
          <div className="text-white space-y-3 text-center">
            <h1 className="text-2xl 2xl:text-3xl font-bold mb-2">MYALIANÇA</h1>
            <p className="text-sm 2xl:text-base">Descomplicar é ter <span className="font-bold">MyAliança</span></p>
          </div>
        </div>
      </div>

      {/* Lado Direito - Formulário (35%) - Mobile ocupa bottom */}
      <div className="lg:w-[47%] h-2/3 lg:h-full bg-white lg:bg-gray-100 flex items-center justify-center p-0 lg:p-6 xl:p-8 overflow-y-auto">
        <div className="w-full max-w-md bg-white rounded-t-3xl lg:rounded-2xl shadow-2xl p-6 lg:p-8">
          {/* Barra de indicação - Apenas Mobile */}
          <div className="lg:hidden w-12 h-1.5 bg-gray-400 rounded-full mx-auto mb-4"></div>
          
          {/* Logo acima do formulário */}
          <div className="flex justify-center mb-4 lg:mb-6">
            <Image src={LogoForm} alt="Aliança Seguros" width={80} height={80} className="w-16 lg:w-20 h-16 lg:h-16" />
          </div>

          {/* Cabeçalho com animação sutil */}
          <div className="mb-3 md:mb-5 lg:mb-6 xl:mb-8 2xl:mb-10 w-full  text-center transform transition-transform duration-300 hover:scale-[1.01]">
            <h1 className="text-sm md:text-sm 2xl:text-base font-bold text-gray-900 mb-2 bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text w-full leading-tight">
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

      {/* Modal de Mudança de Senha Obrigatória */}
      <ForcePasswordChangeModal
        isOpen={showForcePasswordChange}
        userId={userIdForPasswordChange}
        onSuccess={handlePasswordChangeSuccess}
      />
    </div>
  );
}
