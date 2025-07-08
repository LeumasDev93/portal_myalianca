// components/ocorrencias/Gallery.tsx
"use client";

import { useState } from "react";
import Image from "next/image";
import { Anexo } from "@/types/typesData";
import { Download, X, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Gallery({ anexos }: { anexos: Anexo[] }) {
  const [selectedImage, setSelectedImage] = useState<number | null>(null);

  if (anexos.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 bg-gray-50 rounded-lg">
        <p className="text-muted-foreground">Nenhuma foto disponível</p>
      </div>
    );
  }

  return (
    <>
      {/* Grid de miniaturas */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {anexos.map((anexo, index) => (
          <div
            key={anexo.id}
            className="relative aspect-square cursor-pointer group"
            onClick={() => setSelectedImage(index)}
          >
            <Image
              src={`${process.env.NEXT_PUBLIC_API_BASE_URL}/anexos/${anexo.id}/download`}
              alt={`Anexo ${index + 1}`}
              fill
              className="object-cover rounded-lg"
            />
            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all rounded-lg" />
          </div>
        ))}
      </div>

      {/* Lightbox */}
      {selectedImage !== null && (
        <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4">
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-4 right-4 text-white hover:bg-white hover:bg-opacity-10"
            onClick={() => setSelectedImage(null)}
          >
            <X className="h-6 w-6" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="absolute left-4 text-white hover:bg-white hover:bg-opacity-10"
            onClick={() =>
              setSelectedImage((prev) =>
                prev === 0 ? anexos.length - 1 : (prev || 0) - 1
              )
            }
            disabled={anexos.length === 1}
          >
            <ChevronLeft className="h-8 w-8" />
          </Button>

          <div className="relative w-full h-full max-w-4xl max-h-[90vh]">
            <Image
              src={`${process.env.NEXT_PUBLIC_API_BASE_URL}/anexos/${anexos[selectedImage].id}/download`}
              alt={`Anexo ${selectedImage + 1}`}
              fill
              className="object-contain"
            />
          </div>

          <Button
            variant="ghost"
            size="icon"
            className="absolute right-4 text-white hover:bg-white hover:bg-opacity-10"
            onClick={() =>
              setSelectedImage((prev) =>
                prev === anexos.length - 1 ? 0 : (prev || 0) + 1
              )
            }
            disabled={anexos.length === 1}
          >
            <ChevronRight className="h-8 w-8" />
          </Button>

          <div className="absolute bottom-4 left-0 right-0 flex justify-center">
            <Button
              variant="secondary"
              className="flex items-center gap-2"
              onClick={() => {
                // Implementar download
                const link = document.createElement("a");
                link.href = `${process.env.NEXT_PUBLIC_API_BASE_URL}/anexos/${anexos[selectedImage].id}/download`;
                link.download = `anexo-${anexos[selectedImage].id}.jpg`;
                link.click();
              }}
            >
              <Download className="h-4 w-4" />
              Baixar Imagem
            </Button>
          </div>
        </div>
      )}
    </>
  );
}
