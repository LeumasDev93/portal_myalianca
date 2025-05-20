/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useState, useEffect } from "react";
import { FaSearch, FaSpinner } from "react-icons/fa";
import { MobileMenu } from "@/components/MobileMenu";
import { Menu, MenuItem } from "@/components/Menu";

import {
  IoGrid,
  IoLogOut,
  IoShieldCheckmarkSharp,
  IoNotifications,
  IoReceiptSharp,
} from "react-icons/io5";
import { TbTopologyStar3 } from "react-icons/tb";
import { FaTriangleExclamation, FaUserLarge } from "react-icons/fa6";
import { BsPersonFill } from "react-icons/bs";
import { MdEmail } from "react-icons/md";
import { IoIosInformationCircle, IoIosLogOut } from "react-icons/io";
import { IoMdPin } from "react-icons/io";
import ApoliceScreen from "../Apolice/page";
import SimulationScreen from "../Simulation/page";
import SinistroScreen from "../Sinistro/page";
import { Avatar, AvatarFallback, AvatarImage } from "@radix-ui/react-avatar";
import { useAuth } from "@/contexts/auth-context";
import { Footer } from "@/components/Footer";
import Historico from "../Historico/page";

const Page = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState("Historico");
  const [isMobile, setIsMobile] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isMenuCollapsed, setIsMenuCollapsed] = useState(false);

  const { logout, user } = useAuth();

  const MainMenus: MenuItem[] = [
    {
      title: "Histórico",
      path: "Historico",
      icon: IoGrid,
      hoverIcon: <IoGrid />,
      onClick: () => handleMenuClick("Historico"),
    },
    {
      title: "Apólice",
      path: "Apolice",
      icon: IoShieldCheckmarkSharp,
      hoverIcon: <IoShieldCheckmarkSharp />,
      onClick: () => handleMenuClick("Apolice"),
    },
    {
      title: "Sinistros",
      path: "Sinistro",
      icon: FaTriangleExclamation,
      hoverIcon: <FaTriangleExclamation />,
      onClick: () => handleMenuClick("Sinistro"),
    },
    {
      title: "Recibos",
      path: "Recibo",
      icon: IoReceiptSharp,
      hoverIcon: <IoReceiptSharp />,
      onClick: () => handleMenuClick(""),
    },
    {
      title: "Simulador",
      path: "Simulation",
      icon: TbTopologyStar3,
      hoverIcon: <BsPersonFill />,
      onClick: () => handleMenuClick("Simulation"),
    },
    {
      title: "Agências",
      path: "Agencias",
      icon: IoMdPin,
      hoverIcon: <IoMdPin />,
      onClick: () => handleMenuClick("Agencias"),
    },
    {
      title: "Perfil",
      path: "Perfil",
      icon: FaUserLarge,
      hoverIcon: <FaUserLarge />,
      onClick: () => handleMenuClick("Perfil"),
    },
    {
      title: "Ajuda",
      path: "Ajuda",
      icon: IoIosInformationCircle,
      hoverIcon: <IoIosInformationCircle />,
      onClick: () => handleMenuClick("Ajuda"),
    },
    {
      title: "Mensagem",
      path: "Mensagem",
      icon: MdEmail,
      hoverIcon: <MdEmail />,
      onClick: () => handleMenuClick("Mensagem"),
    },
    {
      title: "Notificações",
      path: "Notificacoes",
      icon: IoNotifications,
      hoverIcon: <IoNotifications />,
      onClick: () => handleMenuClick("Notificacoes"),
    },
    {
      title: "Sair",
      path: "",
      icon: IoIosLogOut,
      hoverIcon: <IoLogOut />,
      onClick: () => logout(),
    },
  ];

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 820);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  if (!isClient) return null;

  const handleMenuClick = (menuPage: string) => {
    setIsLoading(true);
    setCurrentPage(menuPage);
    setTimeout(() => {
      setIsLoading(false);
    }, 1000);
  };

  const formatarData = () => {
    const data = new Date();
    const dia = data.getDate();
    const mes = data.toLocaleString("pt-PT", { month: "long" });
    const ano = data.getFullYear();
    return `${dia} de ${mes} de ${ano}`;
  };

  return (
    <main
      className="flex flex-col w-full min-h-screen bg-[#f3f3f5]"
      style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
    >
      <div className={`flex flex-grow ${isMobile ? "flex-col" : ""} flex-grow`}>
        {isMobile && (
          <MobileMenu
            menuItems={MainMenus.map((menu) => ({
              ...menu,
              onClick: () => {
                if (menu.onClick) {
                  menu.onClick();
                }
              },
            }))}
          />
        )}

        {!isMobile && (
          <div className="fixed left-0 top-20 h-[calc(100vh-5rem)]">
            <Menu
              onMenuClick={handleMenuClick}
              menuItems={MainMenus}
              activePath={currentPage}
            />
          </div>
        )}

        <div
          className={`transition-all duration-300 ${
            isMobile
              ? "w-full p-2 mb-32 mt-16 flex-grow"
              : `flex-grow p-4 mb-20 ${
                  isMenuCollapsed ? "sm:ml-16 " : "sm:ml-16 xl:ml-64"
                }`
          }`}
        >
          <div className="flex flex-wrap items-center justify-between gap-4 px-4 py-4 sm:py-6 lg:mt-0">
            <div className="relative flex-grow min-w-[200px] sm:min-w-[250px]  xl:basis-2/5">
              <input
                type="text"
                value={searchQuery}
                onChange={handleSearchChange}
                placeholder="Pesquisar"
                className="pl-10 pr-4 py-2 w-full bg-white text-gray-900 rounded-md shadow-sm placeholder:text-gray-900 placeholder:font-semibold focus:outline-none focus:ring-1 focus:ring-gray-300"
              />
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#002256] size-4 xl:size-5" />
            </div>

            <div
              className={`${
                isMobile ? "hidden" : "flex"
              } items-center space-x-3 flex-shrink-0`}
            >
              <div className="flex items-center justify-center bg-[#224276] rounded-full cursor-pointer hover:bg-gray-300 transition duration-200 ease-in-out">
                <Avatar className="w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center bg-white border-1 border-[#002256] text-[#002256] font-semibold">
                  <AvatarImage
                    src="https://github.com/LeumasDev93.png"
                    className="rounded-full w-full h-full"
                  />
                  <AvatarFallback>
                    {(() => {
                      if (!user?.nome) return "";
                      const names = user.nome.trim().split(/\s+/);
                      if (names.length === 0) return "";
                      if (names.length === 1)
                        return names[0].charAt(0).toUpperCase();
                      return `${names[0].charAt(0)}${names[
                        names.length - 1
                      ].charAt(0)}`.toUpperCase();
                    })()}
                  </AvatarFallback>
                </Avatar>
              </div>
              <div className="flex flex-col text-blue-950">
                <span className="font-semibold text-sm md:text-base xl:text-lg">
                  Bem-vindo, {user?.nome}
                </span>
                <span className="text-xs">{formatarData()}</span>
              </div>
            </div>

            {/* ICONS */}
            <div
              className={`${
                isMobile ? "hidden" : "flex"
              } items-center gap-4 sm:gap-6 flex-shrink-0`}
            >
              <div className="relative">
                <MdEmail className="text-[#002256] size-5 md:size-6" />
                <span className="absolute -top-2 -right-2 bg-[#B7021C] text-white text-[10px] rounded-full h-4 w-4 flex items-center justify-center">
                  3
                </span>
              </div>
              <div className="relative">
                <IoNotifications className="text-[#002256] size-5 md:size-6" />
                <span className="absolute -top-2 -right-2 bg-[#B7021C] text-white text-[10px] rounded-full h-4 w-4 flex items-center justify-center">
                  5
                </span>
              </div>
            </div>
          </div>

          {isLoading ? (
            <div className="flex justify-center items-center h-full">
              <FaSpinner className="animate-spin size-10 text-gray-800" />
            </div>
          ) : (
            <>
              {currentPage === "Historico" && (
                <Historico isCollapsed={isMenuCollapsed} />
              )}
              {currentPage === "Apolice" && <ApoliceScreen />}
              {currentPage === "Simulation" && <SimulationScreen />}
              {currentPage === "Sinistro" && <SinistroScreen />}
              {currentPage === "dashboard" && <div>Dashboard</div>}
              {currentPage === "gestaousuarios" && (
                <div>Gestão de Utilizadores</div>
              )}
            </>
          )}
          <Footer />
        </div>
      </div>
    </main>
  );
};

export default Page;
