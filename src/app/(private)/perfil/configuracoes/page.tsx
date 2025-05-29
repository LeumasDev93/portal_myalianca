"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft, Bell, Check, Globe, Lock, Shield } from "lucide-react"
import Link from "next/link"
import { useToast } from "@/components/ui/use-toast"

export default function ConfiguracoesPage() {
  // Estados para as configurações
  const [notificacoesEmail, setNotificacoesEmail] = useState(true)
  const [notificacoesSMS, setNotificacoesSMS] = useState(false)
  const [notificacoesApp, setNotificacoesApp] = useState(true)
  const [modoEscuro, setModoEscuro] = useState(false)
  const [autenticacaoDoisFatores, setAutenticacaoDoisFatores] = useState(false)
  const [idiomaPortugues, setIdiomaPortugues] = useState(true)

  const { toast } = useToast()

  const handleSaveSettings = () => {
    // Simulando salvamento de configurações
    toast({
      title: "Configurações salvas",
      description: "Suas preferências foram atualizadas com sucesso.",
      variant: "success",
    })
  }

  return (
    <div className="flex-1 space-y-6 p-6 md:p-8">
      <div className="flex items-center gap-2 mb-6">
        <Button variant="outline" size="icon" asChild>
          <Link href="/perfil">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Configurações</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Notificações */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-blue-500" />
              Notificações
            </CardTitle>
            <CardDescription>Gerencie como você recebe notificações</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="notifications-email">Notificações por Email</Label>
                <p className="text-sm text-muted-foreground">Receba atualizações importantes por email</p>
              </div>
              <Switch id="notifications-email" checked={notificacoesEmail} onCheckedChange={setNotificacoesEmail} />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="notifications-sms">Notificações por SMS</Label>
                <p className="text-sm text-muted-foreground">Receba alertas urgentes por mensagem de texto</p>
              </div>
              <Switch id="notifications-sms" checked={notificacoesSMS} onCheckedChange={setNotificacoesSMS} />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="notifications-app">Notificações no Aplicativo</Label>
                <p className="text-sm text-muted-foreground">Receba notificações enquanto usa o portal</p>
              </div>
              <Switch id="notifications-app" checked={notificacoesApp} onCheckedChange={setNotificacoesApp} />
            </div>
          </CardContent>
        </Card>

        {/* Aparência e Idioma */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5 text-blue-500" />
              Aparência e Idioma
            </CardTitle>
            <CardDescription>Personalize sua experiência</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="dark-mode">Modo Escuro</Label>
                <p className="text-sm text-muted-foreground">Ative o tema escuro para reduzir o cansaço visual</p>
              </div>
              <Switch id="dark-mode" checked={modoEscuro} onCheckedChange={setModoEscuro} />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="language-pt">Idioma Português</Label>
                <p className="text-sm text-muted-foreground">Usar português como idioma principal</p>
              </div>
              <Switch id="language-pt" checked={idiomaPortugues} onCheckedChange={setIdiomaPortugues} />
            </div>
          </CardContent>
        </Card>

        {/* Segurança */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-blue-500" />
              Segurança
            </CardTitle>
            <CardDescription>Proteja sua conta</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="two-factor">Autenticação de Dois Fatores</Label>
                <p className="text-sm text-muted-foreground">Adicione uma camada extra de segurança à sua conta</p>
              </div>
              <Switch id="two-factor" checked={autenticacaoDoisFatores} onCheckedChange={setAutenticacaoDoisFatores} />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="password-change">Alterar Senha</Label>
                <p className="text-sm text-muted-foreground">Atualize sua senha regularmente para maior segurança</p>
              </div>
              <Button variant="outline" size="sm" asChild>
                <Link href="/perfil">
                  <Lock className="mr-2 h-4 w-4" />
                  Alterar Senha
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-end mt-6">
        <Button onClick={handleSaveSettings} className="bg-blue-600 hover:bg-blue-700">
          <Check className="mr-2 h-4 w-4" />
          Salvar Configurações
        </Button>
      </div>
    </div>
  )
}
