/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import type React from "react";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CheckCircle } from "lucide-react";
import { LoadingSpinner } from "@/components/ui/loading";

export default function CadastroPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    // Simulando um cadastro
    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));
      setSuccess(true);
    } catch (err) {
      setError("Ocorreu um erro ao criar sua conta. Tente novamente.");
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
            Enviamos um email de confirmação para o seu endereço. Por favor,
            verifique sua caixa de entrada.
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
      {/* Lado esquerdo - Imagem e recursos */}
      <div className="hidden w-1/2 flex-col bg-blue-600 p-10 text-white lg:flex">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Seguro Portal</h1>
          <p className="mt-2 text-blue-100">
            Sua plataforma completa de seguros
          </p>
        </div>

        <div className="relative mb-8 flex-1">
          <Image
            src="/insurance-signup.png"
            alt="Usuário cadastrando-se no portal de seguros"
            width={600}
            height={600}
            className="rounded-lg object-cover shadow-lg"
            priority
          />
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Vantagens de se cadastrar</h2>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-blue-200" />
              <span>Acesso a todas as suas apólices</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-blue-200" />
              <span>Notificações personalizadas</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-blue-200" />
              <span>Atendimento prioritário</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-blue-200" />
              <span>Descontos exclusivos</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-blue-200" />
              <span>Simulações personalizadas</span>
            </div>
          </div>
        </div>
      </div>

      {/* Lado direito - Formulário de cadastro */}
      <div className="flex w-full items-center justify-center bg-white p-8 lg:w-1/2">
        <div className="w-full max-w-md">
          <div className="mb-8 text-center lg:hidden">
            <h1 className="text-3xl font-bold text-gray-900">Seguro Portal</h1>
            <p className="mt-2 text-gray-600">
              Sua plataforma completa de seguros
            </p>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900">Crie sua conta</h2>
            <p className="mt-2 text-gray-600">
              Preencha os dados abaixo para começar
            </p>
          </div>

          {error && (
            <div className="mb-6 rounded-md bg-red-50 p-3 text-sm text-red-500">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div>
                <label
                  htmlFor="firstName"
                  className="mb-2 block text-sm font-medium text-gray-700"
                >
                  Nome
                </label>
                <Input
                  id="firstName"
                  type="text"
                  placeholder="João"
                  className="h-12"
                  required
                />
              </div>
              <div>
                <label
                  htmlFor="lastName"
                  className="mb-2 block text-sm font-medium text-gray-700"
                >
                  Sobrenome
                </label>
                <Input
                  id="lastName"
                  type="text"
                  placeholder="Silva"
                  className="h-12"
                  required
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="email"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                Email
              </label>
              <Input
                id="email"
                type="email"
                placeholder="seu@email.com"
                className="h-12"
                required
              />
            </div>

            <div>
              <label
                htmlFor="cpf"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                CPF
              </label>
              <Input
                id="cpf"
                type="text"
                placeholder="000.000.000-00"
                className="h-12"
                required
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                Senha
              </label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                className="h-12"
                required
              />
            </div>

            <div>
              <label
                htmlFor="confirmPassword"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                Confirmar Senha
              </label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="••••••••"
                className="h-12"
                required
              />
            </div>

            <Button
              type="submit"
              className="h-12 w-full text-base"
              disabled={isLoading}
            >
              {isLoading ? <LoadingSpinner /> : null}
              {isLoading ? "Processando..." : "Criar conta"}
            </Button>

            <div className="text-center text-sm text-gray-600">
              Já tem uma conta?{" "}
              <Link
                href="/login"
                className="font-medium text-blue-600 hover:underline"
              >
                Faça login
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
