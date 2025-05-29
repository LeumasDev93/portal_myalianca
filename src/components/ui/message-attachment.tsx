"use client";

import { FileIcon, ImageIcon, FileTextIcon, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import Image from "next/image";

interface MessageAttachmentProps {
  name: string;
  type: string;
  size: number;
  url: string;
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
    return <ImageIcon className="h-5 w-5" />;
  } else if (type.includes("pdf") || type.includes("document")) {
    return <FileTextIcon className="h-5 w-5" />;
  } else {
    return <FileIcon className="h-5 w-5" />;
  }
};

export function MessageAttachment({
  name,
  type,
  size,
  url,
}: MessageAttachmentProps) {
  // Função para lidar com o download
  const handleDownload = () => {
    // Em um cenário real, esta URL apontaria para um endpoint que serve o arquivo
    const a = document.createElement("a");
    a.href = url;
    a.download = name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  // Se for uma imagem, mostramos uma prévia
  const isImage = type.startsWith("image/");

  return (
    <div className="flex flex-col">
      <div
        className={`border rounded-lg overflow-hidden ${
          isImage ? "p-0" : "p-3 bg-gray-50"
        }`}
      >
        {isImage ? (
          <div className="relative">
            <Image
              src={url || "/placeholder.svg"}
              alt={name}
              width={200}
              height={200}
              className="w-full h-auto max-h-[200px] object-contain"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-gray-900/50 to-transparent opacity-0 hover:opacity-100 transition-opacity flex items-end justify-center p-2">
              <Button
                variant="outline"
                size="sm"
                className="bg-white text-xs"
                onClick={handleDownload}
              >
                Ver imagem original
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0">{getFileIcon(type)}</div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{name}</p>
              <p className="text-xs text-gray-500">{formatFileSize(size)}</p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="flex-shrink-0"
              onClick={handleDownload}
            >
              <Download className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
