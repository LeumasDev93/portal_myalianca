"use client";

import { useState } from "react";
import Image from "next/image";
import { Anexo } from "@/types/typesData";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

// Componente Image customizado para lidar com URLs externas
const CustomImage = ({
  src,
  alt,
  ...props
}: React.ComponentProps<typeof Image>) => {
  const [imageSrc, setImageSrc] = useState(src);
  const [hasError, setHasError] = useState(false);

  // Reset error state when src changes
  if (src !== imageSrc && !hasError) {
    setImageSrc(src);
  }

  const handleError = () => {
    if (!hasError && src && typeof src === "string" && src.startsWith("http")) {
      // Se é uma URL externa e falhou, tenta adicionar headers via proxy
      const proxyUrl = `/api/proxy-image?url=${encodeURIComponent(src)}`;
      setImageSrc(proxyUrl);
      setHasError(true);
    }
  };

  return (
    <Image
      {...props}
      src={imageSrc}
      alt={alt}
      onError={handleError}
      unoptimized={true}
    />
  );
};

export function Gallery({
  anexos,
  title,
}: {
  anexos: Anexo[];
  title?: string;
}) {
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const handleNext = () => {
    setSelectedIndex((prev) => (prev < anexos.length - 1 ? prev + 1 : prev));
  };

  const handlePrev = () => {
    setSelectedIndex((prev) => (prev > 0 ? prev - 1 : prev));
  };

  const closeGallery = () => setIsGalleryOpen(false);
  const openGallery = () => setIsGalleryOpen(true);

  const selectImage = (index: number) => {
    setSelectedIndex(index);
  };

  const getImageSrc = (anexo: Anexo) => {
    // Se tem URL direta, usa ela; senão usa base64
    if (anexo.url) {
      return anexo.url;
    }
    // Gera o Data URL (base64) para o src da imagem
    return `data:${anexo.mimetype};base64,${anexo.content}`;
  };

  if (anexos.length === 0) {
    return (
      <div className="flex items-center justify-center py-8 text-gray-500">
        <p>Nenhuma imagem disponível</p>
      </div>
    );
  }

  return (
    <>
      {/* Card com imagem de capa */}
      <div
        onClick={openGallery}
        className="relative w-full max-w-sm cursor-pointer group"
      >
        <div className="aspect-video rounded-lg overflow-hidden border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
          <CustomImage
            src={getImageSrc(anexos[0])}
            alt={anexos[0].filename || "Imagem de capa"}
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-black/50 group-hover:bg-opacity-10 transition-all" />
          {/* Título da ocorrência */}
          {title && (
            <div className="mb-2 absolute bottom-0 left-0 w-full shadow-2xl bg-[#002256]/50 p-2">
              <h3 className="text-sm font-medium text-white truncate">
                {title}
              </h3>
            </div>
          )}
        </div>

        {/* Overlay com contador */}
        <div className="absolute top-2 right-2 bg-[#002256] bg-opacity-70 text-white text-xs px-2 py-1 rounded-full">
          {anexos.length} {anexos.length === 1 ? "imagem" : "imagens"}
        </div>
      </div>

      {/* Modal da Galeria */}
      {isGalleryOpen && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-90 flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-4 bg-black bg-opacity-50">
            <h3 className="text-white text-lg font-semibold">
              Galeria de Imagens ({selectedIndex + 1}/{anexos.length})
            </h3>
            <div className="flex items-center gap-2">
              <Button
                onClick={handlePrev}
                disabled={selectedIndex === 0}
                size="sm"
                className="text-white hover:bg-white hover:text-black"
              >
                Anterior
              </Button>
              <Button
                onClick={handleNext}
                disabled={selectedIndex === anexos.length - 1}
                size="sm"
                className="text-white hover:bg-white hover:text-black"
              >
                Próxima
              </Button>
            </div>
            <Button
              onClick={closeGallery}
              size="icon"
              className="text-white hover:bg-white hover:text-black"
            >
              <X />
            </Button>
          </div>

          {/* Imagem Principal */}
          <div className="flex-1 flex items-center justify-center p-4">
            <div className="relative w-full max-w-4xl h-full">
              <CustomImage
                src={getImageSrc(anexos[selectedIndex])}
                alt={
                  anexos[selectedIndex].filename ||
                  `Imagem ${selectedIndex + 1}`
                }
                fill
                className="object-contain"
              />

              {/* Botões de navegação */}
              <Button
                onClick={handlePrev}
                disabled={selectedIndex === 0}
                className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white hover:bg-white hover:text-black"
                size="icon"
              >
                <ChevronLeft />
              </Button>

              <Button
                onClick={handleNext}
                disabled={selectedIndex === anexos.length - 1}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white hover:bg-white hover:text-black"
                size="icon"
              >
                <ChevronRight />
              </Button>
            </div>
          </div>

          {/* Scroll lateral de miniaturas */}
          <div className="p-4 bg-black bg-opacity-50">
            <div className="flex justify-center">
              <div className="flex gap-2 overflow-x-auto pb-2 max-w-full">
                {anexos.map((anexo, index) => (
                  <div
                    key={anexo.id}
                    onClick={() => selectImage(index)}
                    className={`relative flex-shrink-0 cursor-pointer rounded-lg overflow-hidden border-2 transition-all ${
                      index === selectedIndex
                        ? "border-blue-500 scale-105"
                        : "border-transparent hover:border-gray-400"
                    }`}
                  >
                    <div className="w-20 h-16">
                      <CustomImage
                        src={getImageSrc(anexo)}
                        alt={anexo.filename || `Miniatura ${index + 1}`}
                        fill
                        className="object-cover"
                      />
                    </div>
                    {index === selectedIndex && (
                      <div className="absolute inset-0 bg-blue-500 bg-opacity-20" />
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
