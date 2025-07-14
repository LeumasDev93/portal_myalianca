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
    default: return "Não Definido";
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

export const getApolicesStatusColorsHex = (status: string) => {
  switch (status) {
    case "C":
      return { backgroundColor: "#00b34c", color: "#00b34c" }; // bg-green-300, text-green-800
    case "S":
      return { backgroundColor: "#1889ae", color: "#1889ae" }; // bg-blue-300, text-blue-800
    case "D":
    case "T":
      return { backgroundColor: "#f21f26", color: "#f21f26" }; // bg-red-300, text-red-800
    case "X":
      return { backgroundColor: "#f19601", color: "#f19601" }; // bg-orange-300, text-orange-800
    case "U":
    case "Y":
    case "P":
      return { backgroundColor: "#ebc83a", color: "#ebc83a" }; // bg-yellow-300, text-yellow-800 (um pouco diferente do padrão tailwind #92400e para melhor contraste)
    case "W":
    case "A":
      return { backgroundColor: "#4f504f", color: "#4f504f" }; // bg-purple-300, text-purple-800
    case "I":
      return { backgroundColor: "#33454e", color: "#33454e" }; // bg-gray-300, text-gray-800
    default:
      return { backgroundColor: "#d9d9d9", color: "#d9d9d9" }; // bg-gray-100, text-gray-800
  }
};

export const getSinistrosStatusColorsHex = (status: string) => {
  switch (status) {
    case "E": // Ativo
      return { backgroundColor: "#16c1c8", color: "#16c1c8" }; // bg-green-300, text-green-900
    case "A": // Aprovado
      return { backgroundColor: "#49cccc", color: "#49cccc" }; // bg-blue-300, text-blue-900
    case "R": // Expirado
      return { backgroundColor: "#7cd7cf", color: "#7cd7cf" }; // bg-red-300, text-red-800 (text-red-800 para melhor contraste)
    case "T": // Inativo
      return { backgroundColor: "#aee1d3", color: "#aee1d3" }; // bg-gray-300, text-gray-800
    default:
      return { backgroundColor: "#e1ecd6", color: "#e1ecd6" }; // bg-gray-100, text-gray-800
  }
};

export const getStatusReciverColorHex = (status: number) => {
  switch (status) {
    case 1:
      return { backgroundColor: "#415088", color: "#415088" };
    case 2:
      return { backgroundColor: "#5967a1", color: "#5967a1" }; // bg-orange-300, text-orange-800
    case 5:
      return { backgroundColor: "#717eba", color: "#717eba" }; // bg-blue-300, text-blue-800
    case 8:
      return { backgroundColor: "#8994d2", color: "#8994d2" }; // bg-green-300, text-green-800
    case 9:
      return { backgroundColor: "#a1abeb", color: "#a1abeb" }; // bg-red-300, text-red-800
    default:
      return { backgroundColor: "#1a75f3", color: "#1a75f3" }; // bg-gray-100, text-gray-800
  }
};

export function getFirstAndLastName(fullName: string): string {
  if (!fullName) return '';

  // Remove espaços extras e divide em partes
  const names = fullName.trim().split(/\s+/);

  if (names.length === 0) return '';
  if (names.length === 1) return names[0]; // Retorna só o primeiro nome se não tiver sobrenome

  // Pega o primeiro e último nome
  const firstName = names[0];
  const lastName = names[names.length - 1];

  return `${firstName} ${lastName}`;
}

export const getSafeGridClass = (input: string = "") => {
  if (input.includes("grid-cols-3")) return "grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4";
  if (input.includes("grid-cols-2")) return "grid grid-cols-1 sm:grid-cols-2 gap-4";
  return "grid grid-cols-1 gap-4";
};
