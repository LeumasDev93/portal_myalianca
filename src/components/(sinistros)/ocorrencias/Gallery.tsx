"use client";

import { useState } from "react";
import Image from "next/image";
import { Anexo } from "@/types/typesData";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Gallery({ anexos }: { anexos: Anexo[] }) {
  const [selected, setSelected] = useState<number | null>(null);

  const handleNext = () =>
    setSelected((prev) =>
      prev !== null && prev < anexos.length - 1 ? prev + 1 : prev
    );
  const handlePrev = () =>
    setSelected((prev) => (prev !== null && prev > 0 ? prev - 1 : prev));
  const closeLightbox = () => setSelected(null);

  const getImageSrc = (anexo: Anexo) => {
    // Gera o Data URL (base64) para o src da imagem
    return `data:${anexo.mimetype};base64,${anexo.content}`;
  };

  return (
    <>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {anexos.map((anexo, i) => (
          <div
            key={anexo.id}
            onClick={() => setSelected(i)}
            className="relative aspect-square cursor-pointer group"
          >
            <Image
              src={getImageSrc(anexo)}
              alt={anexo.filename || `Anexo ${i + 1}`}
              fill
              className="object-cover rounded-lg"
            />
            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 rounded-lg" />
          </div>
        ))}
      </div>

      {selected !== null && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-90 flex items-center justify-center">
          <Button
            className="absolute top-4 right-4 text-white"
            size="icon"
            onClick={closeLightbox}
          >
            <X />
          </Button>

          <Button
            className="absolute left-4 text-white"
            size="icon"
            onClick={handlePrev}
            disabled={selected === 0}
          >
            <ChevronLeft />
          </Button>

          <div className="relative w-[90vw] max-w-4xl h-[80vh]">
            <Image
              src={getImageSrc(anexos[selected])}
              alt={anexos[selected].mimetype || `Anexo ${selected + 1}`}
              fill
              className="object-contain"
            />
          </div>

          <Button
            className="absolute right-4 text-white"
            size="icon"
            onClick={handleNext}
            disabled={selected === anexos.length - 1}
          >
            <ChevronRight />
          </Button>
        </div>
      )}
    </>
  );
}
