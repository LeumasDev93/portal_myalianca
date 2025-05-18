/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { getSession, signIn } from "next-auth/react";
import { FaRegEye, FaRegEyeSlash } from "react-icons/fa";
import { useRouter } from "next/navigation";

import Banner from "@/assets/img_background.png";
import Logo from "@/assets/alianca.png";
import Input from "@/components/Input";

interface FormData {
  password: string;
  confirmPassword: string;
}

export default function Home() {
  const [showPasswordNew, setShowPasswordNew] = useState(false);
  const [showPasswordRept, setShowPasswordRept] = useState(false);
  const [messageError, setMessageError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const router = useRouter();

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<FormData>();

  useEffect(() => {
    const checkSession = async () => {
      const session = await getSession();
      if (session?.user) {
        router.replace("/backoffice");
      }
    };

    checkSession();
  }, [router]);

  const handleSignIn = async (data: FormData) => {
    if (data.password !== data.confirmPassword) {
      setError("confirmPassword", {
        type: "manual",
        message: "As palavras-passe não coincidem.",
      });
      return;
    }

    setIsLoading(true);
    setMessageError("");

    const res = await signIn("credentials", {
      redirect: false,
      email: "", // ajuste se estiver usando o campo de email
      password: data.password,
    });

    setIsLoading(false);

    const session = await getSession();
    console.log("accessToken:", session?.user.accessToken);

    if (res?.error) {
      setMessageError("Email ou palavra-passe inválidos.");
    } else {
      router.replace("/backoffice");
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
        />
      </div>

      <div className="flex flex-col items-center justify-center w-full md:w-[40%] p-6 md:p-8 bg-white h-full">
        <Header />
        <hr className="hidden md:flex w-[80%] border-t-4 border-[#002256] mt-4 mb-8" />
        <LoginForm
          handleSubmit={handleSubmit}
          onSubmit={handleSignIn}
          register={register}
          errors={errors}
          setShowPasswordNew={setShowPasswordNew}
          showPasswordNew={showPasswordNew}
          setShowPasswordRept={setShowPasswordRept}
          showPasswordRept={showPasswordRept}
          messageError={messageError}
          isLoading={isLoading}
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
    <h2 className="text-lg text-gray-600">Nova Palavra-passe</h2>
  </div>
);

interface LoginFormProps {
  handleSubmit: any;
  onSubmit: (data: FormData) => void;
  register: any;
  errors: any;
  showPasswordNew: boolean;
  showPasswordRept: boolean;
  setShowPasswordNew: (value: boolean) => void;
  setShowPasswordRept: (value: boolean) => void;
  messageError: string;
  isLoading: boolean;
}

const LoginForm = ({
  handleSubmit,
  onSubmit,
  register,
  errors,
  showPasswordNew,
  setShowPasswordNew,
  showPasswordRept,
  setShowPasswordRept,
  messageError,
  isLoading,
}: LoginFormProps) => (
  <form
    onSubmit={handleSubmit(onSubmit)}
    className="flex flex-col items-center w-full text-gray-900"
  >
    <div className="flex flex-col items-center w-full space-y-6">
      <div className="w-full px-4 md:px-0 md:w-[80%]">
        <Input
          {...register("password", { required: "Palavra-passe obrigatória" })}
          id="password"
          type={showPasswordNew ? "text" : "password"}
          placeholder="Palavra-passe nova"
          borderColor={
            errors.password || messageError
              ? "border-red-500"
              : "border-[#224276]"
          }
          className="bg-white rounded-lg"
          eyeIcon={
            <button
              type="button"
              onClick={() => setShowPasswordNew(!showPasswordNew)}
              className="focus:outline-none"
            >
              {showPasswordNew ? (
                <FaRegEyeSlash className="h-5 w-5 text-[#224276]" />
              ) : (
                <FaRegEye className="h-5 w-5 text-[#224276]" />
              )}
            </button>
          }
        />
        {errors.password && (
          <p className="text-sm text-red-600 mt-1">{errors.password.message}</p>
        )}
      </div>

      <div className="w-full px-4 md:px-0 md:w-[80%]">
        <Input
          {...register("confirmPassword", {
            required: "Confirmação obrigatória",
          })}
          id="confirmPassword"
          type={showPasswordRept ? "text" : "password"}
          placeholder="Repetir palavra-passe nova"
          borderColor={
            errors.confirmPassword || messageError
              ? "border-red-500"
              : "border-[#224276]"
          }
          className="bg-white rounded-lg"
          eyeIcon={
            <button
              type="button"
              onClick={() => setShowPasswordRept(!showPasswordRept)}
              className="focus:outline-none"
            >
              {showPasswordRept ? (
                <FaRegEyeSlash className="h-5 w-5 text-[#224276]" />
              ) : (
                <FaRegEye className="h-5 w-5 text-[#224276]" />
              )}
            </button>
          }
        />
        {errors.confirmPassword && (
          <p className="text-sm text-red-600 mt-1">
            {errors.confirmPassword.message}
          </p>
        )}
      </div>
    </div>

    {messageError && (
      <div className="w-[80%] mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
        {messageError}
      </div>
    )}

    <button
      type="submit"
      disabled={isLoading}
      className={`w-[90%] md:w-[80%] mt-8 py-3 bg-[#002256] text-white rounded-lg font-medium hover:bg-[#B7021C] transition-colors ${
        isLoading ? "opacity-70 cursor-not-allowed" : ""
      }`}
    >
      {isLoading ? "Aguarde..." : "Salvar"}
    </button>
  </form>
);
