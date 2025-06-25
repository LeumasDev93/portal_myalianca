/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import type React from "react";
import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CheckCircle } from "lucide-react";
import { LoadingSpinner } from "@/components/ui/loading";
import ImageBG from "@/assets/img_background.png";

export default function CadastroPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  function formatDateToDDMMYYYY(dateStr: string) {
    const [year, month, day] = dateStr.split("-");
    return `${day}-${month}-${year}`;
  }
  // Campos do formulário
  const [form, setForm] = useState({
    nome: "",
    data_nascimento: "",
    nif: "",
    email: "",
    telefone: "",
    telemovel: "",
    tipo_cliente: "particular",
    morada: "",
    bi_cni: "",
    passaporte: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setForm((prev) => ({ ...prev, [id]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const formToSend = {
        ...form,
        data_nascimento: form.data_nascimento
          ? formatDateToDDMMYYYY(form.data_nascimento)
          : "",
      };

      const response = await fetch("/api/auth/cadastro", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formToSend),
      });

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData.error || "Erro ao criar conta");
      }

      setSuccess(true);
    } catch (err: any) {
      setError(
        err.message || "Ocorreu um erro ao criar sua conta. Tente novamente."
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-100 p-4">
        <div className="w-full max-w-md rounded-lg bg-white p-8 text-center shadow-md">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          <h1 className="mb-2 text-2xl font-bold text-gray-900">
            Cadastro realizado com sucesso!
          </h1>
          <p className="mb-6 text-gray-600">
            Enviamos um email de confirmação para o seu endereço.
          </p>
          <Link href="/login">
            <Button className="w-full">Ir para o login</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen">
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
          <div className="mb-8 bg-white/10 p-6 rounded-lg backdrop-blur-sm">
            <h1 className="text-3xl font-bold">Seguro Portal</h1>
            <p className="mt-2 text-blue-100">
              Sua plataforma completa de seguros
            </p>
          </div>

          <div className="bg-white/10 p-6 rounded-lg backdrop-blur-sm">
            <h2 className="text-xl font-semibold">Vantagens de se cadastrar</h2>
            <ul className="mt-4 space-y-2 text-sm text-blue-200">
              <li>✔ Acesso a todas as suas apólices</li>
              <li>✔ Notificações personalizadas</li>
              <li>✔ Atendimento prioritário</li>
              <li>✔ Descontos exclusivos</li>
              <li>✔ Simulações personalizadas</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Formulário */}
      <div className="flex w-full items-center justify-center bg-white p-8 lg:w-1/2">
        <div className="w-full max-w-md">
          <div className="mb-8 text-center lg:hidden">
            <h1 className="text-3xl font-bold text-gray-900">Seguro Portal</h1>
            <p className="mt-2 text-gray-600">
              Sua plataforma completa de seguros
            </p>
          </div>

          <h2 className="mb-4 text-2xl font-bold text-gray-900">
            Crie sua conta
          </h2>

          {error && (
            <div className="mb-6 rounded-md bg-red-50 p-3 text-sm text-red-500">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              id="nome"
              placeholder="Nome completo"
              className="h-12"
              required
              onChange={handleChange}
            />
            <Input
              id="data_nascimento"
              type="date"
              className="h-12"
              required
              onChange={handleChange}
            />
            <Input
              id="nif"
              placeholder="NIF"
              className="h-12"
              required
              onChange={handleChange}
            />
            <Input
              id="email"
              type="email"
              placeholder="Email"
              className="h-12"
              required
              onChange={handleChange}
            />
            <Input
              id="telefone"
              placeholder="Telefone"
              className="h-12"
              onChange={handleChange}
            />
            <Input
              id="telemovel"
              placeholder="Telemóvel"
              className="h-12"
              required
              onChange={handleChange}
            />
            <Input
              id="morada"
              placeholder="Morada"
              className="h-12"
              required
              onChange={handleChange}
            />
            <Input
              id="bi_cni"
              placeholder="BI/CNI"
              className="h-12"
              required
              onChange={handleChange}
            />
            <Input
              id="passaporte"
              placeholder="Passaporte"
              className="h-12"
              onChange={handleChange}
            />

            <Button
              type="submit"
              className="h-12 w-full text-base"
              disabled={isLoading}
            >
              {isLoading && <LoadingSpinner />}
              {isLoading ? "Processando..." : "Criar conta"}
            </Button>

            <p className="text-center text-sm text-gray-600">
              Já tem uma conta?{" "}
              <Link
                href="/login"
                className="font-medium text-blue-600 hover:underline"
              >
                Faça login
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
