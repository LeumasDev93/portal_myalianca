/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { FaSearch, FaSpinner } from "react-icons/fa";
import { MobileMenu } from "@/components/Layout/MobileMenu";
import { Menu, MenuItem } from "@/components/Layout/Menu";

import {
  IoGrid,
  IoLogOut,
  IoShieldCheckmarkSharp,
  IoNotifications,
  IoReceiptSharp,
  IoBusinessSharp,
  IoStatsChart,
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
import { useUserProfile } from "@/hooks/useUserProfile";
import { Footer } from "@/components/Layout/Footer";
import Historico from "../../../components/Historico/page";
import { getSession, signIn } from "next-auth/react";
import { PerfilPage } from "../../../components/perfil/page";
import { LoadingContainer } from "@/components/ui/loading-container";
import { ConnectionErrorScreen } from "@/components/ui/connection-error-screen";
import { ConnectionRestoredNotification } from "@/components/ui/connection-restored-notification";
import { TopMenu } from "@/components/Layout/TopMenu";
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
import { BottomNavigation } from "@/components/Layout/BottomNavigation";
import NotificationsPage from "@/components/Notifications/page";
import { LuSquareKanban } from "react-icons/lu";
import Empresarial from "@/components/empresarial/page";
import DashboardPage from "@/components/dashboard/page";
import { BackToDashboardButton } from "@/components/ui/BackToDashboardButton";
import PageGestaoSOAT from "@/components/gestaoSOAT/page";
import { BackToTopButton } from "@/components/ui/BackToTopButton";
import { useRouter, useSearchParams } from "next/navigation";
import { useToast } from "@/components/ui/use-toast";

const Page = () => {
  const { profile } = useUserProfile();

  console.log('profile -->', profile);
  const [isLoading, setIsLoading] = useState(false);
  // Define a página padrão baseada no tipo_cliente
  const defaultPage = profile?.user?.tipo_cliente === 'Company' ? 'Empresarial' : 'Historico';
  const [currentPage, setCurrentPage] = useState(defaultPage);
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
  const [filterParams, setFilterParams] = useState<Record<string, string>>({});

  const { logout, user } = useAuth();
  const { countdown } = useAutoLogout(logout);
  const searchParams = useSearchParams();
  const router = useRouter();
  const { toast } = useToast();

  // Função helper para verificar se há parâmetros do SISP
  const hasSispParams = useCallback((params?: URLSearchParams): boolean => {
    const checkParams = params || (typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null);
    if (!checkParams) return false;
    return checkParams.has("status_code") || 
           checkParams.has("transaction_id") || 
           checkParams.has("finger_print");
  }, []);

  // Função helper para preservar parâmetros do SISP ao fazer router.replace
  const replaceWithPreservedParams = useCallback((menu: string, currentParams?: URLSearchParams) => {
    const params = currentParams || new URLSearchParams(searchParams?.toString() || '');
    
    // PRESERVA parâmetros do SISP
    const sispParams = ['status_code', 'transaction_id', 'finger_print', 'message', 'channel_transaction_id'];
    const preservedParams: Record<string, string> = {};
    sispParams.forEach(param => {
      const value = params.get(param);
      if (value) preservedParams[param] = value;
    });
    
    params.set("menu", menu);
    
    Object.entries(preservedParams).forEach(([key, value]) => {
      params.set(key, value);
    });
    
    const qs = params.toString();
    router.replace(`?${qs}`, { scroll: false });
  }, [searchParams, router]);

  useEffect(() => {
    setIsLoading(true);

    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  // Atualiza a página padrão quando o profile for carregado
  useEffect(() => {
    if (profile?.user?.tipo_cliente) {
      const newDefaultPage = profile.user.tipo_cliente === 'Company' ? 'Empresarial' : 'Historico';
      setCurrentPage(newDefaultPage);
    }
  }, [profile?.user?.tipo_cliente]);

  // Protege páginas exclusivas de Company
  useEffect(() => {
    if (profile?.user?.tipo_cliente !== 'Company') {
      // Se não for Company e tentar acessar páginas restritas, redireciona
      if (currentPage === 'empresarial' || currentPage === 'gestaoSOAT' || currentPage === 'Empresarial') {
        setCurrentPage('Historico');
        // Preserva parâmetros do SISP se existirem
        const params = new URLSearchParams();
        params.set("page", "Historico");
        if (typeof window !== 'undefined') {
          const urlParams = new URLSearchParams(window.location.search);
          const sispParams = ['status_code', 'transaction_id', 'finger_print', 'message', 'channel_transaction_id'];
          sispParams.forEach(param => {
            const value = urlParams.get(param);
            if (value) params.set(param, value);
          });
        }
        router.push(`/backoffice?${params.toString()}`);
        toast({
          title: "Acesso Negado",
          description: "Esta página é exclusiva para empresas.",
          variant: "destructive",
        });
      }
    }
  }, [currentPage, profile?.user?.tipo_cliente, router, toast]);

  // Filtra os menus baseado no tipo de cliente
  const getFilteredMenus = () => {
    const baseMenus: MenuItem[] = [
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
        title: "Recibos & Pagamentos",
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
        hoverIcon: <TbTopologyStar3 />,
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
        title: "Sair",
        path: "",
        icon: IoIosLogOut,
        hoverIcon: <IoLogOut />,
        onClick: () => logout(),
      },
    ];

    // Adiciona menus específicos baseado no tipo de usuário
    if (profile?.user?.tipo_cliente === "Company") {
      // Empresarial no início
      baseMenus.unshift({
        title: "Empresarial",
        path: "empresarial",
        icon: IoBusinessSharp,
        hoverIcon: <IoBusinessSharp />,
        onClick: () => handleMenuClick("empresarial"),
      });

      // Dashboard para Company
      baseMenus.splice(1, 0, {
        title: "Dashboard",
        path: "dashboard",
        icon: IoStatsChart,
        hoverIcon: <IoStatsChart />,
        onClick: () => handleMenuClick("dashboard"),
      });

      // Gestão de SOAT
      baseMenus.splice(2, 0, {
        title: "Gestão de SOAT",
        path: "gestaoSOAT",
        icon: LuSquareKanban,
        hoverIcon: <LuSquareKanban />,
        onClick: () => handleMenuClick("gestaoSOAT"),
      });
    } else {
      // Início apenas para usuários não-Company
      baseMenus.unshift({
        title: "Início",
        path: "Historico",
        icon: IoGrid,
        hoverIcon: <IoGrid />,
        onClick: () => handleMenuClick("Historico"),
      });
    }

    return baseMenus;
  };

  const MainMenus = getFilteredMenus();

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Ref para evitar múltiplas execuções quando há parâmetros SISP
  const sispParamsDetectedRef = useRef(false);

  // Define a página padrão baseada no tipo de usuário ou restaura da URL
  useEffect(() => {
    // Só processa quando está no cliente
    if (!isClient) return;
    
    // CRÍTICO: Verifica PRIMEIRO se há parâmetros do SISP ANTES de fazer QUALQUER coisa
    // Lê diretamente de window.location para garantir que pega os parâmetros
    let hasSisp = false;
    if (typeof window !== 'undefined') {
      try {
        const urlParams = new URLSearchParams(window.location.search);
        hasSisp = urlParams.has("status_code") || 
                  urlParams.has("transaction_id") || 
                  urlParams.has("finger_print");
        if (hasSisp) {
          console.log("[BACKOFFICE] 🚨🚨🚨 PARÂMETROS SISP DETECTADOS - BLOQUEANDO TODAS AS ALTERAÇÕES DE URL 🚨🚨🚨");
          console.log("[BACKOFFICE] URL completa:", window.location.href);
          console.log("[BACKOFFICE] Todos os parâmetros:", Array.from(urlParams.entries()));
          
          const menuFromUrl = urlParams.get("menu") || searchParams?.get("menu");
          if (menuFromUrl) {
            setCurrentPage(menuFromUrl);
          }
          // CRÍTICO: Marca como detectado e RETORNA IMEDIATAMENTE - NUNCA mais executa este useEffect
          sispParamsDetectedRef.current = true;
          return;
        }
      } catch (error) {
        console.error("[BACKOFFICE] Erro ao verificar parâmetros:", error);
      }
    }
    
    // Fallback: verifica via searchParams também
    if (!hasSisp && hasSispParams()) {
      console.log("[BACKOFFICE] 🚨🚨🚨 PARÂMETROS SISP DETECTADOS (via searchParams) - BLOQUEANDO 🚨🚨🚨");
      const menuFromUrl = searchParams?.get("menu");
      if (menuFromUrl) {
        setCurrentPage(menuFromUrl);
      }
      sispParamsDetectedRef.current = true;
      return;
    }
    
    // CRÍTICO: Se já detectou parâmetros SISP antes, NUNCA mais executa este código
    if (sispParamsDetectedRef.current) {
      console.log("[BACKOFFICE] ⚠️ Parâmetros SISP já detectados anteriormente - BLOQUEANDO execução");
      return;
    }
    
    const menuFromUrl = searchParams?.get("menu");
    
    if (menuFromUrl) {
      // Verifica se o usuário tem permissão para acessar a página da URL
      if (profile?.user?.tipo_cliente !== 'Company' && 
          (menuFromUrl === 'empresarial' || menuFromUrl === 'gestaoSOAT' || menuFromUrl === 'Empresarial')) {
        // Redireciona para Historico se não tiver permissão
        const defaultMenu = "Historico";
        setCurrentPage(defaultMenu);
        replaceWithPreservedParams(defaultMenu);
        toast({
          title: "Acesso Negado",
          description: "Esta página é exclusiva para empresas.",
          variant: "destructive",
        });
      } else {
        // Se há menu na URL, usa ele - NÃO altera a URL de forma alguma
        setCurrentPage(menuFromUrl);
        // Next.js preserva automaticamente os parâmetros da URL no reload
      }
    } else {
      // Se não há menu na URL, define o padrão baseado no tipo de usuário
      // Só faz isso se o profile já estiver carregado
      if (!profile?.user?.tipo_cliente) return;

      // Fallback: tentar restaurar do sessionStorage caso o menu tenha sido salvo no clique
      try {
        const lastMenu = sessionStorage.getItem("lastMenu");
        if (lastMenu) {
          // Verifica permissão antes de restaurar
          if (profile?.user?.tipo_cliente !== 'Company' && 
              (lastMenu === 'empresarial' || lastMenu === 'gestaoSOAT' || lastMenu === 'Empresarial')) {
            // Limpa o sessionStorage e usa o menu padrão
            sessionStorage.removeItem("lastMenu");
          } else {
            setCurrentPage(lastMenu);
            replaceWithPreservedParams(lastMenu);
            return;
          }
        }
      } catch (_err) {
        // silencioso
      }
      
      const defaultMenu = profile.user.tipo_cliente === "Company" 
        ? "empresarial" 
        : "Historico";
      
      setCurrentPage(defaultMenu);
      // Só faz replace se NÃO houver parâmetros do SISP
      if (!hasSispParams() && !sispParamsDetectedRef.current) {
        replaceWithPreservedParams(defaultMenu);
      }
    }
  }, [isClient, profile?.user?.tipo_cliente, searchParams, router, toast, hasSispParams, replaceWithPreservedParams]);

  // NÃO limpa parâmetros aqui - deixa o ReciboPage fazer isso

  // Limpa o cookie 'postpay' apenas quando o usuário já está autenticado
  useEffect(() => {
    if (!isClient) return;
    if (!user) return;
    try {
      document.cookie = 'postpay=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT';
    } catch {}
  }, [isClient, user]);

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

  const handleMenuClick = (
    menuPage: string,
    params?: Record<string, string>
  ) => {
    console.log("🔷 handleMenuClick chamado:");
    console.log("  menuPage:", menuPage);
    console.log("  params recebidos:", params);
    
    // Verifica permissão para páginas exclusivas de Company
    if (profile?.user?.tipo_cliente !== 'Company') {
      if (menuPage === 'empresarial' || menuPage === 'gestaoSOAT' || menuPage === 'Empresarial') {
        toast({
          title: "Acesso Negado",
          description: "Esta página é exclusiva para empresas.",
          variant: "destructive",
        });
        return; // Bloqueia a navegação
      }
    }
    
    setIsLoading(true);
    setCurrentPage(menuPage);

    // Persistir escolha do menu para fallback em reloads
    try {
      sessionStorage.setItem("lastMenu", menuPage);
    } catch (_e) {
      // silencioso
    }

    // CRÍTICO: Verifica PRIMEIRO se há parâmetros do SISP ANTES de fazer QUALQUER coisa
    // Lê diretamente de window.location para garantir
    let hasSisp = false;
    if (typeof window !== 'undefined') {
      try {
        const urlParams = new URLSearchParams(window.location.search);
        hasSisp = urlParams.has("status_code") || 
                  urlParams.has("transaction_id") || 
                  urlParams.has("finger_print");
        if (hasSisp) {
          console.log("[BACKOFFICE] 🚨🚨🚨 PARÂMETROS SISP DETECTADOS NO handleMenuClick - BLOQUEANDO 🚨🚨🚨");
          console.log("[BACKOFFICE] URL completa:", window.location.href);
          setCurrentPage(menuPage);
          return; // NÃO faz NENHUM router.replace
        }
      } catch (error) {
        console.error("[BACKOFFICE] Erro ao verificar parâmetros no handleMenuClick:", error);
      }
    }
    
    // Fallback: verifica via searchParams
    if (!hasSisp && hasSispParams()) {
      console.log("[BACKOFFICE] 🚨 Parâmetros do SISP detectados no handleMenuClick (via searchParams) - NÃO alterando URL");
      setCurrentPage(menuPage);
      return;
    }
    
    // Só faz replace se NÃO houver parâmetros do SISP
    try {
      replaceWithPreservedParams(menuPage);
    } catch (_e) {
      // silencioso
    }

    // Armazenar parâmetros de filtro se fornecidos
    if (params) {
      console.log("✅ Definindo filterParams:", params);
      setFilterParams(params);
    } else {
      console.log("⚠️ Limpando filterParams (params undefined)");
      setFilterParams({});
    }
    console.log("📊 Estado filterParams após atualização:", params || {});

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
      <ConnectionErrorScreen />
      <ConnectionRestoredNotification />
      <TopMenu
        currentPage={currentPage}
        searchQuery={searchQuery}
        isMobile={isMobile}
        onMenuClick={handleMenuClick}
        onSearchChange={handleSearchChange}
        showSidebar={profile?.user?.tipo_cliente !== "Company"}
        onLogout={logout}
      />

      <div
        className={`flex-1 pt-16 flex flex-grow ${
          isMobile ? "flex-col" : ""
        } flex-grow`}
      >
        {isMobile && (
          <>
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
            <BottomNavigation
              activePage={currentPage}
              onNavigate={handleMenuClick}
            />
          </>
        )}

        {!isMobile && profile?.user?.tipo_cliente !== "Company" && (
          <div className="fixed left-0 top-16 h-[calc(100vh-4rem)] w-14 lg:w-16 xl:w-58 2xl:w-64">
            <Menu
              onMenuClick={handleMenuClick}
              menuItems={MainMenus}
              activePath={currentPage}
            />
          </div>
        )}
        <div
          className={`flex-1 flex flex-col relative ${
            currentPage === "Simulation"
              ? isMobile
                ? "-mt-4 pb-20" // Simulation no mobile com padding bottom
                : profile?.user?.tipo_cliente === "Company"
                ? "-mt-4" // Simulation no desktop sem sidebar (cliente empresarial)
                : "ml-14 lg:ml-16 xl:ml-60 -mt-4 xl:-mt-2 " // Simulation no desktop com sidebar
              : isMobile
              ? "pb-20" // outras páginas no mobile com padding bottom
              : profile?.user?.tipo_cliente === "Company"
              ? "" // outras páginas no desktop sem sidebar (cliente empresarial)
              : "ml-14 lg:ml-16 xl:ml-58 2xl:ml-64" // outras páginas no desktop com sidebar
          }`}
        >
          {/* Botão de Voltar para Empresarial - só para Company */}
          {profile?.user?.tipo_cliente === "Company" &&
            currentPage !== "empresarial" && (
              <BackToDashboardButton
                onClick={() => handleMenuClick("empresarial")}
                isMobile={isMobile}
                currentPage={currentPage}
              />
            )}

          <div className="flex-grow p-4">
            {isLoading ? (
              <div className="flex justify-center items-center h-full">
                <LoadingContainer fullHeight={true} message="CARREGANDO..." />
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
                    onNavigate={handleMenuClick}
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
                {currentPage === "Simulation" && (
                  <SimulationScreen 
                    onNavigateToRecibo={(reference) => {
                      console.log('🔗 Navegando para recibo:', reference);
                      handleMenuClick('recibo', { reference });
                    }}
                  />
                )}
                {currentPage === "gestaoSOAT" && profile?.user?.tipo_cliente === "Company" && <PageGestaoSOAT />}
                {currentPage === "Notificacoes" && <NotificationsPage />}
                {currentPage === "empresarial" && profile?.user?.tipo_cliente === "Company" && (
                  <Empresarial 
                    onNavigate={handleMenuClick}
                    onSelectDetailApolice={handleSelectApoliceDetail}
                    onSelectDetailSinistro={handleSelectSinistroDetail}
                  />
                )}
                {currentPage === "dashboard" && (
                  <DashboardPage onNavigate={handleMenuClick} />
                )}
                {currentPage === "recibo" && (
                  <ReciboPage
                    onSelectDetail={handleSelectMensagemDetail}
                    filterParams={filterParams}
                  />
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
      {!isMobile && <BackToTopButton />}
    </main>
  );
};

export default Page;
