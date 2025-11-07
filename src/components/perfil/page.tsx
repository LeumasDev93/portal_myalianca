"use client";

import React from "react";
import { useState, useRef, useEffect } from "react";
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
import {
  AlertCircle,
  Camera,
  Check,
  CheckCircle,
  Eye,
  EyeOff,
  Loader2,
  Mail,
  Phone,
  User,
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useAuth } from "@/contexts/auth-context";
import { LoadingContainer } from "@/components/ui/loading-container";
import { useProfileActivity } from "@/lib/activityExamples";

export interface UserProfile {
  id: string;
  nome: string;
  username: string;
  tipo: string; // Ex: 'cliente', 'admin', etc. (você pode usar um union type se os valores forem fixos)
  ativo: boolean;
  nif: string;
  email: string;
  telefone: string;
  morada: string | null;
  telemovel: string;
  display_name: string;
  cliente_id: string;
  cliente_nome: string;
  criado_em: string; // ou use `Date` se você estiver convertendo a string em objeto Date
  session_id: string | null;
}

export function PerfilPage() {
  const { profile, loading, hasChanges, updateProfile, saveChanges } =
    useUserProfile();
  const { registerProfilePhotoActivity } = useProfileActivity();
  const [profileImage, setProfileImage] =
    useState<string>("/diverse-group.png");
  const [isUploading, setIsUploading] = useState(false);
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);
  const [hasUnsavedImage, setHasUnsavedImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const { logout } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Debug: Log do perfil e URL da imagem
  useEffect(() => {
    if (profile) {

      if (profile.user?.imagem_id) {
        const imageUrl = `/api/proxy-image?url=${encodeURIComponent(
          `${process.env.NEXT_PUBLIC_API_BASE_URL_IMAGE}/${profile.user.imagem_id}`
        )}`;
        console.log("🔍 DEBUG - URL da imagem construída:", imageUrl);
        setProfileImage(imageUrl);
      }
    }
  }, [profile]);

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
    if (!file) return;

    // Validações do arquivo
    const maxSize = 2 * 1024 * 1024; // 2MB
    if (file.size > maxSize) {
      toast({
        title: "Arquivo muito grande",
        description: "A imagem deve ter no máximo 2MB.",
        variant: "destructive",
      });
      return;
    }

    // Verificar tipo de arquivo
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      toast({
        title: "Tipo de arquivo não suportado",
        description: "Use apenas imagens JPG, PNG ou WebP.",
        variant: "destructive",
      });
      return;
    }

    // Salvar o arquivo selecionado e mostrar preview
    setSelectedImageFile(file);
    setProfileImage(URL.createObjectURL(file));
    setHasUnsavedImage(true);

    toast({
      title: "Imagem selecionada",
      description: "Clique em 'Salvar' para confirmar a alteração.",
      variant: "default",
    });
  };

  // Função para salvar a imagem selecionada
  const handleSaveImage = async () => {
    if (!selectedImageFile) {
      toast({
        title: "Nenhuma imagem selecionada",
        description: "Selecione uma imagem primeiro.",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);

    try {
      console.log(
        "🔄 Iniciando upload da imagem de perfil:",
        selectedImageFile.name
      );

      // Primeiro, fazer upload do arquivo
      const formData = new FormData();
      formData.append("file", selectedImageFile);

      // Timeout de 30 segundos para uploads
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000);

      const uploadResponse = await fetch("/api/upload", {
        method: "POST",
        body: formData,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!uploadResponse.ok) {
        const errorText = await uploadResponse.text();
        console.error(
          "❌ Erro na API de upload:",
          uploadResponse.status,
          errorText
        );
        throw new Error(`Erro no upload: ${uploadResponse.status}`);
      }

      const uploadResult = await uploadResponse.json();
      console.log("✅ Upload concluído:", uploadResult);

      if (!uploadResult.id) {
        throw new Error("API não retornou ID da imagem");
      }


      const profileResponse = await fetch("/api/profile/update", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_id: profile?.user?.id,
          image_id: uploadResult.id,
        }),
      });

      if (!profileResponse.ok) {
        const errorText = await profileResponse.text();
        console.error(
          "❌ Erro na API de atualização do perfil:",
          profileResponse.status,
          errorText
        );
        throw new Error(
          `Erro na atualização do perfil: ${profileResponse.status}`
        );
      }

      const profileResult = await profileResponse.json();

      // Registrar atividade de alteração de foto
      try {
        await registerProfilePhotoActivity();
      } catch (error) {
        console.error(
          "Erro ao registrar atividade de alteração de foto:",
          error
        );
        // Não interrompe o fluxo se falhar ao registrar atividade
      }

      // Atualizar o estado local do perfil
      await updateProfileImage(uploadResult.id);

      // Limpar estados
      setSelectedImageFile(null);
      setHasUnsavedImage(false);

      toast({
        title: "Foto atualizada",
        description: "Sua foto de perfil foi atualizada com sucesso.",
        variant: "success",
      });

      // Recarregar a página para buscar as alterações da API
      window.location.reload();
    } catch (error) {
      console.error("❌ Erro durante upload:", error);

      if (error instanceof Error && error.name === "AbortError") {
        toast({
          title: "Timeout no upload",
          description: "O upload demorou muito. Tente novamente.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Erro no upload",
          description: "Não foi possível atualizar sua foto. Tente novamente.",
          variant: "destructive",
        });
      }

      // Reverter para a imagem anterior
      setProfileImage(
        `/api/proxy-image?url=${encodeURIComponent(
          `${process.env.NEXT_PUBLIC_API_BASE_URL_IMAGE}/${profile?.user?.imagem_id}`
        )}`
      );
    } finally {
      setIsUploading(false);
    }
  };

  // Função para cancelar a seleção de imagem
  const handleCancelImage = () => {
    setSelectedImageFile(null);
    setHasUnsavedImage(false);
    setProfileImage(
      `/api/proxy-image?url=${encodeURIComponent(
        `${process.env.NEXT_PUBLIC_API_BASE_URL_IMAGE}/${profile?.user?.imagem_id}`
      )}`
    );

    toast({
      title: "Alteração cancelada",
      description: "A imagem não foi alterada.",
      variant: "default",
    });
  };

  // Função para atualizar o ID da imagem no perfil do usuário
  const updateProfileImage = async (imageId: string) => {
    if (!profile?.user?.id) {
      throw new Error("ID do usuário não encontrado");
    }

    try {

      // Atualizar o estado local do perfil
      if (profile) {
        const updatedProfile = {
          ...profile,
          user: {
            ...profile.user,
            imagem_id: imageId,
          },
        };

        // Atualizar localStorage
        localStorage.setItem("user", JSON.stringify(updatedProfile));

        // Atualizar estado do componente
        updateProfile(updatedProfile);    
      }
    } catch (error) {
      console.error("❌ Erro ao atualizar perfil:", error);
      throw error;
    }
  };

  const handleSubmitPasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    const form = e.currentTarget as HTMLFormElement;
    const senhaAtual = (
      form.elements.namedItem("senha-atual") as HTMLInputElement
    ).value;
    const novaSenha = (
      form.elements.namedItem("nova-senha") as HTMLInputElement
    ).value;
    const confirmarSenha = (
      form.elements.namedItem("confirmar-senha") as HTMLInputElement
    ).value;

    // Validações básicas do cliente
    if (novaSenha !== confirmarSenha) {
      setError("As senhas não coincidem");
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          senha_atual: senhaAtual,
          nova_senha: novaSenha,
          user_id: profile?.user?.id,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.details?.info?.errors?.length > 0) {
          setError(data.details.info.errors.join(" / "));
        } else {
          setError(data.message || data.error || "Erro desconhecido");
        }
        return;
      }

      setSuccess("Senha alterada com sucesso!");
      toast({
        title: "Senha alterada com sucesso",
        description: "Faça login novamente",
        variant: "default",
      });
      setTimeout(() => {
        setSuccess("");
      }, 5000);
      form.reset();
      logout();
    } catch (error) {
      console.error("Erro ao alterar senha:", error);
      setError(error instanceof Error ? error.message : "Erro desconhecido");
      setTimeout(() => {
        setError("");
      }, 5000);
    } finally {
      setIsLoading(false);
    }
  };
  const formatBirthDate = (dateString: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("pt-BR");
  };

  if (loading) {
    return (
      <LoadingContainer fullHeight={true} message="CARREGANDO PERFIL..." />
    );
  }

  if (!profile) {
    return (
      <div className="flex-1 flex items-center justify-center p-6">
        <div>Nenhum dado de perfil encontrado</div>
      </div>
    );
  }

  // Construir URL da imagem usando a API de proxy
  const imageUrl = profile.user?.imagem_id
    ? `/api/proxy-image?url=${encodeURIComponent(
        `${process.env.NEXT_PUBLIC_API_BASE_URL_IMAGE}/${profile.user.imagem_id}`
      )}`
    : "/diverse-group.png";

  return (
    <div className="flex-1 space-y-6 p-6 md:p-8">
      <div className="flex items-center gap-2 mb-6">
        <h1 className="text-xl sm:text-2xl xl:text-3xl font-bold tracking-tight text-[#002855]">
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
                    key={profileImage}
                    src={
                      profileImage.startsWith("blob:") ? profileImage : imageUrl
                    }
                    alt={profile?.user?.nome}
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = "/diverse-group.png";
                    }}
                    onLoad={() => {
                      console.log("✅ Imagem carregada com sucesso:", imageUrl);
                    }}
                  />
                  <AvatarFallback>
                    {profile?.user?.nome.charAt(0)}
                  </AvatarFallback>
                </Avatar>

                {/* Overlay de hover */}
                <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                  <Camera className="h-8 w-8 text-white" />
                </div>

                {isUploading && (
                  <div className="absolute inset-0 bg-black bg-opacity-70 rounded-full flex items-center justify-center">
                    <div className="w-8 h-8 border-4 border-t-emerald-500 border-emerald-200 rounded-full animate-spin"></div>
                  </div>
                )}
              </div>

              {/* Input de arquivo */}
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/jpeg,image/jpg,image/png,image/webp"
                onChange={handleImageChange}
              />

              {/* Botão de câmera */}
              <Button
                size="icon"
                variant="outline"
                className="absolute bottom-0 right-0 rounded-full h-8 w-8 bg-white hover:bg-gray-50"
                onClick={handleAvatarClick}
                disabled={isUploading}
              >
                <Camera className="h-4 w-4" />
                <span className="sr-only">Alterar foto</span>
              </Button>
            </div>

            {/* Informações sobre upload */}
            <div className="text-xs text-muted-foreground mb-4">
              <p>Clique na foto para alterar</p>
            </div>

            {/* Botões de ação para imagem */}
            {hasUnsavedImage && (
              <div className="flex gap-2 mb-4">
                <Button
                  onClick={handleSaveImage}
                  disabled={isUploading}
                  className="bg-[#002256] hover:bg-[#002256d1] text-white"
                  size="sm"
                >
                  {isUploading ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  ) : (
                    <Check className="w-4 h-4 mr-2" />
                  )}
                  Salvar
                </Button>
                <Button
                  onClick={handleCancelImage}
                  disabled={isUploading}
                  variant="outline"
                  size="sm"
                >
                  <AlertCircle className="w-4 h-4 mr-2" />
                  Cancelar
                </Button>
              </div>
            )}

            <h3 className="text-xl font-semibold mt-4">{profile.user?.nome}</h3>
            {profile.user?.email && (
              <div className="flex items-center gap-1 text-muted-foreground mt-1">
                <Mail className="h-4 w-4" />
                <span className="text-sm">{profile.user?.email}</span>
              </div>
            )}
            <div className="flex items-center gap-1 text-muted-foreground mt-1">
              <Phone className="h-4 w-4" />
              <span className="text-sm">{profile.user?.telemovel}</span>
            </div>

            <Separator className="my-6" />

            <div className="space-y-3 w-full">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <User className="h-5 w-5 text-[#002256]" />
                  <span className="font-medium">
                    Cliente desde{" "}
                    {new Date(profile.user?.criado_em).getFullYear()}
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
                        value={profile.user?.nome}
                        onChange={(e) =>
                          updateProfile({
                            ...profile,
                            user: {
                              ...profile.user,
                              nome: e.target.value,
                            },
                          })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={profile.user?.email || ""}
                        onChange={(e) =>
                          updateProfile({
                            ...profile,
                            user: {
                              ...profile.user,
                              email: e.target.value,
                            },
                          })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="telefone">Telefone Fixo</Label>
                      <Input
                        id="telefone"
                        type="tel"
                        value={profile.user?.telefone}
                        onChange={(e) =>
                          updateProfile({
                            ...profile,
                            user: {
                              ...profile.user,
                              telemovel: e.target.value,
                            },
                          })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="telemovel">Telemóvel</Label>
                      <Input
                        id="telemovel"
                        type="tel"
                        value={profile.user?.telemovel}
                        onChange={(e) =>
                          updateProfile({
                            ...profile,
                            user: {
                              ...profile.user,
                              telemovel: e.target.value,
                            },
                          })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="dataNascimento">Data de Nascimento</Label>
                      <Input
                        id="dataNascimento"
                        value={formatBirthDate(profile.user?.criado_em)}
                        onChange={(e) =>
                          updateProfile({
                            ...profile,
                            user: {
                              ...profile.user,
                              criado_em: e.target.value,
                            },
                          })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="nif">NIF</Label>
                      <Input
                        id="nif"
                        value={profile.user?.nif}
                        onChange={(e) =>
                          updateProfile({
                            ...profile,
                            user: {
                              ...profile.user,
                              nif: e.target.value,
                            },
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
                        value={profile.user?.nif}
                        onChange={(e) =>
                          updateProfile({
                            ...profile,
                            user: {
                              ...profile.user,
                              nif: e.target.value,
                            },
                          })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="passaporte">Passaporte</Label>
                      <Input
                        id="passaporte"
                        value={profile.user?.nif}
                        onChange={(e) =>
                          updateProfile({
                            ...profile,
                            user: {
                              ...profile.user,
                              nif: e.target.value,
                            },
                          })
                        }
                      />
                    </div>
                  </div>

                  <div className="flex justify-end mt-6">
                    <Button
                      type="submit"
                      className="bg-[#002856] hover:bg-[#002856]/50"
                    >
                      <Check className="mr-2 h-4 w-4" />
                      Salvar Documentos
                    </Button>
                  </div>
                </form>
              </TabsContent>

              <TabsContent value="seguranca">
                <form
                  onSubmit={handleSubmitPasswordChange}
                  className="space-y-4"
                >
                  <div className="grid grid-cols-1 gap-4">
                    {/* Campo Senha Atual */}
                    <div className="space-y-2">
                      <Label htmlFor="senha-atual">Senha Atual</Label>
                      <div className="relative">
                        <Input
                          id="senha-atual"
                          type={showCurrentPassword ? "text" : "password"}
                          required
                        />
                        <button
                          type="button"
                          className="absolute right-2 top-2.5 text-gray-500 hover:text-gray-700"
                          onClick={() =>
                            setShowCurrentPassword(!showCurrentPassword)
                          }
                        >
                          {showCurrentPassword ? (
                            <EyeOff size={18} />
                          ) : (
                            <Eye size={18} />
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Campo Nova Senha */}
                    <div className="space-y-2">
                      <Label htmlFor="nova-senha">Nova Senha</Label>
                      <div className="relative">
                        <Input
                          id="nova-senha"
                          type={showNewPassword ? "text" : "password"}
                          required
                          minLength={8}
                          placeholder="Mínimo 8 caracteres com letra, número e símbolo"
                        />
                        <button
                          type="button"
                          className="absolute right-2 top-2.5 text-gray-500 hover:text-gray-700"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                        >
                          {showNewPassword ? (
                            <EyeOff size={18} />
                          ) : (
                            <Eye size={18} />
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Campo Confirmar Senha */}
                    <div className="space-y-2">
                      <Label htmlFor="confirmar-senha">
                        Confirmar Nova Senha
                      </Label>
                      <div className="relative">
                        <Input
                          id="confirmar-senha"
                          type={showConfirmPassword ? "text" : "password"}
                          required
                          minLength={8}
                          placeholder="Repita a nova senha"
                        />
                        <button
                          type="button"
                          className="absolute right-2 top-2.5 text-gray-500 hover:text-gray-700"
                          onClick={() =>
                            setShowConfirmPassword(!showConfirmPassword)
                          }
                        >
                          {showConfirmPassword ? (
                            <EyeOff size={18} />
                          ) : (
                            <Eye size={18} />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Mantenha as mensagens de feedback e o botão de submit como estão */}
                  {error && (
                    <div className="mb-4 animate-fade-in-down">
                      <div className="flex items-center justify-center w-full py-3 px-4 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm">
                        <AlertCircle className="h-5 w-5 mr-2" />
                        {error}
                      </div>
                    </div>
                  )}
                  {success && (
                    <div className="mb-4 animate-fade-in-down">
                      <div className="flex items-center justify-center w-full py-3 px-4 bg-green-50 border border-green-200 text-green-600 rounded-lg text-sm">
                        <CheckCircle className="h-5 w-5 mr-2" />
                        {success}
                      </div>
                    </div>
                  )}

                  <div className="flex justify-end mt-6">
                    <Button
                      type="submit"
                      className="bg-[#002856] hover:bg-[#002856]/50"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <Check className="mr-2 h-4 w-4" />
                      )}
                      {isLoading ? "Processando..." : "Atualizar Senha"}
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
