import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

 export const getStatusApolicesColors = (status: string) => {
    switch (status) {
      case "C": // Ativo
        return "bg-green-300 text-green-900 ";
      case "S": // Aprovado
        return "bg-blue-300 text-blue-900 ";
      case "D": // Expirado
        return "bg-red-300 text-red-800 ";
      case "I": // Inativo
        return "bg-gray-300 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800 ";
    }
  };
 export const getStatusSinistrosColors = (status: string) => {
    switch (status) {
      case "E": // Ativo
        return "bg-green-300 text-green-900 ";
      case "A": // Aprovado
        return "bg-blue-300 text-blue-900 ";
      case "R": // Expirado
        return "bg-red-300 text-red-800 ";
      case "T": // Inativo
        return "bg-gray-300 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800 ";
    }
  };
  export const getBorderCardSinistrosColors = (status: string) => {
    switch (status) {
        case "E": // Ativo
          return "borde-b-green-300 sm:border-l-green-300";
        case "A": // Aprovado
          return "border-b-blue-300 sm:border-l-blue-300";
        case "R": // Expirado
          return "border-b-red-300 sm:border-l-red-300";
        case "T": // Inativo
          return "border-b-gray-300 sm:border-l-gray-300";
        default:
          return "border-b-gray-100 sm:border-l-gray-100";
      }
    };

 export const getApolicesStatusText = (status: string) => {
    switch (status) {
      case "C":
        return "Normal"; 
      case "S":
        return "Proposta"; 
      case "D":
        return "Anulado"; 
      case "X":
        return "Em Anulação";  
      case "U":
        return "Em Suspensão por Falta de Pagamento";
      case "Y":
        return "Suspensa por Falta de Pagamento";
      case "W":
        return "Em Suspenção Técnica";
      case "A":
        return "Suspensa Tecnicamente";
      case "I":
        return "Simulação";
      case "P":
        return "Pendente de Aceitação";
      case "T":
        return "Caducada";
      default:
        return status;
    }
  }; 
export const getSinistroStatusText = (status: string) => {
    switch (status) {
      case "A":
        return "Em Curso / Aberto"; 
      case "E":
        return "Encerrado"; 
      case "T":
        return "Encerrado Técnicamente"; 
      case "N":
        return "Sem Efeito";  
      case "I":
        return "Sem Efeito";
      case "R":
        return "Recusado";
      case "P":
        return "Pendente";
      default:
        return status;
    }
  };

  export const getStatusReciverColors = (status: number) => {
   switch (status) {
      case 1: 
        return "bg-orange-300 text-orange-800";
      case 2: 
        return "bg-orange-300 text-orange-800";
      case 5: 
        return "bg-blue-300 text-blue-800";
      case 8: 
        return "bg-green-300 text-green-800";
      case 9: 
        return "bg-red-300 text-red-800";
      default:
        return "bg-gray-100 text-gray-800 ";
   }
  }  
  export const getTypesReciver = (type: number) => {
   switch (type) {
      case 1: 
        return "Seguro Novo";
      case 2: 
        return "Seguro Novo"; 
      case 3: 
        return "Continuado";
      case 4: 
        return "Continuado"; 
      case 5: 
        return "Suplementar";
      case 6: 
        return "Acerto de Contas";
      case 9: 
        return "Estorno";
      default:
        return type;
   }
  } 
  export const getStatusReciverTexts = (status: number) => {
   switch (status) {
      case 1: 
        return "Em Cobrança";
      case 2: 
        return "Em Cobrança";
      case 5: 
        return "Cobrado";
      case 8: 
        return "Regularizado"
      case 9: 
        return "Anulado";
      default:
        return status;
   }
  }

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