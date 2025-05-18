/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { getSession, signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

import Banner from "@/assets/img_background.png";
import Logo from "@/assets/alianca.png";
import Input from "@/components/Input";
import Link from "next/link";

interface FormData {
  email: string;
  password: string;
}

export default function Home() {
  const [showPassword, setShowPassword] = useState(false);
  const [messageError, setMessageError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [codeSent, setCodeSent] = useState(false);

  const router = useRouter();
  const { register, handleSubmit } = useForm<FormData>();

  useEffect(() => {
    const checkSession = async () => {
      const session = await getSession();
      if (session?.user) {
        router.replace("/backoffice");
      }
    };

    checkSession();
  }, [router]);

  useEffect(() => {
    if (countdown > 0) {
      const interval = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [countdown]);

  const handleSignIn = async (data: FormData) => {
    setIsLoading(true);
    setMessageError("");

    const res = await signIn("credentials", {
      redirect: false,
      email: data.email,
      password: data.password,
    });

    setIsLoading(false);

    const session = await getSession();
    console.log("accessToken:", session?.user.accessToken);

    if (res?.error) {
      setMessageError("Email ou palavra-passe inválidos.");
    } else {
      setCodeSent(true);
      setCountdown(60);
      console.log("Código enviado com sucesso");
    }
  };

  return (
    <div className="flex flex-col md:flex-row items-center justify-center h-screen bg-[#f0f0f0]">
      <div className="hidden md:flex relative w-full md:w-[60%] h-screen">
        <Image
          src={Banner}
          alt="Banner"
          fill
          className="object-cover"
          priority
          style={{ objectFit: "cover" }}
        />
      </div>

      <div className="flex flex-col items-center justify-center w-full md:w-[40%] p-6 md:p-8  bg-white h-full">
        <Header />
        <hr className="hidden md:flex w-[80%] border-t-4 border-[#002256] mb-6 mt-4" />
        <h2 className="text-md text-gray-600 w-[80%] text-left mb-6">
          Insira o e-mail para qual deseja receber o código de recuperação da
          sua palavra-passe
        </h2>
        <LoginForm
          handleSubmit={handleSubmit}
          onSubmit={handleSignIn}
          register={register}
          showPassword={showPassword}
          setShowPassword={setShowPassword}
          messageError={messageError}
          isLoading={isLoading}
          countdown={countdown}
          codeSent={codeSent}
        />
      </div>
    </div>
  );
}

const Header = () => (
  <div className="flex flex-col items-center space-y-4">
    <Image src={Logo} alt="Logo" width={100} height={100} />
    <div className="flex space-x-2 mb-6">
      <h1 className="text-3xl font-extrabold text-[#B7021C]">My</h1>
      <h1 className="text-3xl font-extrabold text-[#002256]">Aliança</h1>
    </div>
    <h2 className="text-lg text-gray-500">Recuperar Palavra-passe</h2>
  </div>
);

interface LoginFormProps {
  handleSubmit: any;
  onSubmit: (data: FormData) => void;
  register: any;
  showPassword: boolean;
  setShowPassword: (value: boolean) => void;
  messageError: string;
  isLoading: boolean;
  countdown: number;
  codeSent: boolean;
}

const LoginForm = ({
  handleSubmit,
  onSubmit,
  register,
  messageError,
  isLoading,
  countdown,
  codeSent,
}: LoginFormProps) => (
  <form
    onSubmit={handleSubmit(onSubmit)}
    className="flex flex-col items-center w-full text-gray-900"
  >
    <div className="flex flex-col items-center w-full space-y-4">
      <div className="w-full px-4 md:px-0 md:w-[80%]">
        <Input
          {...register("email")}
          id="email"
          name="email"
          type="email"
          placeholder="E-mail"
          borderColor={messageError ? "border-red-500" : "border-[#224276]"}
          className="bg-white rounded-lg"
        />
      </div>
    </div>

    {messageError && (
      <div className="w-[80%] mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
        {messageError}
      </div>
    )}

    <button
      type="submit"
      disabled={isLoading || countdown > 0}
      className={`w-[90%] md:w-[80%] mt-6 py-3 bg-[#002256] text-white rounded-lg font-medium hover:bg-[#B7021C] transition-colors ${
        isLoading || countdown > 0 ? "opacity-70 cursor-not-allowed" : ""
      }`}
    >
      {isLoading
        ? "Carregando..."
        : codeSent && countdown > 0
        ? "Aguarde..."
        : codeSent
        ? "Enviar novamente código de recuperação"
        : "Enviar código de recuperação"}
    </button>

    {codeSent && (
      <span className="mt-2 text-sm text-gray-600 text-left w-[80%]">
        {countdown > 0
          ? `Não recebeu o código? ${countdown} segundos`
          : "Você pode reenviar o código agora"}
      </span>
    )}

    <Link
      href="/NewPassword"
      className="flex items-center justify-center w-[90%] md:w-[80%] mt-6 py-3 text-[#002256] border-2 border-[#002256] rounded-lg font-medium hover:bg-[#002256] hover:text-white transition-colors"
    >
      Nova Palavra-passe
    </Link>
  </form>
);
