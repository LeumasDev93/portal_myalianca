/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect, useRef } from "react";
import { PageTitle } from "@/components/ui/page-title";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Reply, Forward, Trash2, Send } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  MessageReplyForm,
  MessageReplyFormRef,
} from "@/components/ui/message-reply-form";
import { MessageAttachment } from "@/components/ui/message-attachment";
import { toast } from "@/components/ui/use-toast";
import { useRouter } from "next/navigation";
import { useUserProfile } from "@/hooks/useUserProfile ";
import { useUnreadMessages } from "@/contexts/unread-messages-context";
import { LoadingContainer } from "@/components/ui/loading-container";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { useMessageActivity } from "@/lib/activityExamples";

interface Attachment {
  id: string;
  name: string;
  type: string;
  size: number;
  url: string;
}

interface Message {
  id: string;
  sender: string;
  senderEmail: string;
  recipient: string;
  recipientEmail: string;
  subject: string;
  content: string;
  date: string;
  read: boolean;
  isFromMe: boolean;
  attachments?: Attachment[];
}

export interface AttachmentFile {
  id: string;
  name: string;
  size: number;
  type: string;
  file: File;
}

type MensagemDetailPageProps = {
  id: string;
  onSelectDetail: (id: string) => void;
  onBack: () => void;
};

export default function MensagemDetailPage({
  id,
  onSelectDetail,
  onBack,
}: MensagemDetailPageProps) {
  const router = useRouter();
  const { registerMessageRepliedActivity } = useMessageActivity();
  const [conversation, setConversation] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSendingReply, setIsSendingReply] = useState(false);
  const { profile } = useUserProfile();
  const { markMessageAsRead } = useUnreadMessages();
  const replyFormRef = useRef<MessageReplyFormRef>(null);

  const userId = profile?.user.id || "";

  // Formata o tempo relativo (ex: "há 3 min", "há 2 h")
  const formatTimeAgo = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffMs = now.getTime() - date.getTime();
    const diffSec = Math.floor(diffMs / 1000);
    if (diffSec < 5) return "agora";
    if (diffSec < 60) return `há ${diffSec}s`;
    const diffMin = Math.floor(diffSec / 60);
    if (diffMin < 60) return `há ${diffMin} min`;
    const diffH = Math.floor(diffMin / 60);
    if (diffH < 24) return `há ${diffH} h`;
    const diffD = Math.floor(diffH / 24);
    if (diffD < 7) return `há ${diffD} d`;
    const diffW = Math.floor(diffD / 7);
    if (diffW < 4) return `há ${diffW} sem`;
    const diffM = Math.floor(diffD / 30);
    if (diffM < 12) return `há ${diffM} m`;
    const diffY = Math.floor(diffD / 365);
    return `há ${diffY} a`;
  };

  // Função para transformar a resposta da API no formato do state
  const mapThreadToMessages = async (thread: any): Promise<Message[]> => {
    if (!thread?.mensagens) return [];

    const messages = await Promise.all(
      thread.mensagens.map(async (msg: any) => {
        // Criar anexos diretamente com URLs da API
        let attachments: Attachment[] = [];
        if (msg.file_list_ids && msg.file_list_ids.length > 0) {
          const apiBaseUrl =
            process.env.NEXT_PUBLIC_API_BASE_URL_DEFAULT ||
            "https://api.aliancaseguros.cv";

          attachments = msg.file_list_ids.map((fid: string) => ({
            id: fid,
            name: fid, // Usar ID como nome por enquanto
            type: "",
            size: 0,
            url: `${apiBaseUrl}/files/1.0.0/download/${fid}`,
          }));
        }

        return {
          id: msg.id,
          sender: msg.nome,
          senderEmail: "",
          recipient: thread.nome_cliente || "",
          recipientEmail: "",
          subject: thread.assunto || "",
          content: msg.conteudo,
          date: msg.data_envio,
          read: msg.lida_cliente || msg.lida_colaborador,
          isFromMe: msg.user_id === userId,
          attachments,
        };
      })
    );

    return messages;
  };

  const fetchConversation = async (showLoading = true) => {
    if (showLoading) setIsLoading(true);
    try {
      const res = await fetch(
        `/api/menssage/threads?thread_id=${id}&user_id=${userId}`
      );
      if (!res.ok) throw new Error("Erro ao carregar conversa");
      const data = await res.json();
      const thread = data.results;
      const messages = await mapThreadToMessages(thread);
      setConversation(messages);
    } catch (error) {
      console.error(error);
      if (showLoading) {
        toast({
          title: "Erro",
          description: "Não foi possível carregar a conversa.",
          variant: "destructive",
        });
      }
    } finally {
      if (showLoading) setIsLoading(false);
    }
  };

  useEffect(() => {
    if (userId) fetchConversation();
  }, [id, userId]);

  // Atualizar mensagens quando a tela recebe foco (sem loading)
  useEffect(() => {
    const handleFocus = () => {
      if (userId) {
        fetchConversation(false); // false = sem loading
      }
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [userId]);

  // Atualização automática silenciosa a cada 10 segundos
  useEffect(() => {
    if (!userId) return;

    const interval = setInterval(() => {
      fetchConversation(false); // Atualização silenciosa
    }, 10000); // 10 segundos

    return () => clearInterval(interval);
  }, [userId]);

  if (isLoading) {
    return (
      <div className="container mx-auto py-6">
        <div className="flex items-center justify-between mb-6">
          <Button
            onClick={onBack}
            variant="outline"
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar para mensagens
          </Button>
        </div>

        <div className="w-full h-full p-6 flex items-center justify-center">
          <LoadingContainer message="CARREGANDO DETALHES DA MENSAGEM..." />
        </div>
      </div>
    );
  }

  if (conversation.length === 0) {
    return (
      <p className="text-center text-gray-500">Nenhuma mensagem encontrada</p>
    );
  }

  const firstMessage = conversation[0];
  const subject = firstMessage.subject;

  // Responder mensagem via API
  const handleReply = async (
    content: string,
    attachments: AttachmentFile[]
  ) => {
    setIsSendingReply(true);
    try {
      const fileListIds = attachments.map((a) => a.id);
      console.log("Enviando resposta com anexos:", attachments);
      console.log("IDs dos anexos:", fileListIds);

      const res = await fetch(`/api/menssage/${id}/responder`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          conteudo: content,
          user_id: userId,
          file_list_ids: fileListIds,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => null);
        throw new Error(errorData?.message || "Erro ao enviar resposta");
      }

      // Atualização otimista na UI
      const now = new Date().toISOString();
      setConversation((prev) => [
        ...prev,
        {
          id: `temp-${Date.now()}`,
          sender: profile?.user?.nome || "Você",
          senderEmail: "",
          recipient: "",
          recipientEmail: "",
          subject: subject,
          content,
          date: now,
          read: true,
          isFromMe: true,
          attachments: attachments.map((a) => ({
            id: a.id,
            name: a.name,
            type: a.type,
            size: a.size,
            url: `/api/files/${a.id}`,
          })),
        },
      ]);

      toast({
        title: "Resposta enviada",
        description: "Sua resposta foi enviada com sucesso.",
        variant: "success",
      });

      // Registrar atividade de resposta
      try {
        await registerMessageRepliedActivity("Resposta", subject);
      } catch (error) {
        console.error("Erro ao registrar atividade de resposta:", error);
        // Não interrompe o fluxo se falhar ao registrar atividade
      }

      // Marcar a mensagem como lida quando o usuário responde
      markMessageAsRead(id);

      // Recarregar conversa com mapeamento (sincronização) - sem loading
      await fetchConversation(false);
      // Forçar atualização de dados do App Router
      router.refresh();
    } catch (error) {
      console.error(error);
      toast({
        title: "Erro",
        description:
          error instanceof Error
            ? error.message
            : "Não foi possível enviar a resposta.",
        variant: "destructive",
      });
    } finally {
      setIsSendingReply(false);
    }
  };

  const handleDelete = () => {
    if (confirm("Tem certeza que deseja excluir esta conversa?")) {
      toast({
        title: "Conversa excluída",
        description: "A conversa foi excluída com sucesso.",
      });
      router.back();
    }
  };

  return (
    <div className="max-w-7xl mx-auto sm:px-4 md:px-6 py-4 sm:py-6 ">
      <div className="flex items-center mb-4 sm:mb-6">
        <Button
          onClick={onBack}
          variant="outline"
          className="flex items-center gap-2 text-[#002856] w-full sm:w-auto"
        >
          <ArrowLeft className="h-4 w-4" />
          <span className="text-sm sm:text-base">Voltar para mensagens</span>
        </Button>

        {/* <div className="flex gap-2">
          <Button
            onClick={() => onSelectDetail(id)}
            variant="outline"
            className="flex items-center gap-2"
          >
            <Forward className="h-4 w-4" />
            <span className="hidden sm:inline">Encaminhar</span>
          </Button>
          <Button
            variant="outline"
            className="flex items-center gap-2 text-red-500"
            onClick={handleDelete}
          >
            <Trash2 className="h-4 w-4" />
            <span className="hidden sm:inline">Excluir</span>
          </Button>
        </div> */}
      </div>

      <PageTitle
        title={subject}
        description={`Conversa com ${firstMessage.sender}`}
      />

      <div className="mt-4 sm:mt-6 max-w-4xl mx-auto px-4">
        {conversation.map((message, index) => (
          <div
            key={message.id}
            className={`flex ${
              message.isFromMe ? "justify-end" : "justify-start"
            } mb-4`}
          >
            <div
              className={`max-w-[70%] rounded-2xl px-4 py-3 ${
                message.isFromMe 
                  ? "bg-[#DCF8C6] rounded-br-md" 
                  : "bg-white border border-gray-200 rounded-bl-md"
              }`}
            >
            <div className="flex items-start gap-2 mb-2">
              <Avatar
                className={`w-6 h-6 ${
                  message.isFromMe ? "bg-blue-600" : "bg-gray-700"
                }`}
              >
                {message.isFromMe && profile?.user?.imagem_id ? (
                  <AvatarImage
                    src={`/api/proxy-image?url=${encodeURIComponent(
                      `${process.env.NEXT_PUBLIC_API_BASE_URL_IMAGE}/${profile.user.imagem_id}`
                    )}`}
                    alt={profile?.user?.nome || "Você"}
                    className="rounded-full"
                  />
                ) : null}
                <AvatarFallback className="text-gray-700 text-xs border border-gray-200 rounded-full">
                  {message.isFromMe
                    ? profile?.user?.nome?.charAt(0) || "V"
                    : message.sender?.charAt(0) || "U"}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="font-medium text-sm text-gray-700 mb-1">
                  {message.isFromMe ? "Você" : message.sender || "Usuário"}
                </div>
                <div className="text-xs text-gray-500">
                  {formatTimeAgo(message.date)}
                </div>
              </div>
            </div>

            <div className="mb-2">
              <div
                className="text-sm leading-relaxed"
                dangerouslySetInnerHTML={{ __html: message.content }}
              />
            </div>

            {message.attachments && message.attachments.length > 0 && (
              <div className="mb-2">
                <div className="grid grid-cols-1 gap-2">
                  {message.attachments.map((attachment) => (
                    <MessageAttachment
                      key={attachment.id}
                      name={attachment.name}
                      type={attachment.type}
                      size={attachment.size}
                      url={attachment.url}
                    />
                  ))}
                </div>
              </div>
            )}

            </div>
          </div>
        ))}

        <div className="mt-4 sm:mt-6 max-w-4xl mx-auto">
          <h3 className="text-base sm:text-lg font-medium mb-2 sm:mb-3">
            Sua resposta
          </h3>
          <MessageReplyForm
            ref={replyFormRef}
            onReply={handleReply}
            isLoading={isSendingReply}
          />
        </div>
      </div>
    </div>
  );
}
