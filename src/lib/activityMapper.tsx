import React from "react";
import {
  FaCar,
  FaExclamationTriangle,
  FaHome,
  FaCreditCard,
  FaFileAlt,
  FaShieldAlt,
  FaHistory,
  FaReceipt,
  FaUser,
  FaDownload,
  FaEnvelope,
  FaReply,
  FaShare,
} from "react-icons/fa";
import { IoMdPin } from "react-icons/io";
import { TbTopologyStar3 } from "react-icons/tb";
import { LuSquareKanban } from "react-icons/lu";
import { AiFillFileExclamation } from "react-icons/ai";

export interface ActivityDisplay {
  icon: React.ReactNode;
  color: string;
  bgColor: string;
}

export const getActivityDisplay = (action: string): ActivityDisplay => {
  const iconSize = "w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 text-white";

  const activityMap: Record<string, ActivityDisplay> = {
    // Pagamentos
    PAGAMENTO: {
      icon: <FaCreditCard className={iconSize} />,
      color: "text-green-600",
      bgColor: "bg-green-500",
    },
    PAGAMENTO_REALIZADO: {
      icon: <FaCreditCard className={iconSize} />,
      color: "text-green-600",
      bgColor: "bg-green-500",
    },

    // Sinistros
    SINISTRO: {
      icon: <FaExclamationTriangle className={iconSize} />,
      color: "text-red-600",
      bgColor: "bg-red-500",
    },
    SINISTRO_REGISTRADO: {
      icon: <FaExclamationTriangle className={iconSize} />,
      color: "text-red-600",
      bgColor: "bg-red-500",
    },

    // Apólices
    APOLICE: {
      icon: <FaShieldAlt className={iconSize} />,
      color: "text-blue-600",
      bgColor: "bg-blue-500",
    },
    RENOVACAO_APOLICE: {
      icon: <FaShieldAlt className={iconSize} />,
      color: "text-blue-600",
      bgColor: "bg-blue-500",
    },
    NOVA_APOLICE: {
      icon: <FaShieldAlt className={iconSize} />,
      color: "text-blue-600",
      bgColor: "bg-blue-500",
    },

    // Seguros Auto
    SEGURO_AUTO: {
      icon: <FaCar className={iconSize} />,
      color: "text-purple-600",
      bgColor: "bg-purple-500",
    },

    // Seguros Residenciais
    SEGURO_RESIDENCIAL: {
      icon: <FaHome className={iconSize} />,
      color: "text-orange-600",
      bgColor: "bg-orange-500",
    },

    // Recibos
    RECIBO: {
      icon: <FaReceipt className={iconSize} />,
      color: "text-indigo-600",
      bgColor: "bg-indigo-500",
    },
    RECIBO_GERADO: {
      icon: <FaDownload className={iconSize} />,
      color: "text-indigo-600",
      bgColor: "bg-indigo-500",
    },

    // Simulações
    SIMULACAO: {
      icon: <TbTopologyStar3 className={iconSize} />,
      color: "text-blue-900",
      bgColor: "bg-blue-800",
    },
    SIMULACAO_REALIZADA: {
      icon: <TbTopologyStar3 className={iconSize} />,
      color: "text-blue-900",
      bgColor: "bg-blue-800",
    },

    // Histórico
    HISTORICO: {
      icon: <FaHistory className={iconSize} />,
      color: "text-gray-600",
      bgColor: "bg-gray-500",
    },
    CONSULTA_HISTORICO: {
      icon: <FaHistory className={iconSize} />,
      color: "text-gray-600",
      bgColor: "bg-gray-500",
    },

    // Agências
    AGENCIA: {
      icon: <IoMdPin className={iconSize} />,
      color: "text-pink-600",
      bgColor: "bg-pink-500",
    },
    CONSULTA_AGENCIA: {
      icon: <IoMdPin className={iconSize} />,
      color: "text-pink-600",
      bgColor: "bg-pink-500",
    },

    // Ocorrências
    OCORRENCIA: {
      icon: <AiFillFileExclamation className={iconSize} />,
      color: "text-red-600",
      bgColor: "bg-red-500",
    },
    OCORRENCIA_REGISTRADA: {
      icon: <AiFillFileExclamation className={iconSize} />,
      color: "text-red-600",
      bgColor: "bg-red-500",
    },

    // Gestão SOAT
    GESTAO_SOAT: {
      icon: <LuSquareKanban className={iconSize} />,
      color: "text-cyan-600",
      bgColor: "bg-cyan-500",
    },

    // Acesso Rápido
    ACESSO_RAPIDO: {
      icon: <TbTopologyStar3 className={iconSize} />,
      color: "text-emerald-600",
      bgColor: "bg-emerald-500",
    },
    ITEM_ADICIONADO: {
      icon: <TbTopologyStar3 className={iconSize} />,
      color: "text-emerald-600",
      bgColor: "bg-emerald-500",
    },

    // Perfil
    PERFIL_ATUALIZADO: {
      icon: <FaUser className={iconSize} />,
      color: "text-violet-600",
      bgColor: "bg-violet-500",
    },

    // Mensagens
    MENSAGEM_ENVIADA: {
      icon: <FaEnvelope className={iconSize} />,
      color: "text-blue-600",
      bgColor: "bg-blue-500",
    },
    MENSAGEM_RESPONDIDA: {
      icon: <FaReply className={iconSize} />,
      color: "text-green-600",
      bgColor: "bg-green-500",
    },
    MENSAGEM_ENCAMINHADA: {
      icon: <FaShare className={iconSize} />,
      color: "text-orange-600",
      bgColor: "bg-orange-500",
    },
  };

  return (
    activityMap[action] || {
      icon: <FaFileAlt className={iconSize} />,
      color: "text-gray-600",
      bgColor: "bg-gray-500",
    }
  );
};

export const formatActivityDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString("pt-BR");
};
