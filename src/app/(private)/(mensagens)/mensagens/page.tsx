/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import type React from "react";

import { PageTitle } from "@/components/ui/page-title";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
  MoreHorizontal,
  Star,
  MessageSquare,
  Plus,
  AlertTriangle,
  Send,
  Mail,
  MailOpen,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "@/components/ui/use-toast";
import { Badge } from "@/components/ui/badge";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useUnreadCount } from "@/hooks/useUnreadCount";

const initialMessages = [
  {
    id: "1",
    sender: "Atendimento Aliança",
    subject: "Confirmação de pagamento",
    preview: "Seu pagamento da apólice #12345 foi confirmado com sucesso.",
    date: "2023-05-15T10:30:00",
    read: false,
    starred: false,
    replyCount: 2,
  },
  {
    id: "2",
    sender: "Departamento de Sinistros",
    subject: "Atualização do seu sinistro",
    preview: "Gostaríamos de informar que seu sinistro #78901 foi aprovado.",
    date: "2023-05-10T14:45:00",
    read: false,
    starred: true,
    replyCount: 0,
  },
  {
    id: "3",
    sender: "Equipe de Renovação",
    subject: "Sua apólice está prestes a vencer",
    preview:
      "Sua apólice de seguro auto vence em 15 dias. Clique para renovar.",
    date: "2023-05-05T09:15:00",
    read: true,
    starred: false,
    replyCount: 1,
  },
  {
    id: "4",
    sender: "Promoções Aliança",
    subject: "Oferta especial para clientes",
    preview:
      "Aproveite nosso desconto exclusivo de 15% em novos seguros residenciais.",
    date: "2023-05-01T16:20:00",
    read: false,
    starred: false,
    replyCount: 0,
  },
  {
    id: "5",
    sender: "Suporte ao Cliente",
    subject: "Resposta à sua solicitação",
    preview:
      "Em resposta ao seu pedido de informações sobre coberturas adicionais...",
    date: "2023-04-28T11:05:00",
    read: false,
    starred: false,
    replyCount: 0,
  },
];

type MensagemPageProps = {
  onSelectDetail: (id: string) => void;
};

export default function MensagensPage({ onSelectDetail }: MensagemPageProps) {
  const [messages, setMessages] = useState(() => {
    const savedMessages = localStorage.getItem("messages");
    return savedMessages ? JSON.parse(savedMessages) : initialMessages;
  });
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
    localStorage.setItem("messages", JSON.stringify(messages));
  }, [messages]);

  const unreadCount = useUnreadCount();
  const markAsRead = (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setMessages((prevMessages: any) =>
      prevMessages.map((message: any) =>
        message.id === id ? { ...message, read: true } : message
      )
    );
    toast({
      title: "Mensagem marcada como lida",
      description: "A mensagem foi marcada como lida com sucesso.",
    });
  };

  // Function to mark a message as unread
  const markAsUnread = (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setMessages((prevMessages: any) =>
      prevMessages.map((message: any) =>
        message.id === id ? { ...message, read: false } : message
      )
    );
    toast({
      title: "Mensagem marcada como não lida",
      description: "A mensagem foi marcada como não lida com sucesso.",
    });
  };

  // Function to open delete confirmation dialog
  const openDeleteDialog = (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setMessageToDelete(id);
    setDeleteDialogOpen(true);
  };

  // Function to delete a message after confirmation
  const confirmDeleteMessage = () => {
    if (messageToDelete) {
      setMessages((prevMessages: any) =>
        prevMessages.filter((message: any) => message.id !== messageToDelete)
      );
      toast({
        title: "Mensagem excluída",
        description: "A mensagem foi excluída com sucesso.",
      });
      setDeleteDialogOpen(false);
      setMessageToDelete(null);
    }
  };

  // Function to cancel delete
  const cancelDelete = () => {
    setDeleteDialogOpen(false);
    setMessageToDelete(null);
  };

  // Function to toggle star status
  const toggleStar = (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setMessages((prevMessages: any) =>
      prevMessages.map((message: any) => {
        if (message.id === id) {
          const newStarred = !message.starred;
          toast({
            title: newStarred ? "Mensagem destacada" : "Destaque removido",
            description: newStarred
              ? "A mensagem foi adicionada aos favoritos."
              : "A mensagem foi removida dos favoritos.",
          });
          return { ...message, starred: newStarred };
        }
        return message;
      })
    );
  };

  // Get message subject by ID
  const getMessageSubject = (id: string) => {
    const message = messages.find((msg: any) => msg.id === id);
    return message ? message.subject : "esta mensagem";
  };

  // Function to open compose dialog
  const openComposeDialog = () => {
    setComposeDialogOpen(true);
  };

  // Function to handle input change in compose form
  const handleComposeInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setNewMessage((prev) => ({ ...prev, [name]: value }));
  };

  // Function to send new message
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate form
    if (!newMessage.to || !newMessage.subject || !newMessage.message) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, preencha todos os campos obrigatórios.",
        variant: "destructive",
      });
      return;
    }

    // Set sending state
    setSending(true);

    // Simulate sending with a delay
    setTimeout(() => {
      // Add to messages list
      const newId = `${Date.now()}`;
      setMessages((prev: any) => [
        {
          id: newId,
          sender: "Você",
          subject: newMessage.subject,
          preview:
            newMessage.message.substring(0, 100) +
            (newMessage.message.length > 100 ? "..." : ""),
          date: new Date().toISOString(),
          read: true,
          starred: false,
          replyCount: 0,
        },
        ...prev,
      ]);

      // Show success message
      toast({
        title: "Mensagem enviada",
        description: "Sua mensagem foi enviada com sucesso.",
      });

      // Reset form and close dialog
      setNewMessage({ to: "", subject: "", message: "" });
      setComposeDialogOpen(false);
      setSending(false);
    }, 1000);
  };

  // Function to close compose dialog
  const closeComposeDialog = () => {
    if (!sending) {
      setComposeDialogOpen(false);
      setNewMessage({ to: "", subject: "", message: "" });
    }
  };

  // Count unread messages

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
        {messages.map((message: any) => (
          <Card
            key={message.id}
            className={`cursor-pointer transition-colors hover:bg-gray-50 w-full ${
              !message.read ? "border-l-4 border-l-[#002856] bg-blue-50" : ""
            }`}
          >
            <CardContent className="p-4 flex items-center gap-4">
              <div className="relative ">
                {message.starred && (
                  <Star className="absolute -top-1 -left-1 h-4 w-4 text-yellow-500 fill-yellow-500 z-50" />
                )}
                <Avatar
                  className={`h-10 w-10 flex items-center justify-center text-[#002856] ${
                    !message.read ? "bg-blue-200 " : "bg-blue-100 "
                  } flex-shrink-0`}
                >
                  <span className="text-lg font-semibold">
                    {message.sender.charAt(0)}
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
                      {message.subject}
                    </h3>

                    {message.replyCount > 0 && (
                      <Badge className="bg-company-blue-600 hover:bg-company-blue-700 text-white">
                        <MessageSquare className="h-3 w-3 mr-1" />
                        {message.replyCount}
                      </Badge>
                    )}

                    {!message.read && (
                      <Badge className="bg-company-blue-600 text-white">
                        Nova
                      </Badge>
                    )}
                  </div>
                  <span className="text-xs text-gray-500 whitespace-nowrap ml-2">
                    {new Date(message.date).toLocaleDateString("pt-BR")}
                  </span>
                </div>
                <p
                  className={`text-sm ${
                    !message.read ? "text-gray-800" : "text-gray-600"
                  } truncate mt-1`}
                >
                  {message.preview}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  De: {message.sender}
                </p>
              </Link>

              <div className="flex items-center gap-1 flex-shrink-0">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={(e) => toggleStar(message.id, e)}
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
                  onClick={(e) =>
                    message.read
                      ? markAsUnread(message.id, e)
                      : markAsRead(message.id, e)
                  }
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

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreHorizontal className="h-4 w-4 text-gray-400" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      onClick={(e) =>
                        message.read
                          ? markAsUnread(message.id, e)
                          : markAsRead(message.id, e)
                      }
                    >
                      Marcar como {message.read ? "não lida" : "lida"}
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={(e) => toggleStar(message.id, e)}
                    >
                      {message.starred
                        ? "Remover destaque"
                        : "Destacar mensagem"}
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      {/* <Link href={`/mensagens/${message.id}`}>Responder</Link> */}
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      {/* <Link href={`/mensagens/encaminhar/${message.id}`}>
                        Encaminhar
                      </Link> */}
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={(e) => openDeleteDialog(message.id, e)}
                    >
                      Excluir mensagem
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
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
              {messageToDelete ? getMessageSubject(messageToDelete) : ""}&quot;?
              Esta ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="sm:justify-between">
            <Button variant="outline" onClick={cancelDelete}>
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
                className="text-[#002856] border border-[#002856] hover:bg-gray-200 "
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
