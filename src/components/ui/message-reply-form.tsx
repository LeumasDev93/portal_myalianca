"use client";

import React, {
  useState,
  useRef,
  forwardRef,
  useImperativeHandle,
} from "react";
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

export type MessageReplyFormRef = {
  submit: () => void;
};

export const MessageReplyForm = forwardRef<
  MessageReplyFormRef,
  MessageReplyFormProps
>(function MessageReplyForm(
  { onReply, isLoading = false }: MessageReplyFormProps,
  ref
) {
  const [replyContent, setReplyContent] = useState("");
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  useImperativeHandle(ref, () => ({
    submit: () => {
      formRef.current?.requestSubmit();
    },
  }));

  const handleAttach = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const newAttachments: Attachment[] = [];
    const maxFiles = 5; // Máximo 5 arquivos

    // Verificar número de arquivos
    if (files.length > maxFiles) {
      toast({
        title: "Muitos arquivos",
        description: `Máximo ${maxFiles} arquivos permitidos.`,
        variant: "destructive",
      });
      return;
    }

    Array.from(files).forEach((file) => {
      // Verificar tamanho (otimizado para melhor performance)
      const maxSize = 5 * 1024 * 1024; // 5MB (reduzido para uploads mais rápidos)
      if (file.size > maxSize) {
        toast({
          title: "Arquivo muito grande",
          description: `O arquivo ${file.name} excede o limite de 5MB. Use arquivos menores para upload mais rápido.`,
          variant: "destructive",
        });
        return;
      }

      // Verificar tipo de arquivo
      const allowedTypes = [
        "image/",
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "application/vnd.ms-excel",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "text/plain",
      ];

      const isAllowedType = allowedTypes.some(
        (type) => file.type.startsWith(type) || file.type === type
      );

      if (!isAllowedType) {
        toast({
          title: "Tipo de arquivo não suportado",
          description: `${file.name} não é um tipo de arquivo suportado.`,
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

      // Upload paralelo dos arquivos
      simulateUpload(newAttachments);
    }

    // Limpar o input para permitir selecionar o mesmo arquivo novamente
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const uploadFile = async (attachment: Attachment): Promise<string> => {
    console.log(
      "🔄 Iniciando upload do arquivo:",
      attachment.name,
      "-",
      new Date().toISOString()
    );

    const formData = new FormData();
    formData.append("file", attachment.file);

    // Timeout de 30 segundos para uploads
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);

    try {
      console.log("📤 Enviando requisição para /api/upload...");
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      console.log(
        "📥 Resposta recebida:",
        response.status,
        response.statusText
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Erro na API de upload:", response.status, errorText);
        throw new Error(`Erro no upload do arquivo: ${response.status}`);
      }

      const data = await response.json();
      console.log("Resposta da API de upload:", data);

      // Verificar se o ID foi retornado
      if (!data.id) {
        console.error("API não retornou ID do arquivo:", data);
        throw new Error(
          `API não retornou ID do arquivo. Resposta: ${JSON.stringify(data)}`
        );
      }

      console.log("ID do arquivo retornado:", data.id);
      return data.id; // Retorna o ID do arquivo no servidor
    } catch (error) {
      clearTimeout(timeoutId);
      if (error instanceof Error && error.name === "AbortError") {
        const fileSizeMB = (attachment.file.size / (1024 * 1024)).toFixed(1);
        throw new Error(
          `Timeout no upload (${fileSizeMB}MB) - verifique sua conexão ou tente novamente.`
        );
      }
      throw error;
    }
  };

  const simulateUpload = async (newAttachments: Attachment[]) => {
    console.log("Iniciando upload de", newAttachments.length, "arquivos");

    // Upload paralelo dos arquivos para maior velocidade
    const uploadPromises = newAttachments.map(async (attachment) => {
      try {
        console.log("Processando arquivo:", attachment.name);

        // Iniciar progresso simulado
        setAttachments((prevAttachments) =>
          prevAttachments.map((att) =>
            att.id === attachment.id ? { ...att, progress: 10 } : att
          )
        );

        // Simular progresso durante upload
        const progressInterval = setInterval(() => {
          setAttachments((prevAttachments) =>
            prevAttachments.map((att) => {
              if (att.id === attachment.id && att.progress < 80) {
                return { ...att, progress: Math.min(att.progress + 5, 80) };
              }
              return att;
            })
          );
        }, 200); // Atualizar a cada 200ms para progresso mais suave

        // Fazer upload real
        console.log("🔄 Iniciando upload real para:", attachment.name);
        const fileId = await uploadFile(attachment);

        // Limpar intervalo de progresso
        clearInterval(progressInterval);

        console.log(
          "✅ Upload concluído para",
          attachment.name,
          "com ID:",
          fileId
        );

        // Atualizar o ID do arquivo e progresso para 100%
        setAttachments((prevAttachments) =>
          prevAttachments.map((att) =>
            att.id === attachment.id
              ? { ...att, progress: 100, id: fileId }
              : att
          )
        );

        toast({
          title: "Upload concluído",
          description: `${attachment.name} foi carregado com sucesso.`,
        });

        return { success: true, attachment, fileId };
      } catch (error) {
        console.error("Erro no upload de", attachment.name, ":", error);

        // Marcar como erro
        setAttachments((prevAttachments) =>
          prevAttachments.map((att) =>
            att.id === attachment.id ? { ...att, progress: -1 } : att
          )
        );

        toast({
          title: "Erro no upload",
          description: `Não foi possível carregar ${attachment.name}: ${
            error instanceof Error ? error.message : "Erro desconhecido"
          }`,
          variant: "destructive",
        });

        return { success: false, attachment, error };
      }
    });

    // Aguardar todos os uploads terminarem
    await Promise.all(uploadPromises);
  };

  const handleRemoveAttachment = (id: string) => {
    setAttachments(attachments.filter((a) => a.id !== id));
    toast({
      title: "Anexo removido",
      description: "O arquivo foi removido da resposta.",
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      const syntheticEvent = {
        preventDefault: () => {},
      } as React.FormEvent;
      handleSubmit(syntheticEvent);
    }
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

    // Verificar se todos os anexos terminaram o upload ou falharam
    const allProcessed = attachments.every(
      (att) => att.progress === 100 || att.progress === -1
    );
    if (!allProcessed) {
      toast({
        title: "Aguarde o upload",
        description: "Alguns anexos ainda estão sendo carregados.",
        variant: "destructive",
      });
      return;
    }

    // Filtrar apenas anexos que foram carregados com sucesso
    const successfulAttachments = attachments.filter(
      (att) => att.progress === 100 && att.id && att.id !== att.name // Verificar se o ID foi atualizado
    );
    console.log("Anexos carregados com sucesso:", successfulAttachments);

    // Verificar se há anexos com IDs inválidos
    const invalidAttachments = attachments.filter(
      (att) => att.progress === 100 && (!att.id || att.id === att.name)
    );
    if (invalidAttachments.length > 0) {
      console.error("Anexos com IDs inválidos:", invalidAttachments);
      toast({
        title: "Erro nos anexos",
        description:
          "Alguns anexos não foram carregados corretamente. Tente novamente.",
        variant: "destructive",
      });
      return;
    }

    // Convertendo para o formato esperado pela função onReply
    const finalAttachments = successfulAttachments.map(
      ({ id, name, size, type, file }) => ({
        id,
        name,
        size,
        type,
        file,
      })
    );

    console.log("Enviando resposta com anexos:", finalAttachments);
    console.log(
      "IDs dos arquivos:",
      finalAttachments.map((a) => a.id)
    );

    // Chamar a função de callback com o conteúdo da resposta e anexos
    onReply(replyContent, finalAttachments);

    // Limpar o campo de resposta e anexos após o envio
    setReplyContent("");
    setAttachments([]);
  };

  return (
    <form
      ref={formRef}
      onSubmit={handleSubmit}
      className="flex flex-col space-y-4 bg-white p-4 border rounded-lg"
    >
      <Textarea
        value={replyContent}
        onChange={(e) => setReplyContent(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Escreva sua resposta... (Enter para enviar, Shift+Enter para nova linha)"
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
                  {attachment.progress === -1 ? (
                    <div className="text-red-500 text-xs mt-1">
                      Erro no upload - tente novamente
                    </div>
                  ) : (
                    <div className="relative">
                      <div className="w-full bg-gray-200 rounded-full h-2 mt-1 overflow-hidden">
                        <div
                          className="bg-[#002856] h-2 rounded-full transition-all duration-300 ease-out"
                          style={{
                            width: `${attachment.progress}%`,
                            transition: "width 0.3s ease-out",
                          }}
                        />
                      </div>
                      <div className="text-xs text-gray-500 mt-1 text-center">
                        {attachment.progress}%
                      </div>
                    </div>
                  )}
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
          className="flex items-center gap-2 bg-[#002856] hover:bg-[#002856]/80"
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
});
