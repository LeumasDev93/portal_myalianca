"use client";

import { useState, useEffect } from "react";
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
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Reset estados quando src mudar
  useEffect(() => {
    setHasError(false);
    setIsLoading(true);
  }, [src]);

  const handleError = () => {
    console.log("❌ Erro ao carregar imagem:", src);
    setHasError(true);
    setIsLoading(false);
  };

  const handleLoad = () => {
    console.log("✅ Imagem carregada com sucesso:", src);
    setIsLoading(false);
    setHasError(false);
  };

  if (hasError) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-500">
        <div className="text-center">
          <div className="text-2xl mb-2">📷</div>
          <div className="text-sm">Erro ao carregar imagem</div>
        </div>
      </div>
    );
  }

  return (
    <>
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      )}
      <Image
        {...props}
        src={src}
        alt={alt}
        onError={handleError}
        onLoad={handleLoad}
        unoptimized={true}
      />
    </>
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

  // Debug: Log dos anexos recebidos
  console.log("Gallery - Anexos recebidos:", anexos);
  console.log("Gallery - Número de anexos:", anexos.length);

  // Reset estados quando anexos mudarem
  useEffect(() => {
    setSelectedIndex(0);
    setIsGalleryOpen(false);
  }, [anexos]);

  const handleNext = () => {
    setSelectedIndex((prev) => (prev < anexos.length - 1 ? prev + 1 : prev));
  };

  const handlePrev = () => {
    setSelectedIndex((prev) => (prev > 0 ? prev - 1 : prev));
  };

  const closeGallery = () => {
    console.log("Fechando galeria");
    setIsGalleryOpen(false);
  };

  const openGallery = () => {
    console.log("Abrindo galeria com", anexos.length, "anexos");
    setIsGalleryOpen(true);
  };

  const selectImage = (index: number) => {
    setSelectedIndex(index);
  };

  const getImageSrc = (anexo: Anexo) => {
    console.log("🖼️ Processando anexo:", anexo);

    // Se tem URL direta, usa o proxy para evitar problemas de CORS
    if (anexo.url) {
      console.log("🔗 Usando URL via proxy:", anexo.url);
      return `/api/proxy-image?url=${encodeURIComponent(anexo.url)}`;
    }

    // Gera o Data URL (base64) para o src da imagem
    if (anexo.content) {
      console.log("📄 Usando conteúdo base64");
      return `data:${anexo.mimetype};base64,${anexo.content}`;
    }

    console.log("❌ Nenhuma fonte de imagem encontrada para:", anexo);
    return "";
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
        <div className="fixed inset-0 z-[9999] bg-black bg-opacity-95 flex flex-col">
          {/* Overlay para fechar ao clicar fora */}
          <div className="absolute inset-0" onClick={closeGallery} />
          {/* Header */}
          <div className="relative flex items-center justify-between p-4 bg-black bg-opacity-50 z-10">
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
          <div className="relative flex-1 flex items-center justify-center p-4 z-10">
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
          <div className="relative p-4 bg-black bg-opacity-50 z-10">
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
