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
import SimulationScreen from "../../../components/Simulation/page";
import { AiFillFileExclamation } from "react-icons/ai";
import { useAuth } from "@/contexts/auth-context";
import { Footer } from "@/components/Footer";
import Historico from "../../../components/Historico/page";
import { getSession, signIn } from "next-auth/react";
import { PerfilPage } from "../../../components/perfil/page";
import { LoadingScreen } from "@/components/ui/loading-screen";
import { TopMenu } from "@/components/TopMenu";
import AgenciasPage from "../../../components/agencias/page";
import ApolicePage from "../../../components/(apolices)/apolices/page";
import ApoliceDetailPage from "../../../components/(apolices)/apoliceDetails/page";
import SinistrosPage from "../../../components/(sinistros)/sinistros/page";
import SinistroDetailPage from "../../../components/(sinistros)/sinistroDetails/page";
import MensagensPage from "../../../components/(mensagens)/mensagens/page";
import MensagemDetailPage from "../../../components/(mensagens)/mensagemDetails/page";
import ReciboPage from "../../../components/(recibo)/recibo/page";
import EncaminharMensagemPage from "../../../components/(mensagens)/encaminhar/page";
import { useAutoLogout } from "@/hooks/useLogout";
import OcorrênciasPage from "../../../components/(sinistros)/ocorrencias/page";
import NewOcorrênciasPage from "@/components/(sinistros)/ocorrencias/newOcorrencia/page";
import OcorrenciaDetailsPage from "@/components/(sinistros)/ocorrencias/detailsOcorrencia/page";

const Page = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState("Historico");
  const [isMobile, setIsMobile] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedApoliceId, setSelectedApoliceId] = useState<string | null>(
    null
  );
  const [selectedContractNumber, setSelectedContractNumber] = useState<
    string | null
  >(null);
  const [selectedSinistroId, setSelectedSinistroId] = useState<string | null>(
    null
  );
  const [selectedOcorrenciaId, setSelectedOcorrenciaId] = useState<
    string | null
  >(null);
  const [selectedMensagemId, setSelectedMensagemId] = useState<string | null>(
    null
  );
  const [selectedEncaminharId, setSelectedEncaminharId] = useState<
    string | null
  >(null);

  const { logout, user } = useAuth();

  const { countdown } = useAutoLogout(logout);

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
      title: "Ocorrências",
      path: "ocorrencias",
      icon: AiFillFileExclamation,
      hoverIcon: <AiFillFileExclamation />,
      onClick: () => handleMenuClick("ocorrencias"),
    },
    {
      title: "Simular & Contratar",
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
    // {
    //   title: "Perfil",
    //   path: "Perfil",
    //   icon: FaUserLarge,
    //   hoverIcon: <FaUserLarge />,
    //   onClick: () => handleMenuClick("Perfil"),
    // },
    // {
    //   title: "Ajuda",
    //   path: "Ajuda",
    //   icon: IoIosInformationCircle,
    //   hoverIcon: <IoIosInformationCircle />,
    //   onClick: () => handleMenuClick("Ajuda"),
    // },
    // {
    //   title: "Mensagem",
    //   path: "mensagens",
    //   icon: MdEmail,
    //   hoverIcon: <MdEmail />,
    //   onClick: () => handleMenuClick("mensagens"),
    // },
    // {
    //   title: "Notificações",
    //   path: "Notificacoes",
    //   icon: IoNotifications,
    //   hoverIcon: <IoNotifications />,
    //   onClick: () => handleMenuClick("Notificacoes"),
    // },
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

  function handleSelectApoliceDetail(id: string, contractNumber: string) {
    setSelectedApoliceId(id);
    setSelectedContractNumber(contractNumber);
    setCurrentPage("apoliceDetails");
  }

  function handleSelectSinistroDetail(id: string) {
    setSelectedSinistroId(id);
    setCurrentPage("sinistroDetails");
  }
  function handleSelectOcorenciasDetail(id: string) {
    setSelectedOcorrenciaId(id);
    setCurrentPage("detailsOcorrencia");
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
                {countdown !== null && (
                  <div className="fixed top-25 right-5 bg-orange-100 border-l-4 border-orange-500 text-orange-700 p-4 rounded-lg shadow-lg animate-bounce-in">
                    <div className="flex items-center gap-3">
                      <svg
                        className="w-6 h-6 text-orange-500"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M13 16h-1v-4h-1m1-4h.01M12 9v2m0 4h.01M12 2a10 10 0 100 20 10 10 0 000-20z"
                        />
                      </svg>
                      <span className="text-sm font-medium">
                        Você será desconectado em <strong>{countdown}</strong>{" "}
                        segundo{countdown !== 1 ? "s" : ""}
                        ...
                      </span>
                    </div>
                  </div>
                )}
                {currentPage === "Historico" && (
                  <Historico
                    onSelectDetailApolice={handleSelectApoliceDetail}
                    onSelectDetailSinistro={handleSelectSinistroDetail}
                    onOpenSimulator={() => setCurrentPage("Simulation")}
                    onNewSinistro={() => setCurrentPage("ocorrencias")}
                  />
                )}
                {currentPage === "apolice" && (
                  <ApolicePage onSelectDetail={handleSelectApoliceDetail} />
                )}
                {currentPage === "apoliceDetails" && selectedApoliceId && (
                  <ApoliceDetailPage
                    onSelectDetail={handleSelectSinistroDetail}
                    id={selectedApoliceId}
                    contractNumber={selectedContractNumber ?? ""}
                    onBack={() => setCurrentPage("apolice")}
                  />
                )}
                {currentPage === "sinistro" && (
                  <SinistrosPage
                    onNewSinistro={() => setCurrentPage("newSinistro")}
                    onSelectDetail={handleSelectSinistroDetail}
                  />
                )}
                {currentPage === "ocorrencias" && (
                  <OcorrênciasPage
                    onViewDetails={handleSelectOcorenciasDetail}
                    onNewOcorrencia={() => setCurrentPage("newOcorrencia")}
                  />
                )}
                {currentPage === "newOcorrencia" && (
                  <NewOcorrênciasPage
                    onBack={() => setCurrentPage("ocorrencias")}
                  />
                )}
                {currentPage === "detailsOcorrencia" && (
                  <OcorrenciaDetailsPage
                    id={selectedOcorrenciaId || ""}
                    onBack={() => setCurrentPage("ocorrencias")}
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
                  <ReciboPage onSelectDetail={handleSelectMensagemDetail} />
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
