import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

 export const getStatusVariant = (status: string) => {
    switch (status) {
      case "C": // Ativo
        return "bg-green-300 text-green-900 ";
      case "A": // Aprovado
        return "bg-blue-300 text-blue-900 ";
      case "E": // Expirado
        return "bg-red-300 text-red-800 ";
      case "I": // Inativo
        return "bg-gray-300 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800 ";
    }
  };

 export const getStatusText = (status: string) => {
    switch (status) {
      case "C":
        return "Concluido";
      case "E":
        return "Em Analise";
      case "A":
        return "Aprovado";
      case "I":
        return "Inativo";
      default:
        return status;
    }
  };

  export const formatDate = (dateString: string | null) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("pt-PT");
  };

  export const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-PT", {
      style: "currency",
      currency: "ECV",
    }).format(value);
  };