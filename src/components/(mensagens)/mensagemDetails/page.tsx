/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import { PageTitle } from "@/components/ui/page-title";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Reply, Forward, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { MessageReplyForm } from "@/components/ui/message-reply-form";
import { MessageAttachment } from "@/components/ui/message-attachment";
import { toast } from "@/components/ui/use-toast";
import { useRouter } from "next/navigation";
import { useUserProfile } from "@/hooks/useUserProfile ";

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
  const [conversation, setConversation] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isReplying, setIsReplying] = useState(false);
  const { profile } = useUserProfile();

  const userId = profile?.user.id || "";

  // Função para transformar a resposta da API no formato do state
  const mapThreadToMessages = (thread: any): Message[] => {
    if (!thread?.mensagens) return [];
    return thread.mensagens.map((msg: any) => ({
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
      attachments: (msg.file_list_ids || []).map((fid: string) => ({
        id: fid,
        name: fid,
        type: "",
        size: 0,
        url: `/api/files/${fid}`,
      })),
    }));
  };

  const fetchConversation = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(
        `/api/menssage/threads?thread_id=${id}&user_id=${userId}`
      );
      if (!res.ok) throw new Error("Erro ao carregar conversa");
      const data = await res.json();
      const thread = data.results;
      setConversation(mapThreadToMessages(thread));
    } catch (error) {
      console.error(error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar a conversa.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (userId) fetchConversation();
  }, [id, userId]);

  if (conversation.length === 0) {
    return (
      <p className="text-center text-gray-500">Nenhuma mensagem encontrada</p>
    );
  }

  const firstMessage = conversation[0];
  const subject = firstMessage.subject;

  // Responder mensagem via API interna
  const handleReply = async (
    content: string,
    attachments: AttachmentFile[]
  ) => {
    setIsLoading(true);
    try {
      const fileListIds = attachments.map((a) => a.id);
      const res = await fetch(`/api/menssage/${id}/reply`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          conteudo: content,
          user_id: userId,
          file_list_ids: fileListIds,
        }),
      });
      if (!res.ok) throw new Error("Erro ao enviar resposta");

      toast({
        title: "Resposta enviada",
        description: "Sua resposta foi enviada com sucesso.",
      });

      // Recarregar conversa com mapeamento
      await fetchConversation();
      setIsReplying(false);
    } catch (error) {
      console.error(error);
      toast({
        title: "Erro",
        description: "Não foi possível enviar a resposta.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
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

      <div className="space-y-6 mt-6">
        {conversation.map((message, index) => (
          <Card
            key={message.id}
            className={`p-5 ${message.isFromMe ? "bg-blue-50" : "bg-white"}`}
          >
            <div className="flex justify-between mb-4">
              <div className="flex items-center gap-3">
                <Avatar
                  className={`${
                    message.isFromMe ? "bg-blue-600" : "bg-gray-700"
                  }`}
                >
                  {message.sender.charAt(0)}
                </Avatar>
                <div>
                  <div className="font-semibold">
                    {message.sender}
                    {message.isFromMe && (
                      <Badge className="ml-2 bg-blue-600">Você</Badge>
                    )}
                  </div>
                  <div className="text-sm text-gray-500">
                    {message.senderEmail}
                  </div>
                </div>
              </div>
              <div className="text-sm text-gray-500">
                {new Date(message.date).toLocaleString("pt-BR")}
              </div>
            </div>

            <div className="mb-4">
              <div
                className="prose prose-blue max-w-none"
                dangerouslySetInnerHTML={{ __html: message.content }}
              />
            </div>

            {message.attachments && message.attachments.length > 0 && (
              <div className="mb-4">
                <p className="text-sm font-medium mb-2">Anexos:</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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

            {index === conversation.length - 1 &&
              !isReplying &&
              !message.isFromMe && (
                <div className="mt-4">
                  <Button
                    onClick={() => setIsReplying(true)}
                    className="flex items-center gap-2"
                  >
                    <Reply className="h-4 w-4" />
                    Responder
                  </Button>
                </div>
              )}
          </Card>
        ))}

        {isReplying && (
          <div className="mt-4">
            <h3 className="text-lg font-medium mb-2">Sua resposta</h3>
            <MessageReplyForm onReply={handleReply} isLoading={isLoading} />
          </div>
        )}
      </div>
    </div>
  );
}
