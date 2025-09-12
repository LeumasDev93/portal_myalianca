/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useEffect, useState } from "react";
import { PageTitle } from "@/components/ui/page-title";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import Link from "next/link";
import {
  Eye,
  Trash2,
  Star,
  Plus,
  AlertTriangle,
  Send,
  Mail,
  MailOpen,
  MoreVertical,
  List,
  Grid3X3,
} from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { LoadingContainer } from "@/components/ui/loading-container";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { useUnreadCount } from "@/hooks/useUnreadCount";
import { useUserProfile } from "@/hooks/useUserProfile ";
import { useUnreadMessages } from "@/contexts/unread-messages-context";
import { sendMessage } from "@/service/sendMessage";
import { useMessageActivity } from "@/lib/activityExamples";

type MensagemPageProps = {
  onSelectDetail: (id: string) => void;
  onUnreadCountChange?: (count: number) => void;
};

export default function MensagensPage({
  onSelectDetail,
  onUnreadCountChange,
}: MensagemPageProps) {
  const { profile } = useUserProfile();
  const { registerMessageSentActivity } = useMessageActivity();
  const {
    unreadCount: globalUnreadCount,
    refreshUnreadCount,
    markMessageAsRead,
    markMessageAsUnread,
    isMessageRead,
  } = useUnreadMessages();

  const {
    unreadCount,
    messages,
    loading,
    error,
    markAsRead,
    markAsUnread,
    toggleStar,
    setMessages,
  } = useUnreadCount(profile?.user.id);

  // Estados locais para dialogs e composição da mensagem
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [composeDialogOpen, setComposeDialogOpen] = useState(false);
  const [messageToDelete, setMessageToDelete] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState({
    to: "",
    subject: "",
    message: "",
  });
  const [sending, setSending] = useState(false);
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");

  // Função para truncar título em mobile
  const truncateTitle = (
    title: string | undefined,
    isMobile: boolean = false
  ) => {
    if (!title) return "";
    if (!isMobile) return title;

    const words = title.split(" ");
    if (words.length <= 3) return title;

    return words.slice(0, 3).join(" ") + "...";
  };

  useEffect(() => {
    if (onUnreadCountChange) {
      onUnreadCountChange(globalUnreadCount);
    }
  }, [globalUnreadCount, onUnreadCountChange]);

  // Função para abrir confirmação de exclusão
  const openDeleteDialog = (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setMessageToDelete(id);
    setDeleteDialogOpen(true);
  };

  // Confirma exclusão da mensagem localmente
  const confirmDeleteMessage = () => {
    if (messageToDelete) {
      const messageToDeleteObj = messages.find(
        (msg) => msg.id === messageToDelete
      );
      setMessages((prev) => prev.filter((msg) => msg.id !== messageToDelete));

      // Se a mensagem excluída não estava lida, decrementar o contador
      if (messageToDeleteObj && !isMessageRead(messageToDelete)) {
        markMessageAsRead(messageToDelete); // Marcar como lida para remover do contador
      }

      toast({
        title: "Mensagem excluída",
        description: "A mensagem foi excluída com sucesso.",
      });
      setDeleteDialogOpen(false);
    }
  };

  // Funções para composição de mensagem
  const openComposeDialog = () => setComposeDialogOpen(true);
  const closeComposeDialog = () => {
    if (!sending) {
      setComposeDialogOpen(false);
      setNewMessage({ to: "", subject: "", message: "" });
    }
  };

  const handleComposeInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setNewMessage((prev) => ({ ...prev, [name]: value }));
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newMessage.subject.trim() || !newMessage.message.trim()) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, preencha os campos obrigatórios.",
        variant: "destructive",
      });
      return;
    }

    if (!profile?.user.id) {
      toast({
        title: "Usuário não identificado",
        description: "Não foi possível identificar o usuário para envio.",
        variant: "destructive",
      });
      return;
    }

    setSending(true);

    try {
      const response = await fetch("/api/send-message", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          assunto: newMessage.subject,
          conteudo: newMessage.message,
          user_id: profile.user.id,
          file_list_ids: [],
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Erro desconhecido");
      }

      const data = await response.json();

      setMessages((prev) => [
        {
          id: data.results.id,
          assunto: data.results.assunto,
          estado: data.results.estado,
          data_criacao: data.results.data_criacao,
          data_ultima_mensagem: data.results.data_ultima_mensagem,
          nome_cliente: data.results.nome_cliente,
          read: true,
          starred: false,
        },
        ...prev,
      ]);

      // Registrar atividade de mensagem enviada
      console.log("🔄 Registrando atividade de mensagem enviada no modal...");
      registerMessageSentActivity("Nova", newMessage.subject)
        .then(() => {
          console.log(
            "✅ Atividade de mensagem enviada registrada com sucesso no modal!"
          );
        })
        .catch((error) => {
          console.error(
            "❌ Erro ao registrar atividade de mensagem enviada no modal:",
            error
          );
        });

      // Não incrementar o contador pois a mensagem enviada já está marcada como lida

      toast({
        title: "Mensagem enviada",
        description: "Sua mensagem foi enviada com sucesso.",
      });

      setNewMessage({ to: profile.user.id, subject: "", message: "" });
      setComposeDialogOpen(false);
    } catch (error: any) {
      toast({
        title: "Erro ao enviar",
        description: error.message || "Erro desconhecido.",
        variant: "destructive",
      });
    } finally {
      setSending(false);
    }
  };

  // Se estiver carregando, renderiza loading
  if (loading)
    return (
      <div className="w-full h-full p-4 md:p-6 flex items-center justify-center">
        <LoadingContainer message="CARREGANDO MENSAGENS..." />
      </div>
    );

  // Se houver erro, renderiza erro
  if (error)
    return (
      <div className="w-full h-full p-4 md:p-6 bg-company-gray-200 flex items-center justify-center">
        <div className="text-red-500">{error}</div>
      </div>
    );

  // Se não estiver carregando e não houver mensagens, renderiza mensagem de nenhum resultado
  if (!loading && messages.length === 0)
    return (
      <div className="w-full h-full p-4 md:p-6 bg-company-gray-200 flex items-center justify-center">
        <div className="text-center">
          <div className="text-gray-500 text-lg mb-2">
            Nenhuma mensagem encontrada
          </div>
          <div className="text-gray-400 text-sm">
            Não há mensagens para exibir no momento.
          </div>
        </div>
      </div>
    );

  return (
    <div className="w-full h-full p-3 sm:p-4 md:p-6 bg-company-gray-200 overflow-y-auto">
      {/* Header responsivo */}
      <div className="flex flex-col gap-4 mb-4 sm:mb-6">
        <div className="flex justify-between items-center gap-3 sm:gap-4">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
            <div>
              <h1 className="text-lg sm:text-xl md:text-2xl text-[#002856] font-bold">
                Mensagens
              </h1>
              <p className="text-sm text-gray-600 mt-1 hidden sm:block">
                Gerencie suas mensagens e comunicações
              </p>
            </div>
            {globalUnreadCount > 0 && (
              <Badge className="bg-[#002856] text-white text-xs w-fit">
                {globalUnreadCount} não{" "}
                {globalUnreadCount === 1 ? "lida" : "lidas"}
              </Badge>
            )}
          </div>

          <div className="flex flex-col gap-2">
            {/* Botão Nova Mensagem */}
            <Button
              className="bg-[#002856] hover:bg-[#002856]/80 order-1"
              onClick={openComposeDialog}
            >
              <Plus className="h-4 w-4" />
              Nova Mensagem
            </Button>

            {/* Botões de visualização */}
            <div className="flex items-center justify-end gap-2 order-2">
              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={() => setViewMode("list")}
                  className={`h-8 px-2 sm:h-9 sm:px-3 ${
                    viewMode === "list"
                      ? "bg-[#002856] hover:bg-[#002856]/80 text-white"
                      : "bg-white text-gray-600 hover:text-white hover:bg-[#002856]/50"
                  }`}
                  title="Visualização em lista"
                >
                  <List className="h-3 w-3 sm:h-4 sm:w-4" />
                </Button>
                <Button
                  size="sm"
                  onClick={() => setViewMode("grid")}
                  className={`h-8 px-2 sm:h-9 sm:px-3 ${
                    viewMode === "grid"
                      ? "bg-[#002856] hover:bg-[#002856]/80 text-white"
                      : "bg-white text-gray-600 hover:text-white hover:bg-[#002856]/50"
                  }`}
                  title="Visualização em grade"
                >
                  <Grid3X3 className="h-3 w-3 sm:h-4 sm:w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Lista de mensagens responsiva */}
      <div
        className={
          viewMode === "grid"
            ? "grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2 sm:gap-3 md:gap-4"
            : "space-y-2 sm:space-y-3 md:space-y-4 w-full"
        }
      >
        {messages
          .sort((a, b) => {
            // Primeiro, ordenar por status de leitura (não lidas primeiro)
            const aIsRead = isMessageRead(a.id);
            const bIsRead = isMessageRead(b.id);

            if (aIsRead !== bIsRead) {
              return aIsRead ? 1 : -1; // Não lidas primeiro
            }

            // Se ambas têm o mesmo status de leitura, ordenar por data (mais recentes primeiro)
            const aDate = new Date(a.data_criacao || 0);
            const bDate = new Date(b.data_criacao || 0);
            return bDate.getTime() - aDate.getTime();
          })
          .map((message) => (
            <Card
              key={message.id}
              className={`cursor-pointer transition-colors hover:bg-gray-50 w-full relative ${
                !isMessageRead(message.id)
                  ? viewMode === "list"
                    ? "border-l-4 border-l-[#002856] bg-blue-50"
                    : "border-2 border-[#002856] bg-blue-50"
                  : ""
              }`}
            >
              <CardContent
                className={`${
                  viewMode === "grid" ? "p-1 sm:p-2 md:p-3" : "p-3 sm:p-4"
                }`}
              >
                <div
                  className={`flex items-start gap-1 sm:gap-2 md:gap-3 lg:gap-4 ${
                    viewMode === "grid" ? "flex-col" : ""
                  }`}
                >
                  {/* Avatar */}
                  <div
                    className={`relative flex-shrink-0 ${
                      viewMode === "grid" ? "self-center" : ""
                    }`}
                  >
                    {message.starred && (
                      <Star
                        className={`absolute ${
                          viewMode === "grid"
                            ? "top-0 right-0"
                            : "-top-1 -left-1"
                        } h-3 w-3 sm:h-4 sm:w-4 text-yellow-500 fill-yellow-500 z-50`}
                      />
                    )}
                    <Avatar
                      className={`${
                        viewMode === "grid"
                          ? "h-6 w-6 sm:h-8 sm:w-8 md:h-10 md:w-10 lg:h-12 lg:w-12"
                          : "h-8 w-8 sm:h-10 sm:w-10"
                      } flex items-center justify-center text-[#002856] ${
                        !isMessageRead(message.id)
                          ? "bg-blue-200"
                          : "bg-blue-100"
                      }`}
                    >
                      <AvatarImage
                        src={`/api/proxy-image?url=${encodeURIComponent(
                          `${process.env.NEXT_PUBLIC_API_BASE_URL_IMAGE}/${profile?.user?.imagem_id}`
                        )}`}
                        className="rounded-full"
                      />
                      <AvatarFallback className="text-white hover:text-[#002256] text-xs sm:text-sm">
                        {profile?.user?.nome?.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                  </div>

                  {/* Conteúdo da mensagem */}
                  <Link
                    href={``}
                    onClick={async () => {
                      // Marcar como lida se não estiver lida
                      if (!isMessageRead(message.id)) {
                        markMessageAsRead(message.id);
                        await markAsRead(message.id);
                      }
                      onSelectDetail(message.id);
                    }}
                    className={`${
                      viewMode === "grid"
                        ? "w-full text-center"
                        : "flex-1 min-w-0"
                    }`}
                  >
                    <div className="flex flex-col gap-1">
                      <div
                        className={`flex flex-col gap-1 ${
                          viewMode === "grid"
                            ? "items-center"
                            : "sm:flex-row sm:justify-between sm:items-start"
                        }`}
                      >
                        <div
                          className={`flex items-center gap-2 flex-wrap ${
                            viewMode === "grid" ? "justify-center" : ""
                          }`}
                        >
                          <h3
                            className={`${
                              viewMode === "grid"
                                ? "text-xs sm:text-sm md:text-base"
                                : "text-sm sm:text-base"
                            } font-medium ${
                              !isMessageRead(message.id)
                                ? "font-bold text-company-blue-800"
                                : "text-gray-800"
                            }`}
                          >
                            {viewMode === "grid"
                              ? truncateTitle(message.assunto, true)
                              : message.assunto}
                          </h3>

                          {!isMessageRead(message.id) && (
                            <Badge
                              className={`bg-company-blue-600 text-[#002856] ${
                                viewMode === "grid" ? "text-xs" : "text-xs"
                              }`}
                            >
                              Nova
                            </Badge>
                          )}
                        </div>
                        <span
                          className={`${
                            viewMode === "grid" ? "text-xs" : "text-xs"
                          } text-gray-500 ${
                            viewMode === "grid"
                              ? "text-center"
                              : "whitespace-nowrap"
                          }`}
                        >
                          {message.data_criacao
                            ? new Date(message.data_criacao).toLocaleDateString(
                                "pt-BR"
                              )
                            : "-"}
                        </span>
                      </div>
                      <p
                        className={`${
                          viewMode === "grid" ? "text-xs" : "text-xs"
                        } text-gray-500 ${
                          viewMode === "grid"
                            ? "text-center hidden sm:block"
                            : ""
                        }`}
                      >
                        De: {message.nome_cliente}
                      </p>
                      <p
                        className={`${
                          viewMode === "grid" ? "text-xs" : "text-xs"
                        } text-gray-500 ${
                          viewMode === "grid"
                            ? "text-center hidden sm:block"
                            : "hidden sm:block"
                        }`}
                      >
                        Última atualização:{" "}
                        {message.data_ultima_mensagem
                          ? new Date(
                              message.data_ultima_mensagem
                            ).toLocaleString("pt-BR")
                          : "-"}
                      </p>
                    </div>
                  </Link>

                  {/* Botões de ação - Desktop */}
                  <div
                    className={`hidden md:flex items-center gap-1 flex-shrink-0 ${
                      viewMode === "grid" ? "justify-center w-full" : ""
                    }`}
                  >
                    <Button
                      variant="ghost"
                      size="icon"
                      className={`${
                        viewMode === "grid"
                          ? "h-6 w-6 sm:h-8 sm:w-8"
                          : "h-8 w-8"
                      }`}
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setMessages((prev) =>
                          prev.map((msg) =>
                            msg.id === message.id
                              ? { ...msg, starred: !msg.starred }
                              : msg
                          )
                        );
                        toast({
                          title: message.starred
                            ? "Destaque removido"
                            : "Mensagem destacada",
                          description: message.starred
                            ? "A mensagem foi removida dos favoritos."
                            : "A mensagem foi adicionada aos favoritos.",
                        });
                      }}
                      title={
                        message.starred
                          ? "Remover destaque"
                          : "Destacar mensagem"
                      }
                    >
                      <Star
                        className={`${
                          viewMode === "grid"
                            ? "h-3 w-3 sm:h-4 sm:w-4"
                            : "h-4 w-4"
                        } ${
                          message.starred
                            ? "text-yellow-500 fill-yellow-500"
                            : "text-gray-400"
                        }`}
                      />
                    </Button>

                    <Button
                      variant="ghost"
                      size="icon"
                      className={`${
                        viewMode === "grid"
                          ? "h-6 w-6 sm:h-8 sm:w-8"
                          : "h-8 w-8"
                      }`}
                      onClick={async (e) => {
                        e.preventDefault();
                        e.stopPropagation();

                        if (isMessageRead(message.id)) {
                          markMessageAsUnread(message.id);
                          await markAsUnread(message.id);
                        } else {
                          markMessageAsRead(message.id);
                          await markAsRead(message.id);
                        }
                      }}
                      title={
                        isMessageRead(message.id)
                          ? "Marcar como não lida"
                          : "Marcar como lida"
                      }
                    >
                      {isMessageRead(message.id) ? (
                        <Mail
                          className={`${
                            viewMode === "grid"
                              ? "h-3 w-3 sm:h-4 sm:w-4"
                              : "h-4 w-4"
                          } text-gray-400`}
                        />
                      ) : (
                        <MailOpen
                          className={`${
                            viewMode === "grid"
                              ? "h-3 w-3 sm:h-4 sm:w-4"
                              : "h-4 w-4"
                          } text-company-blue-600`}
                        />
                      )}
                    </Button>

                    <Button
                      onClick={async () => {
                        // Marcar como lida se não estiver lida
                        if (!isMessageRead(message.id)) {
                          markMessageAsRead(message.id);
                          await markAsRead(message.id);
                          refreshUnreadCount();
                        }
                        onSelectDetail(message.id);
                      }}
                      variant="ghost"
                      size="icon"
                      className={`${
                        viewMode === "grid"
                          ? "h-6 w-6 sm:h-8 sm:w-8"
                          : "h-8 w-8"
                      }`}
                      title="Ver mensagem"
                    >
                      <Eye
                        className={`${
                          viewMode === "grid"
                            ? "h-3 w-3 sm:h-4 sm:w-4"
                            : "h-4 w-4"
                        } text-gray-400`}
                      />
                    </Button>

                    <Button
                      variant="ghost"
                      size="icon"
                      className={`${
                        viewMode === "grid"
                          ? "h-6 w-6 sm:h-8 sm:w-8"
                          : "h-8 w-8"
                      }`}
                      onClick={(e) => openDeleteDialog(message.id, e)}
                      title="Excluir mensagem"
                    >
                      <Trash2
                        className={`${
                          viewMode === "grid"
                            ? "h-3 w-3 sm:h-4 sm:w-4"
                            : "h-4 w-4"
                        } text-gray-400`}
                      />
                    </Button>
                  </div>

                  {/* Menu dropdown para mobile */}
                  <div
                    className={`md:hidden flex-shrink-0 ${
                      viewMode === "grid" ? "absolute top-1 right-1" : ""
                    }`}
                  >
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className={`${
                            viewMode === "grid"
                              ? "h-6 w-6 p-0.5"
                              : "h-8 w-8 p-1"
                          }`}
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                          }}
                        >
                          <MoreVertical
                            className={`${
                              viewMode === "grid" ? "h-3 w-3" : "h-4 w-4"
                            }`}
                          />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent
                        align="end"
                        className="w-64 sm:w-56 md:w-48 min-w-[240px] sm:min-w-[200px] max-w-[320px] sm:max-w-[280px] p-1"
                        sideOffset={8}
                      >
                        <DropdownMenuItem
                          onClick={async () => {
                            if (!isMessageRead(message.id)) {
                              markMessageAsRead(message.id);
                              await markAsRead(message.id);
                              refreshUnreadCount();
                            }
                            onSelectDetail(message.id);
                          }}
                          className="flex items-center gap-2 sm:gap-3 p-2 sm:p-2 text-xs sm:text-sm cursor-pointer hover:bg-gray-100 rounded-md"
                        >
                          <Eye className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                          <span className="flex-1">Ver mensagem</span>
                        </DropdownMenuItem>

                        <DropdownMenuItem
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setMessages((prev) =>
                              prev.map((msg) =>
                                msg.id === message.id
                                  ? { ...msg, starred: !msg.starred }
                                  : msg
                              )
                            );
                            toast({
                              title: message.starred
                                ? "Destaque removido"
                                : "Mensagem destacada",
                              description: message.starred
                                ? "A mensagem foi removida dos favoritos."
                                : "A mensagem foi adicionada aos favoritos.",
                            });
                          }}
                          className="flex items-center gap-2 sm:gap-3 p-2 sm:p-2 text-xs sm:text-sm cursor-pointer hover:bg-gray-100 rounded-md"
                        >
                          <Star
                            className={`h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0 ${
                              message.starred
                                ? "text-yellow-500 fill-yellow-500"
                                : "text-gray-400"
                            }`}
                          />
                          <span className="flex-1">
                            {message.starred ? "Remover destaque" : "Destacar"}
                          </span>
                        </DropdownMenuItem>

                        <DropdownMenuItem
                          onClick={async (e) => {
                            e.preventDefault();
                            e.stopPropagation();

                            if (isMessageRead(message.id)) {
                              markMessageAsUnread(message.id);
                              await markAsUnread(message.id);
                            } else {
                              markMessageAsRead(message.id);
                              await markAsRead(message.id);
                            }
                          }}
                          className="flex items-center gap-2 sm:gap-3 p-2 sm:p-2 text-xs sm:text-sm cursor-pointer hover:bg-gray-100 rounded-md"
                        >
                          {isMessageRead(message.id) ? (
                            <Mail className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0 text-gray-400" />
                          ) : (
                            <MailOpen className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0 text-company-blue-600" />
                          )}
                          <span className="flex-1">
                            {isMessageRead(message.id)
                              ? "Marcar como não lida"
                              : "Marcar como lida"}
                          </span>
                        </DropdownMenuItem>

                        <DropdownMenuItem
                          onClick={(e) => openDeleteDialog(message.id, e)}
                          className="flex items-center gap-2 sm:gap-3 p-2 sm:p-2 text-xs sm:text-sm cursor-pointer hover:bg-red-50 rounded-md text-red-600"
                        >
                          <Trash2 className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                          <span className="flex-1">Excluir</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="w-[95vw] max-w-md mx-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base sm:text-lg">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              Confirmar exclusão
            </DialogTitle>
            <DialogDescription className="text-sm">
              Tem certeza que deseja excluir a mensagem &quot;
              {messageToDelete
                ? messages.find((msg) => msg.id === messageToDelete)?.assunto
                : ""}
              &quot;? Esta ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex flex-col gap-2 sm:flex-row sm:justify-between">
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
              className="w-full sm:w-auto order-2 sm:order-1"
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDeleteMessage}
              className="w-full sm:w-auto order-1 sm:order-2"
            >
              Excluir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Compose Message Dialog */}
      <Dialog open={composeDialogOpen} onOpenChange={closeComposeDialog}>
        <DialogContent className="w-[95vw] max-w-[600px] mx-auto max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-[#002856] text-base sm:text-lg">
              Nova Mensagem
            </DialogTitle>
            <DialogDescription className="text-sm">
              Preencha os campos abaixo para enviar uma nova mensagem.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSendMessage} noValidate>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label className="text-[#002856] text-sm" htmlFor="subject">
                  Assunto <span className="text-red-600">*</span>
                </Label>
                <Input
                  id="subject"
                  name="subject"
                  placeholder="Assunto da mensagem"
                  value={newMessage.subject}
                  onChange={handleComposeInputChange}
                  disabled={sending}
                  autoFocus
                  aria-required="true"
                  aria-invalid={!newMessage.subject ? "true" : "false"}
                  className={`${
                    !newMessage.subject ? "border-red-500" : ""
                  } text-sm`}
                />
                {!newMessage.subject && (
                  <p className="text-red-600 text-xs">Assunto é obrigatório.</p>
                )}
              </div>

              <div className="grid gap-2">
                <Label className="text-[#002856] text-sm" htmlFor="message">
                  Mensagem <span className="text-red-600">*</span>
                </Label>
                <Textarea
                  id="message"
                  name="message"
                  placeholder="Escreva sua mensagem aqui..."
                  rows={5}
                  value={newMessage.message}
                  onChange={handleComposeInputChange}
                  disabled={sending}
                  aria-required="true"
                  aria-invalid={!newMessage.message ? "true" : "false"}
                  className={`${
                    !newMessage.message ? "border-red-500" : ""
                  } text-sm`}
                />
                {!newMessage.message && (
                  <p className="text-red-600 text-xs">
                    Mensagem é obrigatória.
                  </p>
                )}
              </div>
            </div>

            <DialogFooter className="flex flex-col gap-2 sm:flex-row sm:justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={closeComposeDialog}
                disabled={sending}
                className="text-[#002856] border border-[#002856] hover:bg-gray-200 w-full sm:w-auto order-2 sm:order-1"
              >
                Cancelar
              </Button>

              <Button
                type="submit"
                disabled={
                  sending ||
                  !newMessage.subject.trim() ||
                  !newMessage.message.trim()
                }
                className={`bg-[#002856] text-white border-[#002856] hover:bg-[#002856]/80 ${
                  sending ? "cursor-not-allowed opacity-70" : "cursor-pointer"
                } flex items-center justify-center w-full sm:w-auto order-1 sm:order-2`}
              >
                {sending ? (
                  "Enviando..."
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Enviar
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
