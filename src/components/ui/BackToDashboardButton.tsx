"use client";

interface BackToDashboardButtonProps {
  onClick: () => void;
  isMobile: boolean;
  currentPage: string;
}

export function BackToDashboardButton({
  onClick,
  isMobile,
  currentPage,
}: BackToDashboardButtonProps) {
  // Função para obter nome amigável da página
  const getPageDisplayName = (page: string) => {
    const pageNames: Record<string, string> = {
      Historico: "Início",
      apolice: "Apólice",
      apoliceDetails: "Detalhes da Apólice",
      sinistro: "Sinistros",
      Pagamento: "Pagamentos",
      ocorrencias: "Ocorrências",
      Simulation: "Simular & Contratar",
      Perfil: "Perfil",
      mensagens: "Mensagens",
      Notificacoes: "Notificações",
      recibo: "Recibos",
      Agencias: "Agências",
      Ajuda: "Ajuda",
      newOcorrencia: "Nova Ocorrência",
      gestaoSOAT: "Gestão de SOAT",
      dashboardEmpresarial: "Dashboard Empresarial",
      mensagemDetails: "Detalhes Mensagem",
      encaminhar: "Encaminhar Mensagem",
      detailsOcorrencia: "Detalhes Ocorrência",
      sinistroDetails: "Detalhes Sinistro",
    };
    return pageNames[page] || page;
  };

  const currentPageName = getPageDisplayName(currentPage);

  return (
    <div
      className={`fixed z-40 ${
        isMobile ? "hidden" : "left-1/2 -translate-x-1/2 top-20"
      } group`}
    >
      <button
        onClick={onClick}
        className="bg-white/95 backdrop-blur-sm border border-[#002256]/30 hover:border-[#002256] hover:bg-[#002256] hover:text-white px-3 py-2 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 flex items-center gap-2 text-xs font-medium group-hover:scale-105"
      >
        {/* Ícone */}
        <svg
          className="w-4 h-4 group-hover:animate-pulse"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M10 19l-7-7m0 0l7-7m-7 7h18"
          />
        </svg>

        {/* Conteúdo compacto */}
        <div className="flex items-center gap-1">
          <span className="text-[#B7021C] font-semibold">
            {currentPageName}
          </span>
          <span className="opacity-60">→</span>
          <span className="text-[#002256] font-bold group-hover:text-white">
            Dashboard
          </span>
        </div>
      </button>
    </div>
  );
}
