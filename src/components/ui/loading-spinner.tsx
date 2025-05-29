import { cn } from "@/lib/utils";

interface LoadingSpinnerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: "xs" | "sm" | "md" | "lg" | "xl" | "2xl";
  variant?:
    | "primary"
    | "secondary"
    | "success"
    | "danger"
    | "warning"
    | "info"
    | "light"
    | "dark";
}

export function LoadingSpinner({
  size = "md",
  variant = "primary",
  className,
  ...props
}: LoadingSpinnerProps) {
  const sizeClasses = {
    xs: "h-3 w-3 border-[2px]",
    sm: "h-4 w-4 border-[2px]",
    md: "h-6 w-6 border-[3px]",
    lg: "h-8 w-8 border-[3px]",
    xl: "h-10 w-10 border-[4px]",
    "2xl": "h-12 w-12 border-[4px]",
  };

  const variantClasses = {
    primary: "border-blue-500 border-t-blue-100",
    secondary: "border-purple-500 border-t-purple-100",
    success: "border-green-500 border-t-green-100",
    danger: "border-red-500 border-t-red-100",
    warning: "border-yellow-500 border-t-yellow-100",
    info: "border-cyan-500 border-t-cyan-100",
    light: "border-gray-200 border-t-gray-50",
    dark: "border-gray-800 border-t-gray-300",
  };

  return (
    <div
      className={cn(
        "inline-block animate-spin rounded-full",
        sizeClasses[size],
        variantClasses[variant],
        className
      )}
      aria-label="Carregando..."
      role="status"
      {...props}
    />
  );
}
