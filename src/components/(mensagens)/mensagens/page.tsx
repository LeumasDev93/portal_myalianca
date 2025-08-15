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
} from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { LoadingScreen } from "@/components/ui/loading-screen";
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

type MensagemPageProps = {
  onSelectDetail: (id: string) => void;
  onUnreadCountChange?: (count: number) => void;
};

export default function MensagensPage({
  onSelectDetail,
  onUnreadCountChange,
}: MensagemPageProps) {
  const { profile } = useUserProfile();
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

  // Se estiver carregando ou erro, renderiza adequadamente
  if (loading)
    return (
      <div className="w-full h-full p-4 md:p-6 flex items-center justify-center">
        <LoadingScreen />
      </div>
    );

  if (error)
    return (
      <div className="w-full h-full p-4 md:p-6 bg-company-gray-200 flex items-center justify-center">
        <div className="text-red-500">{error}</div>
      </div>
    );

  return (
    <div className="w-full h-full p-3 sm:p-4 md:p-6 bg-company-gray-200 overflow-y-auto">
      {/* Header responsivo */}
      <div className="flex flex-col gap-4 mb-4 sm:mb-6">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-4">
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

          <Button
            className="bg-[#002856] hover:bg-company-blue-700 w-full sm:w-auto"
            onClick={openComposeDialog}
          >
            <Plus className="h-4 w-4 mr-2" />
            Nova Mensagem
          </Button>
        </div>
      </div>

      {/* Lista de mensagens responsiva */}
      <div className="space-y-2 sm:space-y-3 md:space-y-4 w-full">
        {messages.map((message) => (
          <Card
            key={message.id}
            className={`cursor-pointer transition-colors hover:bg-gray-50 w-full ${
              !isMessageRead(message.id)
                ? "border-l-4 border-l-[#002856] bg-blue-50"
                : ""
            }`}
          >
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-start gap-3 sm:gap-4">
                {/* Avatar */}
                <div className="relative flex-shrink-0">
                  {message.starred && (
                    <Star className="absolute -top-1 -left-1 h-3 w-3 sm:h-4 sm:w-4 text-yellow-500 fill-yellow-500 z-50" />
                  )}
                  <Avatar
                    className={`h-8 w-8 sm:h-10 sm:w-10 flex items-center justify-center text-[#002856] ${
                      !isMessageRead(message.id) ? "bg-blue-200" : "bg-blue-100"
                    }`}
                  >
                    <AvatarImage
                      src={`${process.env.NEXT_PUBLIC_API_BASE_URL_IMAGE}/${profile?.user?.imagem_id}`}
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
                  className="flex-1 min-w-0"
                >
                  <div className="flex flex-col gap-1">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3
                          className={`text-sm sm:text-base font-medium ${
                            !isMessageRead(message.id)
                              ? "font-bold text-company-blue-800"
                              : "text-gray-800"
                          }`}
                        >
                          {message.assunto}
                        </h3>

                        {!isMessageRead(message.id) && (
                          <Badge className="bg-company-blue-600 text-[#002856] text-xs">
                            Nova
                          </Badge>
                        )}
                      </div>
                      <span className="text-xs text-gray-500 whitespace-nowrap">
                        {message.data_criacao
                          ? new Date(message.data_criacao).toLocaleDateString(
                              "pt-BR"
                            )
                          : "-"}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500">
                      De: {message.nome_cliente}
                    </p>
                    <p className="text-xs text-gray-500 hidden sm:block">
                      Última atualização:{" "}
                      {message.data_ultima_mensagem
                        ? new Date(message.data_ultima_mensagem).toLocaleString(
                            "pt-BR"
                          )
                        : "-"}
                    </p>
                  </div>
                </Link>

                {/* Botões de ação - Desktop */}
                <div className="hidden md:flex items-center gap-1 flex-shrink-0">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
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
                      message.starred ? "Remover destaque" : "Destacar mensagem"
                    }
                  >
                    <Star
                      className={`h-4 w-4 ${
                        message.starred
                          ? "text-yellow-500 fill-yellow-500"
                          : "text-gray-400"
                      }`}
                    />
                  </Button>

                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
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
                      <Mail className="h-4 w-4 text-gray-400" />
                    ) : (
                      <MailOpen className="h-4 w-4 text-company-blue-600" />
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
                    className="h-8 w-8"
                    title="Ver mensagem"
                  >
                    <Eye className="h-4 w-4 text-gray-400" />
                  </Button>

                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={(e) => openDeleteDialog(message.id, e)}
                    title="Excluir mensagem"
                  >
                    <Trash2 className="h-4 w-4 text-gray-400" />
                  </Button>
                </div>

                {/* Menu dropdown para mobile */}
                <div className="md:hidden flex-shrink-0">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                        }}
                      >
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      <DropdownMenuItem
                        onClick={async () => {
                          if (!isMessageRead(message.id)) {
                            markMessageAsRead(message.id);
                            await markAsRead(message.id);
                            refreshUnreadCount();
                          }
                          onSelectDetail(message.id);
                        }}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        Ver mensagem
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
                      >
                        <Star
                          className={`h-4 w-4 mr-2 ${
                            message.starred
                              ? "text-yellow-500 fill-yellow-500"
                              : "text-gray-400"
                          }`}
                        />
                        {message.starred ? "Remover destaque" : "Destacar"}
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
                      >
                        {isMessageRead(message.id) ? (
                          <Mail className="h-4 w-4 mr-2 text-gray-400" />
                        ) : (
                          <MailOpen className="h-4 w-4 mr-2 text-company-blue-600" />
                        )}
                        {isMessageRead(message.id)
                          ? "Marcar como não lida"
                          : "Marcar como lida"}
                      </DropdownMenuItem>

                      <DropdownMenuItem
                        onClick={(e) => openDeleteDialog(message.id, e)}
                        className="text-red-600"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Excluir
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
