"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { LoadingSpinner } from "@/components/loading-spinner"
import { CheckCircle, ArrowLeft } from "lucide-react"

export default function RecuperarSenhaPage() {
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    // Simulando o envio de email
    try {
      await new Promise((resolve) => setTimeout(resolve, 1500))
      setSuccess(true)
    } catch (err) {
      setError("Ocorreu um erro ao enviar o email. Tente novamente.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen">
      {/* Lado esquerdo - Imagem e recursos */}
      <div className="hidden w-1/2 flex-col bg-blue-600 p-10 text-white lg:flex">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Seguro Portal</h1>
          <p className="mt-2 text-blue-100">Sua plataforma completa de seguros</p>
        </div>

        <div className="relative mb-8 flex-1">
          <Image
            src="/password-recovery-insurance.png"
            alt="Usuário recuperando senha no portal de seguros"
            width={600}
            height={600}
            className="rounded-lg object-cover shadow-lg"
            priority
          />
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Recupere seu acesso rapidamente</h2>
          <p className="text-blue-100">
            Enviaremos um link para o seu email para que você possa redefinir sua senha com segurança e voltar a acessar
            todos os recursos do portal.
          </p>
        </div>
      </div>

      {/* Lado direito - Formulário de recuperação de senha */}
      <div className="flex w-full items-center justify-center bg-white p-8 lg:w-1/2">
        <div className="w-full max-w-md">
          <div className="mb-8 text-center lg:hidden">
            <h1 className="text-3xl font-bold text-gray-900">Seguro Portal</h1>
            <p className="mt-2 text-gray-600">Sua plataforma completa de seguros</p>
          </div>

          <Link href="/login" className="mb-8 inline-flex items-center text-sm text-blue-600 hover:underline">
            <ArrowLeft className="mr-1 h-4 w-4" />
            Voltar para o login
          </Link>

          {success ? (
            <div className="rounded-lg bg-white p-6 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <h2 className="mb-2 text-2xl font-bold text-gray-900">Email enviado!</h2>
              <p className="mb-6 text-gray-600">
                Enviamos um link de recuperação para {email}. Por favor, verifique sua caixa de entrada e siga as
                instruções.
              </p>
              <Link href="/login">
                <Button className="w-full">Voltar para o login</Button>
              </Link>
            </div>
          ) : (
            <>
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900">Esqueceu sua senha?</h2>
                <p className="mt-2 text-gray-600">
                  Não se preocupe. Informe seu email e enviaremos um link para redefinir sua senha.
                </p>
              </div>

              {error && <div className="mb-6 rounded-md bg-red-50 p-3 text-sm text-red-500">{error}</div>}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="email" className="mb-2 block text-sm font-medium text-gray-700">
                    Email
                  </label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="seu@email.com"
                    className="h-12"
                    required
                  />
                </div>

                <Button type="submit" className="h-12 w-full text-base" disabled={isLoading}>
                  {isLoading ? <LoadingSpinner className="mr-2" /> : null}
                  {isLoading ? "Enviando..." : "Enviar link de recuperação"}
                </Button>

                <div className="text-center text-sm text-gray-600">
                  Lembrou sua senha?{" "}
                  <Link href="/login" className="font-medium text-blue-600 hover:underline">
                    Voltar para o login
                  </Link>
                </div>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
