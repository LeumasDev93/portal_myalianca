"use client";

import type React from "react";

import { useState, useRef } from "react";
import { PageTitle } from "@/components/ui/page-title";
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
import Link from "next/link";
import { toast } from "@/components/ui/use-toast";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useMessageActivity } from "@/lib/activityExamples";
import { useActivities } from "@/hooks/useActivities";

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

export default function NovaMensagemPage() {
  const router = useRouter();
  const { registerMessageSentActivity } = useMessageActivity();
  const { registerActivity } = useActivities();
  const [sending, setSending] = useState(false);
  const [formData, setFormData] = useState({
    to: "",
    subject: "",
    message: "",
  });
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
    if (
      !formData.to.trim() ||
      !formData.subject.trim() ||
      !formData.message.trim()
    ) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, preencha todos os campos obrigatórios.",
        variant: "destructive",
      });
      return;
    }

    console.log("✅ Validação passou - iniciando envio");
    setSending(true);

    // Registrar atividade de mensagem enviada ANTES da simulação
    console.log("🔄 Registrando atividade de mensagem enviada...");
    console.log("📧 Tipo:", "Nova");
    console.log("📝 Assunto:", formData.subject);
    console.log(
      "📧 registerMessageSentActivity disponível:",
      !!registerMessageSentActivity
    );

    // Executar registro de atividade de forma síncrona
    registerMessageSentActivity("Nova", formData.subject)
      .then(() => {
        console.log("✅ Atividade de mensagem enviada registrada com sucesso!");
      })
      .catch((error) => {
        console.error(
          "❌ Erro ao registrar atividade de mensagem enviada:",
          error
        );
        // Fallback: tentar registrar diretamente
        console.log("🔄 Tentando fallback com registerActivity direto...");
        registerActivity({
          action: "MENSAGEM_ENVIADA",
          description: `Mensagem Nova enviada - ${formData.subject}`,
        })
          .then(() => {
            console.log("✅ Fallback: Atividade registrada com sucesso!");
          })
          .catch((fallbackError) => {
            console.error("❌ Fallback também falhou:", fallbackError);
          });
      });

    // Simulação de envio
    setTimeout(() => {
      setSending(false);

      toast({
        title: "Mensagem enviada",
        description: `Sua mensagem foi enviada com sucesso com ${attachments.length} anexo(s).`,
      });
      router.push("/mensagens");
    }, 1500);
  };

  return (
    <div className="container mx-auto px-3 sm:px-4 md:px-6 py-4 sm:py-6 max-w-4xl">
      <div className="mb-4 sm:mb-6">
        <Link
          href="/mensagens"
          className="inline-flex items-center text-sm sm:text-base text-blue-600 hover:text-blue-800 transition-colors"
        >
          <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5 mr-1 sm:mr-2" />
          Voltar para Mensagens
        </Link>
        <PageTitle title="Nova Mensagem" />
      </div>

      <Card className="w-full">
        <CardHeader className="px-4 sm:px-6">
          <CardTitle className="text-lg sm:text-xl md:text-2xl font-semibold text-gray-800">
            Compor Nova Mensagem
          </CardTitle>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4 sm:space-y-6 px-4 sm:px-6">
            {/* Campo Para */}
            <div className="space-y-2">
              <Label htmlFor="to" className="text-sm sm:text-base font-medium">
                Para *
              </Label>
              <Input
                id="to"
                name="to"
                type="email"
                placeholder="Digite o email do destinatário"
                value={formData.to}
                onChange={handleChange}
                className="text-sm sm:text-base"
                required
              />
            </div>

            {/* Campo Assunto */}
            <div className="space-y-2">
              <Label
                htmlFor="subject"
                className="text-sm sm:text-base font-medium"
              >
                Assunto *
              </Label>
              <Input
                id="subject"
                name="subject"
                type="text"
                placeholder="Digite o assunto da mensagem"
                value={formData.subject}
                onChange={handleChange}
                className="text-sm sm:text-base"
                required
              />
            </div>

            {/* Campo Mensagem */}
            <div className="space-y-2">
              <Label
                htmlFor="message"
                className="text-sm sm:text-base font-medium"
              >
                Mensagem *
              </Label>
              <Textarea
                id="message"
                name="message"
                placeholder="Digite sua mensagem..."
                value={formData.message}
                onChange={handleChange}
                className="min-h-[120px] sm:min-h-[150px] text-sm sm:text-base resize-none"
                required
              />
            </div>

            {/* Anexos */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-sm sm:text-base font-medium">
                  Anexos
                </Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleFileInputClick}
                  className="text-xs sm:text-sm"
                >
                  <PaperclipIcon className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                  Adicionar Arquivo
                </Button>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                multiple
                onChange={handleFileChange}
                className="hidden"
                accept="image/*,.pdf,.doc,.docx,.txt"
              />

              {/* Lista de Anexos */}
              {attachments.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs sm:text-sm text-gray-600">
                    {attachments.length} arquivo(s) anexado(s)
                  </p>
                  <div className="space-y-2">
                    {attachments.map((attachment) => (
                      <div
                        key={attachment.id}
                        className="flex items-center justify-between p-2 sm:p-3 bg-gray-50 rounded-lg"
                      >
                        <div className="flex items-center space-x-2 sm:space-x-3 flex-1 min-w-0">
                          <div className="text-gray-500">
                            {getFileIcon(attachment.type)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs sm:text-sm font-medium truncate">
                              {attachment.name}
                            </p>
                            <p className="text-xs text-gray-500">
                              {formatFileSize(attachment.size)}
                            </p>
                          </div>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveAttachment(attachment.id)}
                          className="h-6 w-6 sm:h-8 sm:w-8 p-0 text-red-500 hover:text-red-700"
                        >
                          <X className="h-3 w-3 sm:h-4 sm:w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </CardContent>

          <CardFooter className="px-4 sm:px-6 pt-4 sm:pt-6 border-t">
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push("/mensagens")}
                disabled={sending}
                className="w-full sm:w-auto order-2 sm:order-1"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={sending}
                className="w-full sm:w-auto order-1 sm:order-2"
              >
                {sending ? (
                  <>
                    <Send className="mr-2 h-4 w-4 animate-pulse" />
                    <span className="hidden sm:inline">Enviando...</span>
                    <span className="sm:hidden">Enviando</span>
                  </>
                ) : (
                  <>
                    <Send className="mr-2 h-4 w-4" />
                    <span className="hidden sm:inline">Enviar Mensagem</span>
                    <span className="sm:hidden">Enviar</span>
                  </>
                )}
              </Button>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
