// components/ui/dot-loading.tsx
import { cn } from "@/lib/utils";

export const DotLoading = ({
  className,
  dotClassName,
  dotCount = 3,
  dotSize = "w-3 h-3",
  color = "bg-gray-400",
}: {
  className?: string;
  dotClassName?: string;
  dotCount?: number;
  dotSize?: string;
  color?: string;
}) => {
  return (
    <div className={cn("flex space-x-2 justify-center py-4", className)}>
      {[...Array(dotCount)].map((_, i) => (
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
