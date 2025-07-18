/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useState } from "react";
import { PageTitle } from "@/components/ui/page-title";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
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
} from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { LoadingScreen } from "@/components/ui/loading-screen";

import { useUnreadCount } from "@/hooks/useUnreadCount";
import { useUserProfile } from "@/hooks/useUserProfile ";

type MensagemPageProps = {
  onSelectDetail: (id: string) => void;
};

export default function MensagensPage({ onSelectDetail }: MensagemPageProps) {
  const { profile } = useUserProfile();

  // Usa o hook com o userId do perfil
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
      setMessages((prev) => prev.filter((msg) => msg.id !== messageToDelete));
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

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();

    if (!newMessage.to || !newMessage.subject || !newMessage.message) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, preencha todos os campos obrigatórios.",
        variant: "destructive",
      });
      return;
    }

    setSending(true);

    setTimeout(() => {
      const newId = `${Date.now()}`;
      setMessages((prev) => [
        {
          id: newId,
          assunto: newMessage.subject,
          estado: "ENVIADA",
          data_criacao: new Date().toISOString(),
          data_ultima_mensagem: new Date().toISOString(),
          nome_cliente: newMessage.to,
          read: true,
          starred: false,
        },
        ...prev,
      ]);

      toast({
        title: "Mensagem enviada",
        description: "Sua mensagem foi enviada com sucesso.",
      });

      setNewMessage({ to: "", subject: "", message: "" });
      setComposeDialogOpen(false);
      setSending(false);
    }, 1000);
  };

  // Se estiver carregando ou erro, renderiza adequadamente
  if (loading)
    return (
      <div className="w-full h-full p-6 bg-company-gray-200 flex items-center justify-center">
        <LoadingScreen />
      </div>
    );

  if (error)
    return (
      <div className="w-full h-full p-6 bg-company-gray-200 flex items-center justify-center">
        <div className="text-red-500">{error}</div>
      </div>
    );

  return (
    <div className="w-full h-full p-6 bg-company-gray-200">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <PageTitle
            title="Mensagens"
            description="Gerencie suas mensagens e comunicações"
          />
          {unreadCount > 0 && (
            <Badge className="bg-[#002856] text-white">
              {unreadCount} não {unreadCount === 1 ? "lida" : "lidas"}
            </Badge>
          )}
        </div>

        <Button
          className="bg-[#002856] hover:bg-company-blue-700"
          onClick={openComposeDialog}
        >
          <Plus className="h-4 w-4 mr-2" />
          Nova Mensagem
        </Button>
      </div>

      <div className="mt-6 space-y-4 w-full">
        {messages.map((message) => (
          <Card
            key={message.id}
            className={`cursor-pointer transition-colors hover:bg-gray-50 w-full ${
              !message.read ? "border-l-4 border-l-[#002856] bg-blue-50" : ""
            }`}
          >
            <CardContent className="p-4 flex items-center gap-4">
              <div className="relative">
                {message.starred && (
                  <Star className="absolute -top-1 -left-1 h-4 w-4 text-yellow-500 fill-yellow-500 z-50" />
                )}
                <Avatar
                  className={`h-10 w-10 flex items-center justify-center text-[#002856] ${
                    !message.read ? "bg-blue-200" : "bg-blue-100"
                  } flex-shrink-0`}
                >
                  <span className="text-lg font-semibold">
                    {message.nome_cliente?.charAt(0) ?? ""}
                  </span>
                </Avatar>
              </div>

              <Link
                href={`/mensagens/${message.id}`}
                className="flex-1 min-w-0"
              >
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-2">
                    <h3
                      className={`text-base ${
                        !message.read
                          ? "font-bold text-company-blue-800"
                          : "font-medium text-gray-800"
                      }`}
                    >
                      {message.assunto}
                    </h3>

                    {!message.read && (
                      <Badge className="bg-company-blue-600 text-white">
                        Nova
                      </Badge>
                    )}
                  </div>
                  <span className="text-xs text-gray-500 whitespace-nowrap ml-2">
                    {message.data_criacao
                      ? new Date(message.data_criacao).toLocaleDateString(
                          "pt-BR"
                        )
                      : "-"}
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  De: {message.nome_cliente}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Última atualização:{" "}
                  {message.data_ultima_mensagem
                    ? new Date(message.data_ultima_mensagem).toLocaleString(
                        "pt-BR"
                      )
                    : "-"}
                </p>
              </Link>

              <div className="flex items-center gap-1 flex-shrink-0">
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
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();

                    if (message.read) {
                      markAsUnread(message.id);
                    } else {
                      markAsRead(message.id);
                    }
                  }}
                  title={
                    message.read ? "Marcar como não lida" : "Marcar como lida"
                  }
                >
                  {message.read ? (
                    <Mail className="h-4 w-4 text-gray-400" />
                  ) : (
                    <MailOpen className="h-4 w-4 text-company-blue-600" />
                  )}
                </Button>

                <Button
                  onClick={() => onSelectDetail(message.id)}
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
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              Confirmar exclusão
            </DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir a mensagem &quot;
              {messageToDelete
                ? messages.find((msg) => msg.id === messageToDelete)?.assunto
                : ""}
              &quot;? Esta ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="sm:justify-between">
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
            >
              Cancelar
            </Button>
            <Button variant="destructive" onClick={confirmDeleteMessage}>
              Excluir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Compose Message Dialog */}
      <Dialog open={composeDialogOpen} onOpenChange={closeComposeDialog}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="text-[#002856]">Nova Mensagem</DialogTitle>
            <DialogDescription>
              Preencha os campos abaixo para enviar uma nova mensagem.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSendMessage}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label className="text-[#002856]" htmlFor="to">
                  Para:
                </Label>
                <Input
                  id="to"
                  name="to"
                  placeholder="email@destinatario.com"
                  value={newMessage.to}
                  onChange={handleComposeInputChange}
                  disabled={sending}
                />
              </div>
              <div className="grid gap-2">
                <Label className="text-[#002856]" htmlFor="subject">
                  Assunto:
                </Label>
                <Input
                  id="subject"
                  name="subject"
                  placeholder="Assunto da mensagem"
                  value={newMessage.subject}
                  onChange={handleComposeInputChange}
                  disabled={sending}
                />
              </div>
              <div className="grid gap-2">
                <Label className="text-[#002856]" htmlFor="message">
                  Mensagem:
                </Label>
                <Textarea
                  id="message"
                  name="message"
                  placeholder="Escreva sua mensagem aqui..."
                  rows={8}
                  value={newMessage.message}
                  onChange={handleComposeInputChange}
                  disabled={sending}
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                className="text-[#002856] border border-[#002856] hover:bg-gray-200"
                type="button"
                variant="outline"
                onClick={closeComposeDialog}
                disabled={sending}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={sending}
                className="bg-[#002856] text-white border-[#002856] hover:bg-[#002856]/50"
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
