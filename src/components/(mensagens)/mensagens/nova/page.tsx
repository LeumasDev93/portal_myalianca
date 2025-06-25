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
import { Progress } from "@/components/ui/progress";

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

    // Verificar se todos os anexos terminaram o upload
    const allUploaded = attachments.every((att) => att.progress === 100);
    if (!allUploaded) {
      toast({
        title: "Aguarde o upload",
        description: "Alguns anexos ainda estão sendo carregados.",
        variant: "destructive",
      });
      return;
    }

    // Validação básica
    if (!formData.to || !formData.subject || !formData.message) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, preencha todos os campos obrigatórios.",
        variant: "destructive",
      });
      return;
    }

    setSending(true);

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
    <div className="container mx-auto py-6">
      <div className="flex items-center justify-between mb-6">
        <Link href="/mensagens">
          <Button variant="outline" className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Voltar para mensagens
          </Button>
        </Link>
      </div>

      <PageTitle title="Nova Mensagem" description="Envie uma nova mensagem" />

      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="text-xl">Compor Mensagem</CardTitle>
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
                placeholder="Assunto da mensagem"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="message">Mensagem:</Label>
              <Textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleChange}
                placeholder="Escreva sua mensagem aqui..."
                className="min-h-32"
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
              className="flex items-center gap-2 bg-company-blue-600 hover:bg-company-blue-700"
            >
              {sending ? (
                "Enviando..."
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  Enviar
                </>
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
