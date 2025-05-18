"use client";

import { useState, useEffect } from "react";
import { FaSearch, FaSpinner } from "react-icons/fa";
import { MobileMenu } from "@/components/MobileMenu";
import { Menu, MenuItem } from "@/components/Menu";

import { destroyCookie } from "nookies";
import { signOut } from "next-auth/react";
import { IoGrid, IoLogOut, IoShieldCheckmarkSharp } from "react-icons/io5";
import { FaTriangleExclamation } from "react-icons/fa6";
import { BsFillTicketPerforatedFill, BsPersonFill } from "react-icons/bs";
import { IoMdPin } from "react-icons/io";
import Historico from "../Historico/page";
import ApoliceScreen from "../Apolice/page";
import SimulationScreen from "../Simulation/page";
import SinistroScreen from "../Sinistro/page";
import { Avatar, AvatarFallback, AvatarImage } from "@radix-ui/react-avatar";

import IconHistorico from "@/assets/Icones/AliancaAuto_Icone.png";
import IconApolice from "@/assets/Icones/apolice.png";
import IconSinistro from "@/assets/Icones/sinistro.png";
import IconRecibo from "@/assets/Icones/recibos.png";
import IconSimulacao from "@/assets/Icones/simulacao.png";
import IconAgencia from "@/assets/Icones/agencia.png";

const Page = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState("Historico");
  const [isMobile, setIsMobile] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const logout = async () => {
    destroyCookie(null, "nextauth.token", { path: "/" });
    await signOut({ callbackUrl: "/" });
  };

  const MainMenus: MenuItem[] = [
    {
      title: "Histórico",
      path: "Historico",
      icon: IconHistorico.src,
      hoverIcon: <IoGrid />,
      onClick: () => handleMenuClick("Historico"),
    },
    {
      title: "Apólice",
      path: "Apolice",
      icon: IconApolice.src,
      hoverIcon: <IoShieldCheckmarkSharp />,
      onClick: () => handleMenuClick("Apolice"),
    },
    {
      title: "Sinistros",
      path: "Sinistro",
      icon: IconSinistro.src,
      hoverIcon: <FaTriangleExclamation />,
      onClick: () => handleMenuClick("Sinistro"),
    },
    {
      title: "Recibos",
      path: "Recibo",
      icon: IconRecibo.src,
      hoverIcon: <BsFillTicketPerforatedFill />,
      onClick: () => handleMenuClick(""),
    },
    {
      title: "Simulador",
      path: "Simulation",
      icon: IconSimulacao.src,
      hoverIcon: <BsPersonFill />,
      onClick: () => handleMenuClick("Simulation"),
    },
    {
      title: "Agências",
      path: "Agencias",
      icon: IconAgencia.src,
      hoverIcon: <IoMdPin />,
      onClick: () => handleMenuClick("Agencias"),
    },
    {
      title: "Sair",
      path: "",
      icon: IconHistorico.src,
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

  return (
    <main className="flex flex-col w-full min-h-screen bg-[#f3f3f5]">
      <div className={`flex flex-grow ${isMobile ? "flex-col" : ""}`}>
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
          <div className="fixed left-0 top-20 h-[calc(100vh-5rem)] md:w-44 xl:w-64">
            <Menu
              onMenuClick={handleMenuClick}
              menuItems={MainMenus.map((menu) => ({
                ...menu,
                onClick: () => {
                  if (menu.onClick) {
                    menu.onClick();
                  }
                  handleMenuClick(menu.path);
                },
              }))}
            />
          </div>
        )}

        <div
          className={`${
            isMobile
              ? "w-full p-2 mb-32 mt-16"
              : "ml-44 xl:ml-64 flex-grow p-4 mb-20"
          }`}
        >
          <div className={`flex px-4 py-6 items-center lg:mt-0 md:space-x-4 `}>
            <div className="relative flex-grow">
              <input
                type="text"
                value={searchQuery}
                onChange={handleSearchChange}
                placeholder="Pesquise..."
                className="pl-10 pr-4 py-2 w-full bg-white text-gray-900 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-gray-300"
              />
              <FaSearch
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                size={20}
              />
            </div>

            <div className=" items-center space-x-2 hidden md:flex">
              <div className="flex items-center justify-center bg-[#224276] rounded-full cursor-pointer hover:bg-gray-300 transition duration-200 ease-in-out">
                <Avatar className="w-8 h-8 rounded-full">
                  <AvatarImage
                    src="https://github.com/LeumasDev93.png"
                    className="rounded-full w-full h-full"
                  />
                  <AvatarFallback>NA</AvatarFallback>
                </Avatar>
              </div>
              <span className="font-semibold text-black text-sm md:text-sm xl:text-lg">
                Nelson Andrade
              </span>
            </div>
          </div>

          {isLoading ? (
            <div className="flex justify-center items-center h-full">
              <FaSpinner className="animate-spin size-10 text-gray-800" />
            </div>
          ) : (
            <>
              {currentPage === "Historico" && <Historico />}
              {currentPage === "Apolice" && <ApoliceScreen />}
              {currentPage === "Simulation" && <SimulationScreen />}
              {currentPage === "Sinistro" && <SinistroScreen />}
              {currentPage === "dashboard" && <div>Dashboard</div>}
              {currentPage === "gestaousuarios" && (
                <div>Gestão de Utilizadores</div>
              )}
            </>
          )}
        </div>
      </div>
    </main>
  );
};

export default Page;
