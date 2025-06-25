"use client";

import type React from "react";

import { useState, useEffect, useRef } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  Send,
  PaperclipIcon,
  X,
  FileIcon,
  ImageIcon,
  FileTextIcon,
} from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/use-toast";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { PageTitle } from "@/components/ui/page-title";

// Sample data for a specific message
const getMessage = (id: string) => {
  const messages = {
    "1": {
      id: "1",
      sender: "Atendimento Aliança",
      email: "atendimento@alianca.com",
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
    },
    "2": {
      id: "2",
      sender: "Departamento de Sinistros",
      email: "sinistros@alianca.com",
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
      read: false,
    },
    "3": {
      id: "3",
      sender: "Equipe de Renovação",
      email: "renovacao@alianca.com",
      subject: "Sua apólice está prestes a vencer",
      content: `
        <p>Prezado(a) Cliente,</p>
        <p>Gostaríamos de lembrá-lo que sua apólice de seguro auto vence em 15 dias.</p>
        <p>Para garantir a continuidade da sua proteção, recomendamos a renovação antecipada. Renovando agora, você garante:</p>
        <ul>
          <li>Desconto de 10% na renovação</li>
          <li>Manutenção das mesmas coberturas</li>
          <li>Continuidade da proteção sem períodos descobertos</li>
        </ul>
        <p>Para renovar, acesse a área "Apólices" do seu perfil ou clique no botão abaixo:</p>
        <p><a href="/apolices/renovar">Renovar minha apólice</a></p>
        <p>Estamos à disposição para esclarecer qualquer dúvida.</p>
        <p>Atenciosamente,<br>Equipe de Renovação<br>Aliança Seguros</p>
      `,
      date: "2023-05-05T09:15:00",
      read: true,
    },
  };

  return messages[id as keyof typeof messages] || null;
};

// Interface para os anexos
interface Attachment {
  id: string;
  name: string;
  size: number;
  type: string;
  file: File;
  progress: number;
}

// Função para formatar o tamanho do arquivo
const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return (
    Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  );
};

// Função para obter o ícone apropriado para o tipo de arquivo
const getFileIcon = (type: string) => {
  if (type.startsWith("image/")) {
    return <ImageIcon className="h-4 w-4" />;
  } else if (type.includes("pdf") || type.includes("document")) {
    return <FileTextIcon className="h-4 w-4" />;
  } else {
    return <FileIcon className="h-4 w-4" />;
  }
};

type MensagemEncaminharPageProps = {
  id: string;
  onBack: () => void;
};
export default function EncaminharMensagemPage({
  id,
  onBack,
}: MensagemEncaminharPageProps) {
  const router = useRouter();
  const message = getMessage(id);
  const [sending, setSending] = useState(false);
  const [formData, setFormData] = useState({
    to: "",
    subject: message ? `Enc: ${message.subject}` : "",
    additionalMessage: "",
  });
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!message) {
      toast({
        title: "Mensagem não encontrada",
        description: "A mensagem solicitada não foi encontrada.",
        variant: "destructive",
      });
      router.back();
    }
  }, [message, router]);

  if (!message) {
    return null;
  }

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileInputClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const newAttachments: Attachment[] = [];

    Array.from(files).forEach((file) => {
      // Verificar tamanho (limite de 10MB por arquivo)
      if (file.size > 10 * 1024 * 1024) {
        toast({
          title: "Arquivo muito grande",
          description: `O arquivo ${file.name} excede o limite de 10MB.`,
          variant: "destructive",
        });
        return;
      }

      // Adicionar o novo anexo
      newAttachments.push({
        id: `${Date.now()}-${file.name}`,
        name: file.name,
        size: file.size,
        type: file.type,
        file: file,
        progress: 0,
      });
    });

    if (newAttachments.length > 0) {
      setAttachments((prev) => [...prev, ...newAttachments]);

      // Simular upload dos arquivos
      simulateUpload(newAttachments);
    }

    // Limpar o input para permitir selecionar o mesmo arquivo novamente
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const simulateUpload = (newAttachments: Attachment[]) => {
    // Simulação de upload com progresso
    newAttachments.forEach((attachment) => {
      const intervalId = setInterval(() => {
        setAttachments((prevAttachments) => {
          const updatedAttachments = prevAttachments.map((att) => {
            if (att.id === attachment.id) {
              const newProgress = Math.min(att.progress + 10, 100);

              // Se chegou a 100%, limpar o intervalo
              if (newProgress === 100) {
                clearInterval(intervalId);
              }

              return { ...att, progress: newProgress };
            }
            return att;
          });

          return updatedAttachments;
        });
      }, 300); // Aumentar a cada 300ms para simular upload
    });
  };

  const handleRemoveAttachment = (id: string) => {
    setAttachments(attachments.filter((a) => a.id !== id));
    toast({
      title: "Anexo removido",
      description: "O arquivo foi removido da mensagem.",
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validação básica
    if (!formData.to) {
      toast({
        title: "Destinatário obrigatório",
        description: "Por favor, informe o destinatário da mensagem.",
        variant: "destructive",
      });
      return;
    }

    // Verificar se todos os anexos terminaram o upload
    const allUploaded = attachments.every((att) => att.progress === 100);
    if (!allUploaded && attachments.length > 0) {
      toast({
        title: "Aguarde o upload",
        description: "Alguns anexos ainda estão sendo carregados.",
        variant: "destructive",
      });
      return;
    }

    setSending(true);

    // Simulação de envio
    setTimeout(() => {
      setSending(false);
      toast({
        title: "Mensagem encaminhada",
        description: `Sua mensagem foi encaminhada com sucesso com ${attachments.length} anexo(s).`,
      });
      router.push("/mensagens");
    }, 1500);
  };

  const originalContent = `
    <div style="padding: 16px; border-left: 4px solid #ccc; margin-top: 16px;">
      <p><strong>De:</strong> ${message.sender} &lt;${message.email}&gt;</p>
      <p><strong>Data:</strong> ${new Date(message.date).toLocaleString(
        "pt-BR"
      )}</p>
      <p><strong>Assunto:</strong> ${message.subject}</p>
      <hr />
      ${message.content}
    </div>
  `;

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

      <PageTitle
        title="Encaminhar Mensagem"
        description="Encaminhe esta mensagem para outro destinatário"
      />

      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="text-xl">
            Encaminhar: {message.subject}
          </CardTitle>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="to">Para:</Label>
              <Input
                id="to"
                name="to"
                value={formData.to}
                onChange={handleChange}
                placeholder="email@destinatario.com"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="subject">Assunto:</Label>
              <Input
                id="subject"
                name="subject"
                value={formData.subject}
                onChange={handleChange}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="additionalMessage">Mensagem adicional:</Label>
              <Textarea
                id="additionalMessage"
                name="additionalMessage"
                value={formData.additionalMessage}
                onChange={handleChange}
                placeholder="Adicione uma mensagem (opcional)..."
                className="min-h-20"
              />
            </div>

            {/* Input de arquivo oculto */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden"
              multiple
              accept="image/*,application/pdf,.doc,.docx,.xls,.xlsx,.txt"
            />

            {/* Lista de anexos */}
            {attachments.length > 0 && (
              <div className="space-y-2">
                <Label>Anexos:</Label>
                <div className="space-y-2">
                  {attachments.map((attachment) => (
                    <div
                      key={attachment.id}
                      className="flex items-center p-3 bg-gray-50 rounded border"
                    >
                      <div className="mr-3">{getFileIcon(attachment.type)}</div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <div className="font-medium text-sm truncate max-w-[200px]">
                            {attachment.name}
                          </div>
                          <div className="text-xs text-gray-500">
                            {formatFileSize(attachment.size)}
                          </div>
                        </div>
                        <Progress
                          value={attachment.progress}
                          className="h-1 mt-1"
                        />
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="ml-2"
                        onClick={() => handleRemoveAttachment(attachment.id)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="space-y-2 mb-6">
              <Label>Mensagem original:</Label>
              <div
                className="p-4 border rounded bg-gray-50 text-sm"
                dangerouslySetInnerHTML={{ __html: originalContent }}
              />
            </div>
          </CardContent>

          <CardFooter className="flex justify-between">
            <Button
              type="button"
              variant="outline"
              className="flex items-center gap-2"
              onClick={handleFileInputClick}
            >
              <PaperclipIcon className="h-4 w-4" />
              Anexar arquivo
            </Button>

            <Button
              type="submit"
              disabled={sending}
              className="flex items-center gap-2 bg-[#002856] hover:bg-[#002856]/50"
            >
              {sending ? (
                "Enviando..."
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  Encaminhar
                </>
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
