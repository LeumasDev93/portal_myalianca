import { useUnreadCount } from "@/hooks/useUnreadCount";
import { useUserProfile } from "@/hooks/useUserProfile ";
import { Avatar, AvatarFallback, AvatarImage } from "@radix-ui/react-avatar";
import { useEffect, useRef, useState } from "react";
import { FaSearch } from "react-icons/fa";
import { IoNotifications } from "react-icons/io5";
import { MdEmail } from "react-icons/md";

export interface TopMenuProps {
  currentPage: string;
  searchQuery: string;
  isMobile: boolean;
  onMenuClick: (menuPage: string) => void;
  onSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export function TopMenu({
  currentPage,
  searchQuery,
  isMobile,
  onMenuClick,
  onSearchChange,
}: TopMenuProps) {
  const { profile } = useUserProfile();

  const unreadCount = useUnreadCount();

  const [showSearch, setShowSearch] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const getSaudacao = () => {
    const hora = new Date().getHours();
    if (hora >= 5 && hora < 12) return "Bom dia";
    if (hora >= 12 && hora < 19) return "Boa tarde";
    return "Boa noite";
  };

  const formatarDataCompleta = () => {
    const data = new Date();
    const diasSemana = [
      "domingo",
      "segunda-feira",
      "terça-feira",
      "quarta-feira",
      "quinta-feira",
      "sexta-feira",
      "sábado",
    ];
    const diaSemana = diasSemana[data.getDay()];
    const dia = data.getDate();
    const mes = data.toLocaleString("pt-PT", { month: "long" });
    const ano = data.getFullYear();

    return `${diaSemana}, ${dia} de ${mes} de ${ano}`;
  };

  // Mapeia os nomes das páginas para exibição mais amigável
  const getPageTitle = () => {
    const pageTitles: Record<string, string> = {
      Historico: "Histórico",
      apolice: "Apólice",
      apoliceDetails: "Detalhes da Apólice",
      sinistro: "Sinistros",
      Pagamento: "Pagamentos",
      Simulation: "Simulador",
      Perfil: "Perfil",
      mensagens: "Mensagens",
      Notificacoes: "Notificações",
      recibo: "Recibos",
      Agencias: "Agências",
      Ajuda: "Ajuda",
    };
    return pageTitles[currentPage] || currentPage;
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchInputRef.current &&
        !searchInputRef.current.contains(event.target as Node)
      ) {
        setShowSearch(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (showSearch && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [showSearch]);

  return (
    <div
      className={`${
        isMobile ? "hidden" : ""
      } fixed top-0 left-16 xl:left-64 right-0 bg-white shadow-sm z-50 px-6 py-2 xl:py-3 flex justify-between items-center border-b border-gray-100`}
    >
      <div className="flex flex-col items-start min-w-0">
        <h1 className="xl:text-xl font-bold text-[#002256] hidden md:block whitespace-nowrap">
          {getPageTitle()}
        </h1>
        <p className="font-medium text-gray-900 text-sm hidden md:block">
          {getSaudacao()}, {profile?.nome}! {formatarDataCompleta()}
        </p>
      </div>

      {!isMobile && (
        <div className="flex items-center gap-4">
          {showSearch ? (
            <div className="relative w-64" ref={searchInputRef}>
              <input
                type="text"
                value={searchQuery}
                onChange={onSearchChange}
                placeholder="Pesquisar..."
                className="pl-10 pr-4 py-1 xl:py-2 w-full bg-gray-50 text-gray-800 text-sm rounded-lg border border-gray-200 focus:outline-none focus:border-[#002256]"
              />
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#002256]/80 size-3 xl:size-4" />
            </div>
          ) : (
            <button
              onClick={() => setShowSearch(true)}
              className="text-[#002256]/80 hover:text-[#002256] transition-colors duration-200"
              aria-label="Abrir pesquisa"
            >
              <FaSearch className="size-5 xl:size-6" />
            </button>
          )}

          <button
            onClick={() => onMenuClick("mensagens")}
            className="relative p-2 rounded-full hover:bg-gray-100 transition-colors duration-200"
            aria-label="Mensagens"
          >
            <MdEmail className="text-[#002256] size-5 xl:size-6" />
            <span className="absolute -top-1 -right-1 bg-[#B7021C] text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
              {unreadCount}
            </span>
          </button>

          <button
            onClick={() => onMenuClick("Notificacoes")}
            className="relative p-2 rounded-full hover:bg-gray-100 transition-colors duration-200"
            aria-label="Notificações"
          >
            <IoNotifications className="text-[#002256] size-5 xl:size-6" />
            <span className="absolute -top-1 -right-1 bg-[#B7021C] text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
              5
            </span>
          </button>

          <button
            onClick={() => onMenuClick("Perfil")}
            className="flex items-center justify-center bg-[#002256] border-2 border-gray-300 hover:border-[#002256] sm:w-8 sm:h-8 xl:w-10 xl:h-10 rounded-full cursor-pointer hover:bg-gray-300 transition duration-200 ease-in-out"
            aria-label="Perfil"
          >
            <Avatar className="w-full h-full flex items-center justify-center">
              <AvatarImage src="" className="rounded-full" />
              <AvatarFallback className="text-white hover:text-[#002256]">
                {profile?.nome.charAt(0)}
              </AvatarFallback>
            </Avatar>
          </button>
        </div>
      )}
    </div>
  );
}
