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

// Interface para o tipo de anexo
interface Attachment {
  id: string;
  name: string;
  type: string;
  size: number;
  url: string;
}

// Interface para o tipo de arquivo de anexo
interface AttachmentFile {
  id: string;
  name: string;
  size: number;
  type: string;
  file: File;
}

// Interface para o tipo de mensagem
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

// Dados simulados de uma conversa
const getConversation = (id: string): Message[] => {
  // Esta é uma conversa simulada
  if (id === "1") {
    return [
      {
        id: "1-1",
        sender: "Atendimento Aliança",
        senderEmail: "atendimento@alianca.com",
        recipient: "Você",
        recipientEmail: "cliente@email.com",
        subject: "Confirmação de pagamento",
        content: `
          <p>Prezado(a) Cliente,</p>
          <p>Temos o prazer de confirmar que seu pagamento da apólice #12345 foi processado com sucesso em nosso sistema.</p>
          <p>Detalhes do pagamento:</p>
          <ul>
            <li>Número da apólice: #12345</li>
            <li>Valor pago: R$ 450,00</li>
            <li>Data do pagamento: 15/05/2023</li>
            <li>Método de pagamento: Cartão de crédito</li>
          </ul>
          <p>Seu comprovante de pagamento está disponível para download na área "Pagamentos" do seu perfil.</p>
          <p>Agradecemos sua confiança em nossos serviços.</p>
          <p>Atenciosamente,<br>Equipe de Atendimento Aliança Seguros</p>
        `,
        date: "2023-05-15T10:30:00",
        read: true,
        isFromMe: false,
        attachments: [
          {
            id: "att-1",
            name: "comprovante_pagamento.pdf",
            type: "application/pdf",
            size: 1024 * 1024 * 2.5, // 2.5 MB
            url: "/pdf-document.png",
          },
        ],
      },
      {
        id: "1-2",
        sender: "Você",
        senderEmail: "cliente@email.com",
        recipient: "Atendimento Aliança",
        recipientEmail: "atendimento@alianca.com",
        subject: "Re: Confirmação de pagamento",
        content: `
          <p>Olá,</p>
          <p>Obrigado pela confirmação. No entanto, notei que o valor pago está diferente do que constava na fatura. Deveria ser R$ 420,00, não R$ 450,00.</p>
          <p>Poderiam verificar essa diferença, por favor?</p>
          <p>Atenciosamente,<br>Cliente</p>
        `,
        date: "2023-05-15T11:45:00",
        read: true,
        isFromMe: true,
        attachments: [
          {
            id: "att-2",
            name: "fatura_original.jpg",
            type: "image/jpeg",
            size: 1024 * 1024 * 1.8, // 1.8 MB
            url: "/placeholder.svg?key=s4r5a",
          },
        ],
      },
      {
        id: "1-3",
        sender: "Atendimento Aliança",
        senderEmail: "atendimento@alianca.com",
        recipient: "Você",
        recipientEmail: "cliente@email.com",
        subject: "Re: Confirmação de pagamento",
        content: `
          <p>Prezado(a) Cliente,</p>
          <p>Agradecemos pelo contato e pela atenção aos detalhes.</p>
          <p>Após verificação, confirmamos que houve um equívoco no valor informado. O valor correto é de R$ 420,00 conforme você mencionou.</p>
          <p>A diferença de R$ 30,00 será creditada em sua próxima fatura ou poderá ser reembolsada, conforme sua preferência.</p>
          <p>Pedimos desculpas pelo inconveniente causado.</p>
          <p>Atenciosamente,<br>Equipe de Atendimento Aliança Seguros</p>
        `,
        date: "2023-05-15T14:20:00",
        read: true,
        isFromMe: false,
        attachments: [
          {
            id: "att-3",
            name: "comprovante_corrigido.pdf",
            type: "application/pdf",
            size: 1024 * 1024 * 1.2, // 1.2 MB
            url: "/placeholder.svg?key=jvjtx",
          },
        ],
      },
    ];
  }

  // Para outras IDs, retornar uma conversa vazia ou com apenas uma mensagem
  return [
    {
      id: `${id}-1`,
      sender: "Departamento de Sinistros",
      senderEmail: "sinistros@alianca.com",
      recipient: "Você",
      recipientEmail: "cliente@email.com",
      subject: "Atualização do seu sinistro",
      content: `
        <p>Prezado(a) Cliente,</p>
        <p>Gostaríamos de informar que seu sinistro #78901 foi analisado e aprovado pela nossa equipe técnica.</p>
        <p>Os próximos passos são:</p>
        <ol>
          <li>Nossa equipe de peritos entrará em contato em até 48 horas para agendar uma vistoria.</li>
          <li>Após a vistoria, o orçamento será aprovado em até 24 horas.</li>
          <li>O reparo poderá ser iniciado imediatamente após a aprovação do orçamento.</li>
        </ol>
        <p>Para mais detalhes, acesse a área "Sinistros" do seu perfil ou entre em contato com nosso atendimento.</p>
        <p>Atenciosamente,<br>Departamento de Sinistros<br>Aliança Seguros</p>
      `,
      date: "2023-05-10T14:45:00",
      read: true,
      isFromMe: false,
    },
  ];
};

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
  console.log("Mensagem id:", id);
  const router = useRouter();
  const [conversation, setConversation] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isReplying, setIsReplying] = useState(false);

  useEffect(() => {
    setConversation(getConversation(id));
  }, [id]);

  // Se não houver conversa, redirecionar para a página de mensagens
  if (conversation.length === 0) {
    return null;
  }

  const firstMessage = conversation[0];
  const subject = firstMessage.subject;

  // Função para lidar com a resposta
  const handleReply = (content: string, attachments: AttachmentFile[]) => {
    setIsLoading(true);

    // Criar uma nova mensagem com a resposta
    const newMessage: Message = {
      id: `${id}-${conversation.length + 1}`,
      sender: "Você",
      senderEmail: "cliente@email.com",
      recipient: firstMessage.sender,
      recipientEmail: firstMessage.senderEmail,
      subject: `Re: ${
        subject.startsWith("Re:") ? subject.substring(4).trim() : subject
      }`,
      content: `<p>${content.replace(/\n/g, "<br/>")}</p>`,
      date: new Date().toISOString(),
      read: true,
      isFromMe: true,
      attachments:
        attachments.length > 0
          ? attachments.map((att) => ({
              id: att.id,
              name: att.name,
              type: att.type,
              size: att.size,
              url: URL.createObjectURL(att.file), // Criar URL temporária para o arquivo
            }))
          : undefined,
    };

    // Simular envio da resposta
    setTimeout(() => {
      setConversation([...conversation, newMessage]);
      setIsLoading(false);
      setIsReplying(false);

      toast({
        title: "Resposta enviada",
        description: "Sua resposta foi enviada com sucesso.",
      });
    }, 1500);
  };

  // Função para lidar com a exclusão da mensagem
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

        <div className="flex gap-2">
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
        </div>
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
