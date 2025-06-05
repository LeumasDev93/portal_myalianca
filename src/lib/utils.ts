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

export const getStatusText = (status: string | number): string => {
  // Converte para string caso seja number
  const statusStr = typeof status === 'number' ? status.toString() : status;
  
  switch (statusStr) {
    case "C":
    case "1": // Adicionei mapeamento para números caso necessário
      return "Concluído";
    case "E":
    case "2":
      return "Em Análise";
    case "A":
    case "3":
      return "Aprovado";
    case "I":
    case "4":
      return "Inativo";
    default:
      return statusStr;
  }
};

  export const formatDate = (dateString: string | null) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("pt-PT");
  };

  export const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-PT", {
      style: "currency",
      currency: "ECV",
    }).format(value);
  };