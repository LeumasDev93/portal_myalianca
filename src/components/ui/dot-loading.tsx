// components/ui/dot-loading.tsx
import { cn } from "@/lib/utils";

export const DotLoading = ({
  className,
  dotClassName,
  dotCount = 3,
  dotSize = "w-3 h-3",
}: {
  className?: string;
  dotClassName?: string;
  dotCount?: number;
  dotSize?: string;
}) => {
  // Definindo as cores padrão (preto, azul, vermelho)
  const defaultColors = [
    "bg-black", // Preto
    "bg-blue-900", // Azul
    "bg-red-800", // Vermelho
  ];

  // Se tiver mais dots que cores, repetimos o padrão
  const dotColors = [...Array(dotCount)].map(
    (_, i) => defaultColors[i % defaultColors.length]
  );

  return (
    <div className={cn("flex space-x-2 justify-center py-4", className)}>
      {dotColors.map((color, i) => (
        <div
          key={i}
          className={cn(
            "rounded-full animate-bounce",
            dotSize,
            color,
            dotClassName
          )}
          style={{
            animationDelay: `${i * 0.1}s`,
            animationDuration: "0.6s",
          }}
        />
      ))}
    </div>
  );
};
