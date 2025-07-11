"use client";

import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "@/components/ui/toast";
import { useToast } from "@/components/ui/use-toast";
import clsx from "clsx"; // você pode instalar com: npm install clsx

export function Toaster() {
  const { toasts } = useToast();

  return (
    <ToastProvider>
      {toasts.map(({ id, title, description, action, variant, ...props }) => {
        const variantClasses = {
          default: "bg-gray-200 text-gray-800 border border-gray-300",
          success: "bg-green-50 text-green-700 border border-green-200",
          destructive: "bg-red-50 text-red-700 border border-red-200",
        };

        return (
          <Toast
            key={id}
            {...props}
            className={clsx(
              "rounded-md shadow-lg",
              variantClasses[variant as keyof typeof variantClasses] ||
                variantClasses.default
            )}
          >
            <div className="grid gap-1">
              {title && <ToastTitle>{title}</ToastTitle>}
              {description && (
                <ToastDescription>{description}</ToastDescription>
              )}
            </div>
            {action}
            <ToastClose className="text-inherit hover:opacity-80" />
          </Toast>
        );
      })}
      <ToastViewport />
    </ToastProvider>
  );
}
