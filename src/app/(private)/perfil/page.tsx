"use client";

import React from "react";
import { useState, useRef } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Camera, Check, Mail, Phone, Shield, User } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { DotLoading } from "@/components/ui/dot-loading";
import { useUserProfile } from "@/hooks/useUserProfile ";

export function PerfilPage() {
  const { profile, loading, error, hasChanges, updateProfile, saveChanges } =
    useUserProfile();

  const [profileImage, setProfileImage] =
    useState<string>("/diverse-group.png");
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Perfil atualizado",
      description: "Seus dados foram atualizados com sucesso.",
      variant: "success",
    });
    saveChanges();
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsUploading(true);
      const imageUrl = URL.createObjectURL(file);

      setTimeout(() => {
        setProfileImage(imageUrl);
        setIsUploading(false);
        toast({
          title: "Foto atualizada",
          description: "Sua foto de perfil foi atualizada com sucesso.",
          variant: "success",
        });
      }, 1000);
    }
  };

  const formatBirthDate = (dateString: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("pt-BR");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <DotLoading />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex-1 flex items-center justify-center p-6">
        <div>Nenhum dado de perfil encontrado</div>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-6 p-6 md:p-8">
      <div className="flex items-center gap-2 mb-6">
        <h1 className="text-xl sm:text-2xl xl:text-3xl font-bold tracking-tight">
          Meu Perfil
        </h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>Informações Pessoais</CardTitle>
            <CardDescription>Gerencie seus dados pessoais</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center text-center">
            <div className="relative mb-6">
              <div
                className="relative cursor-pointer group"
                onClick={handleAvatarClick}
                aria-label="Clique para alterar sua foto de perfil"
              >
                <Avatar className="h-24 w-24">
                  <AvatarImage
                    src={profileImage || "/placeholder.svg"}
                    alt={profile.nome}
                  />
                  <AvatarFallback>{profile.nome.charAt(0)}</AvatarFallback>
                </Avatar>

                <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                  <Camera className="h-8 w-8 text-white" />
                </div>

                {isUploading && (
                  <div className="absolute inset-0 bg-black bg-opacity-70 rounded-full flex items-center justify-center">
                    <div className="w-8 h-8 border-4 border-t-emerald-500 border-emerald-200 rounded-full animate-spin"></div>
                  </div>
                )}
              </div>

              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*"
                onChange={handleImageChange}
              />

              <Button
                size="icon"
                variant="outline"
                className="absolute bottom-0 right-0 rounded-full h-8 w-8 bg-white"
                onClick={handleAvatarClick}
              >
                <Camera className="h-4 w-4" />
                <span className="sr-only">Alterar foto</span>
              </Button>
            </div>
            <h3 className="text-xl font-semibold">{profile.nome}</h3>
            {profile.email && (
              <div className="flex items-center gap-1 text-muted-foreground mt-1">
                <Mail className="h-4 w-4" />
                <span className="text-sm">{profile.email}</span>
              </div>
            )}
            <div className="flex items-center gap-1 text-muted-foreground mt-1">
              <Phone className="h-4 w-4" />
              <span className="text-sm">{profile.telemovel}</span>
            </div>

            <Separator className="my-6" />

            <div className="space-y-3 w-full">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-[#002256]" />
                  <span className="font-medium">
                    {profile.tipo_cliente === "particular"
                      ? "Plano Individual"
                      : "Plano Empresarial"}
                  </span>
                </div>
                <Button variant="link" size="sm" className="text-[#002256]">
                  Detalhes
                </Button>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <User className="h-5 w-5 text-[#002256]" />
                  <span className="font-medium">
                    Cliente desde {new Date(profile.criado_em).getFullYear()}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Editar Perfil</CardTitle>
            <CardDescription>
              Atualize suas informações pessoais
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="dados-pessoais" className="w-full">
              <TabsList className="grid grid-cols-3 mb-6">
                <TabsTrigger value="dados-pessoais">Dados Pessoais</TabsTrigger>
                <TabsTrigger value="documentos">Documentos</TabsTrigger>
                <TabsTrigger value="seguranca">Segurança</TabsTrigger>
              </TabsList>

              <TabsContent value="dados-pessoais">
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="nome">Nome Completo</Label>
                      <Input
                        id="nome"
                        value={profile.nome}
                        onChange={(e) =>
                          updateProfile({
                            ...profile,
                            nome: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={profile.email || ""}
                        onChange={(e) =>
                          updateProfile({
                            ...profile,
                            email: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="telefone">Telefone Fixo</Label>
                      <Input
                        id="telefone"
                        type="tel"
                        value={profile.telefone}
                        onChange={(e) =>
                          updateProfile({
                            ...profile,
                            telefone: Number(e.target.value),
                          })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="telemovel">Telemóvel</Label>
                      <Input
                        id="telemovel"
                        type="tel"
                        value={profile.telemovel}
                        onChange={(e) =>
                          updateProfile({
                            ...profile,
                            telemovel: Number(e.target.value),
                          })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="dataNascimento">Data de Nascimento</Label>
                      <Input
                        id="dataNascimento"
                        value={formatBirthDate(profile.data_nascimento)}
                        onChange={(e) =>
                          updateProfile({
                            ...profile,
                            data_nascimento: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="nif">NIF</Label>
                      <Input
                        id="nif"
                        value={profile.nif}
                        onChange={(e) =>
                          updateProfile({
                            ...profile,
                            nif: Number(e.target.value),
                          })
                        }
                        disabled
                      />
                    </div>
                  </div>

                  <div className="flex justify-end mt-6">
                    <Button
                      type="submit"
                      className="bg-[#002256] hover:bg-[#002256d1] cursor-pointer"
                      disabled={!hasChanges}
                    >
                      <Check className="mr-2 h-4 w-4" />
                      Salvar Alterações
                    </Button>
                  </div>
                </form>
              </TabsContent>

              <TabsContent value="documentos">
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="bi_cni">BI/CNI</Label>
                      <Input
                        id="bi_cni"
                        value={profile.bi_cni}
                        onChange={(e) =>
                          updateProfile({
                            ...profile,
                            bi_cni: Number(e.target.value),
                          })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="passaporte">Passaporte</Label>
                      <Input
                        id="passaporte"
                        value={profile.passaporte}
                        onChange={(e) =>
                          updateProfile({
                            ...profile,
                            passaporte: e.target.value,
                          })
                        }
                      />
                    </div>
                  </div>

                  <div className="flex justify-end mt-6">
                    <Button
                      type="submit"
                      className="bg-emerald-600 hover:bg-emerald-700"
                    >
                      <Check className="mr-2 h-4 w-4" />
                      Salvar Documentos
                    </Button>
                  </div>
                </form>
              </TabsContent>

              <TabsContent value="seguranca">
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="senha-atual">Senha Atual</Label>
                      <Input id="senha-atual" type="password" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="nova-senha">Nova Senha</Label>
                      <Input id="nova-senha" type="password" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirmar-senha">
                        Confirmar Nova Senha
                      </Label>
                      <Input id="confirmar-senha" type="password" />
                    </div>
                  </div>

                  <div className="flex justify-end mt-6">
                    <Button
                      type="submit"
                      className="bg-emerald-600 hover:bg-emerald-700"
                    >
                      <Check className="mr-2 h-4 w-4" />
                      Atualizar Senha
                    </Button>
                  </div>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
