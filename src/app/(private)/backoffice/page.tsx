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
import { MdEmail, MdPayment } from "react-icons/md";
import { IoIosInformationCircle, IoIosLogOut } from "react-icons/io";
import { IoMdPin } from "react-icons/io";
import SimulationScreen from "../Simulation/page";
import { Avatar, AvatarFallback, AvatarImage } from "@radix-ui/react-avatar";
import { useAuth } from "@/contexts/auth-context";
import { Footer } from "@/components/Footer";
import Historico from "../Historico/page";
import { getSession, signIn } from "next-auth/react";
import { PerfilPage } from "../perfil/page";
import { LoadingScreen } from "@/components/ui/loading-screen";
import { TopMenu } from "@/components/TopMenu";
import AgenciasPage from "../agencias/page";
import ApolicePage from "../(apolices)/apolices/page";
import { SinistrosPage } from "../(sinistros)/sinistros/page";
import { SinistroDetailPage } from "../(sinistros)/sinistroDetails/page";
import MensagensPage from "../(mensagens)/mensagens/page";
import MensagemDetailPage from "../(mensagens)/mensagemDetails/page";
import AbrirSinistroPage from "../(sinistros)/newSinistro/page";
import ReciboPage from "../(recibo)/recibo/page";
import EncaminharMensagemPage from "../(mensagens)/encaminhar/page";
import ApoliceDetailPage from "../(apolices)/apoliceDetails/page";

const Page = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState("Historico");
  const [isMobile, setIsMobile] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedApoliceId, setSelectedApoliceId] = useState<string | null>(
    null
  );
  const [selectedSinistroId, setSelectedSinistroId] = useState<string | null>(
    null
  );
  const [selectedMensagemId, setSelectedMensagemId] = useState<string | null>(
    null
  );
  const [selectedEncaminharId, setSelectedEncaminharId] = useState<
    string | null
  >(null);

  const { logout, user } = useAuth();

  useEffect(() => {
    setIsLoading(true);

    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

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
      path: "apolice",
      icon: IoShieldCheckmarkSharp,
      hoverIcon: <IoShieldCheckmarkSharp />,
      onClick: () => handleMenuClick("apolice"),
    },
    {
      title: "Sinistros",
      path: "sinistro",
      icon: FaTriangleExclamation,
      hoverIcon: <FaTriangleExclamation />,
      onClick: () => handleMenuClick("sinistro"),
    },
    {
      title: "Pagamentos",
      path: "Pagamento",
      icon: MdPayment,
      hoverIcon: <MdPayment />,
      onClick: () => handleMenuClick("Pagamento"),
    },
    {
      title: "Recibos",
      path: "recibo",
      icon: IoReceiptSharp,
      hoverIcon: <IoReceiptSharp />,
      onClick: () => handleMenuClick("recibo"),
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
      path: "mensagens",
      icon: MdEmail,
      hoverIcon: <MdEmail />,
      onClick: () => handleMenuClick("mensagens"),
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

  function handleSelectApoliceDetail(id: string) {
    setSelectedApoliceId(id);
    setCurrentPage("apoliceDetails");
  }

  function handleSelectSinistroDetail(id: string) {
    setSelectedSinistroId(id);
    setCurrentPage("sinistroDetails");
  }

  function handleSelectMensagemDetail(id: string) {
    setSelectedMensagemId(id);
    setCurrentPage("mensagemDetails");
  }
  function handleSelectMensagemEncaminhar(id: string) {
    setSelectedEncaminharId(id);
    setCurrentPage("encaminhar");
  }

  return (
    <main className="flex flex-col min-h-screen bg-[#f3f3f5]">
      <TopMenu
        currentPage={currentPage}
        searchQuery={searchQuery}
        isMobile={isMobile}
        onMenuClick={handleMenuClick}
        onSearchChange={handleSearchChange}
      />

      <div
        className={`flex-1 pt-16 flex flex-grow ${
          isMobile ? "flex-col" : ""
        } flex-grow`}
      >
        {isMobile && (
          <MobileMenu
            onMenuClick={handleMenuClick}
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
          <div className="fixed left-0 top-16 h-[calc(100vh-4rem)] w-16 xl:w-64">
            <Menu
              onMenuClick={handleMenuClick}
              menuItems={MainMenus}
              activePath={currentPage}
            />
          </div>
        )}
        <div
          className={`flex-1 flex flex-col ${isMobile ? "" : "ml-16 xl:ml-64"}`}
        >
          <div className="flex-grow p-4">
            {isLoading ? (
              <div className="flex justify-center items-center h-full">
                <LoadingScreen />
              </div>
            ) : (
              <>
                {currentPage === "Historico" && <Historico />}
                {currentPage === "apolice" && (
                  <ApolicePage onSelectDetail={handleSelectApoliceDetail} />
                )}
                {currentPage === "apoliceDetails" && selectedApoliceId && (
                  <ApoliceDetailPage
                    id={selectedApoliceId}
                    onBack={() => setCurrentPage("apolice")}
                  />
                )}
                {currentPage === "sinistro" && (
                  <SinistrosPage
                    onNewSinistro={() => setCurrentPage("newSinistro")}
                    onSelectDetail={handleSelectSinistroDetail}
                  />
                )}
                {currentPage === "newSinistro" && (
                  <AbrirSinistroPage
                    onBack={() => setCurrentPage("sinistro")}
                  />
                )}
                {currentPage === "sinistroDetails" && selectedSinistroId && (
                  <SinistroDetailPage
                    id={selectedSinistroId}
                    onBack={() => setCurrentPage("sinistro")}
                  />
                )}
                {currentPage === "Simulation" && <SimulationScreen />}{" "}
                {currentPage === "recibo" && (
                  <ReciboPage onSelectDetail={handleSelectApoliceDetail} />
                )}
                {currentPage === "Perfil" && <PerfilPage />}
                {currentPage === "Agencias" && <AgenciasPage />}
                {currentPage === "mensagens" && (
                  <MensagensPage onSelectDetail={handleSelectMensagemDetail} />
                )}
                {currentPage === "mensagemDetails" && selectedMensagemId && (
                  <MensagemDetailPage
                    id={selectedMensagemId}
                    onSelectDetail={handleSelectMensagemEncaminhar}
                    onBack={() => setCurrentPage("mensagens")}
                  />
                )}
                {currentPage === "encaminhar" && selectedMensagemId && (
                  <EncaminharMensagemPage
                    id={selectedMensagemId}
                    onBack={() => setCurrentPage("mensagemDetails")}
                  />
                )}
              </>
            )}
          </div>

          <Footer />
        </div>
      </div>
    </main>
  );
};

export default Page;
