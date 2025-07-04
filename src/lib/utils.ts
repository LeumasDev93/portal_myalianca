import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const getApolicesStatusText = (status: string) => {
  switch (status) {
    case "C": return "Ativo";
    case "S": return "Proposta";
    case "D": return "Anulado";
    case "X": return "Em Anulação";
    case "U": return "Suspensa (Falta Pag.)";
    case "Y": return "Suspensa (Falta Pag.)";
    case "W": return "Suspensa Técnica";
    case "A": return "Suspensa Técnica";
    case "I": return "Simulação";
    case "P": return "Pendente";
    case "T": return "Caducada";
    default: return status;
  }
};

// Função para obter a classe CSS do status
export const getStatusApolicesColors = (status: string) => {
  switch (status) {
    case "C": return "bg-green-300 text-green-800";
    case "S": return "bg-blue-300 text-blue-800";
    case "D":
    case "T": return "bg-red-300 text-red-800";
    case "X": return "bg-orange-300 text-orange-800";
    case "U":
    case "Y":
    case "P": return "bg-yellow-300 text-yellow-800";
    case "W":
    case "A": return "bg-purple-300 text-purple-800";
    case "I": return "bg-gray-300 text-gray-800";
    default: return "bg-gray-100 text-gray-800";
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


// Tipos de recibos (ajuste conforme sua API)
export const TIPOS_RECIBO = {
  1: "Seguro novo",
  2: "Renovação",
  3: "Endosso",
  4: "Prêmio adicional",
  // Adicione outros conforme necessário
};

// Status de recibos (ajuste conforme sua API)
export const STATUS_RECIBO = {
  1: "Em Cobrança",
  2: "Em Cobrança", // Pode ter o mesmo texto para códigos diferentes
  5: "Cobrado",
  8: "Regularizado",
  9: "Anulado",
};

// Ramos de seguros (ajuste conforme sua API)
export const RAMOS_SEGURO = {
  1: "Automóvel",
  2: "Habitação",
  3: "Viagem",
  4: "Vida",
  5: "Saúde",
  // Adicione outros conforme necessário
};

// Cores para os status
export const STATUS_COLORS = {
  1: "bg-yellow-100 text-yellow-800", // Em Cobrança
  2: "bg-yellow-100 text-yellow-800", // Em Cobrança (mesmo que 1)
  5: "bg-green-100 text-green-800",   // Cobrado
  8: "bg-blue-100 text-blue-800",     // Regularizado
  9: "bg-red-100 text-red-800",       // Anulado
};

// Funções de mapeamento
export const getRamoFromType = (type: number): string => {
  return RAMOS_SEGURO[type as keyof typeof RAMOS_SEGURO] || "Outros";
};

export const getTipoRecibo = (type: number): string => {
  return TIPOS_RECIBO[type as keyof typeof TIPOS_RECIBO] || "Desconhecido";
};

export const getStatusReciboText = (status: number): string => {
  return STATUS_RECIBO[status as keyof typeof STATUS_RECIBO] || "Desconhecido";
};

export const getStatusReciboClass = (status: number): string => {
  return STATUS_COLORS[status as keyof typeof STATUS_COLORS] || "bg-gray-100 text-gray-800";
};

export const getStatusInfo = (type: 'recibos' | 'sinistros' | 'apolices', status: number | string) => {
  switch (type) {
    case 'recibos':
      return getStatusReciverColors(status as number);
    case 'sinistros':
      return getStatusSinistrosColors(status as string);
    case 'apolices':
      return getStatusApolicesColors(status as string);
    default:
      return { text: "Desconhecido", class: "bg-gray-100 text-gray-800" };
  }
};