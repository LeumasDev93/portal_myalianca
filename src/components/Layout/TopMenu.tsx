/* eslint-disable @typescript-eslint/no-unused-vars */
import { useUserProfile } from "@/hooks/useUserProfile";
import { useNotificationsContext } from "@/contexts/notifications-context";
import { useUnreadMessages } from "@/contexts/unread-messages-context";
import { Avatar, AvatarFallback, AvatarImage } from "@radix-ui/react-avatar";
import { useEffect, useRef, useState } from "react";
import { FaSearch } from "react-icons/fa";
import {
  IoCheckmarkDoneSharp,
  IoLogOut,
  IoNotifications,
  IoPersonCircleSharp,
} from "react-icons/io5";
import { MdEmail } from "react-icons/md";
import Image from "next/image";
import Logo from "@/assets/alianca.png";
import { useAuth } from "@/contexts/auth-context";

export interface TopMenuProps {
  currentPage: string;
  searchQuery: string;
  isMobile: boolean;
  onMenuClick: (menuPage: string) => void;
  onSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  showSidebar?: boolean; // Nova prop para controlar se a sidebar está visível
  onLogout?: () => void; // Nova prop para função de logout
}

export function TopMenu({
  currentPage,
  isMobile,
  onMenuClick,
  showSidebar = true, // Default para manter compatibilidade
  onLogout,
}: TopMenuProps) {
  const { profile } = useUserProfile();
  const {
    unreadCount: notificationsCount,
    markAllAsRead: markAllNotificationsAsRead,
    setNotificationClickHandler,
  } = useNotificationsContext();
  const { unreadCount: messagesCount, markAllMessagesAsRead } =
    useUnreadMessages();
  const [showSearch, setShowSearch] = useState(false);
  const [showProfilePopup, setShowProfilePopup] = useState(false);
  const [showMessagesPopup, setShowMessagesPopup] = useState(false);
  const [showNotificationsPopup, setShowNotificationsPopup] = useState(false);

  const { logout } = useAuth();
  const searchInputRef = useRef<HTMLInputElement>(null);


  // Função para navegação condicional baseada no tipo de usuário
  const handleLogoClick = () => {
    if (profile?.user?.tipo_cliente === "Company") {
      onMenuClick("empresarial");
    } else {
      onMenuClick("Historico");
    }
  };
  const profilePopupRef = useRef<HTMLDivElement>(null);
  const messagesPopupRef = useRef<HTMLDivElement>(null);
  const notificationsPopupRef = useRef<HTMLDivElement>(null);
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
      empresarial: "Empresarial",
      dashboard: "Dashboard",
      mensagemDetails: "Detalhes Mensagem",
      encaminhar: "Encaminhar Mensagem",
      detailsOcorrencia: "Detalhes Ocorrência",
      sinistroDetails: "Detalhes Sinistro",
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

      if (
        profilePopupRef.current &&
        !profilePopupRef.current.contains(event.target as Node)
      ) {
        setShowProfilePopup(false);
      }

      if (
        messagesPopupRef.current &&
        !messagesPopupRef.current.contains(event.target as Node)
      ) {
        setShowMessagesPopup(false);
      }

      if (
        notificationsPopupRef.current &&
        !notificationsPopupRef.current.contains(event.target as Node)
      ) {
        setShowNotificationsPopup(false);
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

  // Configurar handler para clique no toast de notificações
  useEffect(() => {
    setNotificationClickHandler(() => {
      onMenuClick("Notificacoes");
    });
  }, [setNotificationClickHandler, onMenuClick]);

  return (
    <div
      className={`${isMobile ? "hidden" : ""} fixed top-0 ${
        showSidebar ? "left-16 xl:left-64" : "left-0"
      } right-0 bg-white shadow-sm z-50 px-6 py-2 xl:py-3 flex justify-between items-center border-b border-gray-100`}
    >
      <div className="flex items-center gap-4">
        {!showSidebar && (
          <div
            className="flex items-center border-r border-gray-300 pr-4 cursor-pointer hover:opacity-80 transition-opacity"
            onClick={handleLogoClick}
            title="Voltar ao início"
          >
            <Image
              src={Logo}
              alt="Logo"
              width={40}
              height={40}
              className="w-10 h-10"
            />
            <div className="flex ml-2">
              <h1 className="text-lg font-extrabold text-[#B7021C]">My</h1>
              <h1 className="text-lg font-extrabold text-[#002256]">Aliança</h1>
            </div>
          </div>
        )}

        <div className="flex flex-col items-start min-w-0">
          {/* Layout especial para Empresarial */}
          {currentPage === "empresarial" ? (
            <div className="hidden md:block">
              <h1 className="text-xl font-semibold text-[#002256] mb-1">
                {getSaudacao()},{" "}
                {profile?.user?.nome &&
                  profile.user.nome
                    .split(" ")
                    .filter(Boolean)
                    .filter((_, i, arr) => i === 0 || i === arr.length - 1)
                    .join(" ")}
                !
              </h1>
              <p className="text-sm text-gray-800">{formatarDataCompleta()}</p>
            </div>
          ) : (
            /* Layout padrão para outras páginas */
            <>
              <h1 className="xl:text-xl font-bold text-[#002256] hidden md:block whitespace-nowrap">
                {getPageTitle()}
              </h1>
              <p className="font-medium text-gray-900 text-sm hidden md:block">
                {getSaudacao()},
                {profile?.user?.nome &&
                  profile.user.nome
                    .split(" ")
                    .filter(Boolean)
                    .filter((_, i, arr) => i === 0 || i === arr.length - 1)
                    .join(" ")}
                ! {formatarDataCompleta()}
              </p>
            </>
          )}
        </div>
      </div>

      {!isMobile && (
        <div className="flex items-center gap-4">
          {/* {showSearch ? (
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
          )} */}

          <button
            onClick={() => setShowMessagesPopup(!showMessagesPopup)}
            className="relative p-2 rounded-full hover:bg-gray-100 transition-colors duration-200"
            aria-label="Mensagens"
          >
            <MdEmail className="text-[#002256] size-5 xl:size-6" />
            {messagesCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-[#B7021C] text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
                {messagesCount > 99 ? "99+" : messagesCount}
              </span>
            )}

            {/* Popup de mensagens */}
            {showMessagesPopup && (
              <div
                ref={messagesPopupRef}
                className="absolute top-full right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 z-50"
              >
                <div className="p-4 border-b border-gray-100 text-left">
                  <h3 className="text-sm font-semibold text-gray-900">
                    Mensagens
                  </h3>
                  <p className="text-xs text-gray-500 mt-1">
                    {messagesCount > 0
                      ? `${messagesCount} mensagem${
                          messagesCount > 1 ? "s" : ""
                        } não lida${messagesCount > 1 ? "s" : ""}`
                      : "Nenhuma mensagem nova"}
                  </p>
                </div>

                <div className="p-2">
                  <div
                    onClick={() => {
                      onMenuClick("mensagens");
                      setShowMessagesPopup(false);
                    }}
                    className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md transition-colors duration-200 flex items-center space-x-2 cursor-pointer"
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        onMenuClick("mensagens");
                        setShowMessagesPopup(false);
                      }
                    }}
                  >
                    <MdEmail className="size-5 xl:size-6" />
                    <span>Ver Mensagens</span>
                  </div>

                  {messagesCount > 0 && (
                    <div
                      onClick={async () => {
                        try {
                          // Marcar todas as mensagens como lidas
                          await markAllMessagesAsRead();

                          setShowMessagesPopup(false);
                        } catch (error) {
                          console.error(
                            "Erro ao marcar mensagens como lidas:",
                            error
                          );
                        }
                      }}
                      className="w-full text-left px-3 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-md transition-colors duration-200 flex items-center space-x-2 cursor-pointer"
                      role="button"
                      tabIndex={0}
                      onKeyDown={async (e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          try {
                            await markAllMessagesAsRead();
                            setShowMessagesPopup(false);
                          } catch (error) {
                            console.error(
                              "Erro ao marcar mensagens como lidas:",
                              error
                            );
                          }
                        }
                      }}
                    >
                      <IoCheckmarkDoneSharp className="size-5 xl:size-6" />
                      <span>Marcar Todas como Lidas</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </button>

          <button
            onClick={() => setShowNotificationsPopup(!showNotificationsPopup)}
            className="relative p-2 rounded-full hover:bg-gray-100 transition-colors duration-200"
            aria-label="Notificações"
          >
            <IoNotifications className="text-[#002256] size-5 xl:size-6" />
            {notificationsCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-[#B7021C] text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
                {notificationsCount > 99 ? "99+" : notificationsCount}
              </span>
            )}

            {/* Popup de notificações */}
            {showNotificationsPopup && (
              <div
                ref={notificationsPopupRef}
                className="absolute top-full right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 z-50"
              >
                <div className="p-4 border-b border-gray-100 text-left">
                  <h3 className="text-sm font-semibold text-gray-900">
                    Notificações
                  </h3>
                  <p className="text-xs text-gray-500 mt-1">
                    {notificationsCount > 0
                      ? `${notificationsCount} notificação${
                          notificationsCount > 1 ? "ões" : ""
                        } não lida${notificationsCount > 1 ? "s" : ""}`
                      : "Nenhuma notificação nova"}
                  </p>
                </div>

                <div className="p-2">
                  <div
                    onClick={() => {
                      onMenuClick("Notificacoes");
                      setShowNotificationsPopup(false);
                    }}
                    className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md transition-colors duration-200 flex items-center space-x-2 cursor-pointer"
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        onMenuClick("Notificacoes");
                        setShowNotificationsPopup(false);
                      }
                    }}
                  >
                    <IoNotifications className="size-5 xl:size-6" />
                    <span>Ver Notificações</span>
                  </div>

                  {notificationsCount > 0 && (
                    <div
                      onClick={async () => {
                        try {
                          // Marcar todas as notificações como lidas
                          await markAllNotificationsAsRead();

                          setShowNotificationsPopup(false);
                        } catch (error) {
                          console.error(
                            "Erro ao marcar notificações como lidas:",
                            error
                          );
                        }
                      }}
                      className="w-full text-left px-3 py-2 text-sm text-blue-800 hover:bg-blue-50 rounded-md transition-colors duration-200 flex items-center space-x-2 cursor-pointer"
                      role="button"
                      tabIndex={0}
                      onKeyDown={async (e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          try {
                            await markAllNotificationsAsRead();
                            setShowNotificationsPopup(false);
                          } catch (error) {
                            console.error(
                              "Erro ao marcar notificações como lidas:",
                              error
                            );
                          }
                        }
                      }}
                    >
                      <IoCheckmarkDoneSharp className="size-5 xl:size-6" />
                      <span>Marcar Todas como Lidas</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </button>

          <div
            onClick={() => setShowProfilePopup(!showProfilePopup)}
            className="flex items-center justify-center bg-[#002256] border-2 border-gray-300 hover:border-[#002256] sm:w-8 sm:h-8 xl:w-10 xl:h-10 rounded-full cursor-pointer hover:bg-gray-300 transition duration-200 ease-in-out relative"
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                setShowProfilePopup(!showProfilePopup);
              }
            }}
            aria-label="Perfil"
          >
            <Avatar className="w-full h-full flex items-center justify-center">
              <AvatarImage
                src={`/api/proxy-image?url=${encodeURIComponent(
                  `${process.env.NEXT_PUBLIC_API_BASE_URL_IMAGE}/${profile?.user?.imagem_id}`
                )}`}
                alt="Avatar do usuário"
                className="rounded-full w-full h-full object-cover"
              />
              <AvatarFallback className="bg-[#002256] text-white text-xs font-semibold rounded-full w-full h-full flex items-center justify-center">
                {profile?.user?.nome?.charAt(0)?.toUpperCase() || "U"}
              </AvatarFallback>
            </Avatar>

            {/* Popup do perfil */}
            {showProfilePopup && (
              <div
                ref={profilePopupRef}
                className="absolute top-full right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 z-50"
              >
                <div className="p-4 border-b border-gray-100">
                  <div className="flex items-center space-x-3">
                    <Avatar className="w-12 h-12">
                      <AvatarImage
                        src={`/api/proxy-image?url=${encodeURIComponent(
                          `${process.env.NEXT_PUBLIC_API_BASE_URL_IMAGE}/${profile?.user?.imagem_id}`
                        )}`}
                        alt="Avatar do usuário"
                        className="rounded-full w-full h-full object-cover"
                      />
                      <AvatarFallback className="bg-[#002256] text-white text-sm font-semibold rounded-full w-full h-full flex items-center justify-center">
                        {profile?.user?.nome?.charAt(0)?.toUpperCase() || "U"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900 truncate">
                        {profile?.user?.nome || "Usuário"}
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        {profile?.user?.email || "email@exemplo.com"}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-2">
                  <button
                    onClick={() => {
                      onMenuClick("Perfil");
                      setShowProfilePopup(false);
                    }}
                    className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md transition-colors duration-200 flex items-center space-x-2"
                  >
                    <IoPersonCircleSharp className="size-5 xl:size-6" />
                    <span>Ver Perfil</span>
                  </button>

                  <button
                    onClick={() => {
                      if (onLogout) {
                        logout();
                      }
                      setShowProfilePopup(false);
                    }}
                    className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-md transition-colors duration-200 flex items-center space-x-2"
                  >
                    <IoLogOut className="size-5 xl:size-6" />
                    <span>Sair</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
