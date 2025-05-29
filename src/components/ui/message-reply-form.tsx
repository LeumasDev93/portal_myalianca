"use client";

import type React from "react";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  PaperclipIcon,
  Send,
  X,
  FileIcon,
  ImageIcon,
  FileTextIcon,
} from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { Progress } from "./progress";

interface MessageReplyFormProps {
  onReply: (content: string, attachments: AttachmentFile[]) => void;
  isLoading?: boolean;
}

interface AttachmentFile {
  id: string;
  name: string;
  size: number;
  type: string;
  file: File;
}

// Interface para os anexos em progresso
interface Attachment extends AttachmentFile {
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

export function MessageReplyForm({
  onReply,
  isLoading = false,
}: MessageReplyFormProps) {
  const [replyContent, setReplyContent] = useState("");
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAttach = () => {
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
      description: "O arquivo foi removido da resposta.",
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Verificar se tem conteúdo na resposta
    if (!replyContent.trim()) {
      toast({
        title: "Resposta vazia",
        description: "Por favor, escreva uma resposta antes de enviar.",
        variant: "destructive",
      });
      return;
    }

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

    // Convertendo para o formato esperado pela função onReply
    const finalAttachments = attachments.map(
      ({ id, name, size, type, file }) => ({
        id,
        name,
        size,
        type,
        file,
      })
    );

    // Chamar a função de callback com o conteúdo da resposta e anexos
    onReply(replyContent, finalAttachments);

    // Limpar o campo de resposta e anexos após o envio
    setReplyContent("");
    setAttachments([]);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col space-y-4 bg-white p-4 border rounded-lg"
    >
      <Textarea
        value={replyContent}
        onChange={(e) => setReplyContent(e.target.value)}
        placeholder="Escreva sua resposta..."
        className="min-h-24 w-full"
      />

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
          <p className="text-sm font-medium">Anexos:</p>
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
                  <Progress value={attachment.progress} className="h-1 mt-1" />
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

      <div className="flex justify-between">
        <Button
          type="button"
          variant="outline"
          onClick={handleAttach}
          className="flex items-center gap-2"
        >
          <PaperclipIcon className="h-4 w-4" />
          Anexar arquivo
        </Button>
        <Button
          type="submit"
          disabled={isLoading}
          className="flex items-center gap-2 bg-company-blue-600 hover:bg-company-blue-700"
        >
          {isLoading ? (
            "Enviando..."
          ) : (
            <>
              <Send className="h-4 w-4" />
              Responder
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
