/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import QuickAccessCard from "@/components/Layout/QuickAccessCard";
import { useQuickAccess } from "@/hooks/useQuickAccess";
import {
  FaUsers,
  FaShieldAlt,
  FaCar,
  FaDollarSign,
  FaMapMarkerAlt,
  FaExclamationTriangle,
} from "react-icons/fa";
import {
  StatisticsCard,
  StatisticData,
} from "@/components/dashboardEmpresarial/components/StatisticsCard";
import {
  MenuCard,
  MenuData,
} from "@/components/dashboardEmpresarial/components/MenuCard";
import {
  IoGrid,
  IoShieldCheckmarkSharp,
  IoReceiptSharp,
} from "react-icons/io5";
import { TbTopologyStar3 } from "react-icons/tb";
import { AiFillFileExclamation } from "react-icons/ai";
import { LuSquareKanban } from "react-icons/lu";

type DashboardEmpresarialProps = {
  onNavigate?: (page: string) => void;
};

export default function DashboardEmpresarial({
  onNavigate,
}: DashboardEmpresarialProps) {
  const [cardsPerPage, setCardsPerPage] = useState(5);
  const [currentPage, setCurrentPage] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const { quickAccessItems, refetch } = useQuickAccess();

  // Dados das estatísticas empresariais
  const statisticsData: StatisticData[] = [
    {
      title: "Funcionários Segurados",
      amount: "245",
      description: "+12% em relação ao mês anterior",
      icon: FaUsers,
      color: "blue",
    },
    {
      title: "Apólices Ativas",
      amount: "18",
      description: "Cobertura completa",
      icon: FaShieldAlt,
      color: "blue",
    },
    {
      title: "SOATs Ativos",
      amount: "32",
      description: "Frota empresarial",
      icon: FaCar,
      color: "blue",
    },
    {
      title: "Economia Mensal",
      amount: "12.450 ECV",
      description: "Benefícios corporativos",
      icon: FaDollarSign,
      color: "blue",
    },
  ];

  // Dados dos menus do portal (exatos do sistema, mesma cor para todos)
  const portalMenus: MenuData[] = [
    {
      title: "Gestão de SOAT",
      description: "Gerencie SOAT dos trabalhadores",
      icon: LuSquareKanban,
      path: "gestaoSOAT",
    },
    {
      title: "Histórico",
      description: "Visualize apólices, sinistros e recibos",
      icon: IoGrid,
      path: "Historico",
    },
    {
      title: "Apólice",
      description: "Gerencie suas apólices ativas",
      icon: IoShieldCheckmarkSharp,
      path: "apolice",
    },
    {
      title: "Sinistros",
      description: "Acompanhe sinistros registrados",
      icon: FaExclamationTriangle,
      path: "sinistro",
    },
    {
      title: "Recibos & Pagamentos",
      description: "Visualize e pague recibos",
      icon: IoReceiptSharp,
      path: "recibo",
    },
    {
      title: "Ocorrências",
      description: "Registre novas ocorrências",
      icon: AiFillFileExclamation,
      path: "ocorrencias",
    },
    {
      title: "Simular & Contratar",
      description: "Simule e contrate seguros",
      icon: TbTopologyStar3,
      path: "Simulation",
    },
    {
      title: "Agências",
      description: "Encontre agências próximas",
      icon: FaMapMarkerAlt,
      path: "Agencias",
    },
  ];

  useEffect(() => {
    const updateCardsPerPage = () => {
      const width = window.innerWidth;
      if (width >= 1536) {
        setCardsPerPage(6);
      } else if (width >= 1280) {
        setCardsPerPage(5);
      } else if (width >= 1024) {
        setCardsPerPage(4);
      } else if (width >= 640) {
        setCardsPerPage(3);
      } else {
        setCardsPerPage(1);
      }
      setIsMobile(width < 768);
    };

    updateCardsPerPage();
    window.addEventListener("resize", updateCardsPerPage);
    return () => window.removeEventListener("resize", updateCardsPerPage);
  }, []);

  const organizePages = () => {
    const pages: any[][] = [];

    // Adiciona cards de acesso rápido da API e ordena pelo order_number
    const quickAccessCards = quickAccessItems
      .map((item) => ({
        type: "quickAccess" as const,
        data: item,
      }))
      .sort((a, b) => (a.data.order_number || 0) - (b.data.order_number || 0));

    // Páginas de cards de acesso rápido da API
    for (let i = 0; i < quickAccessCards.length; i += cardsPerPage) {
      pages.push(quickAccessCards.slice(i, i + cardsPerPage));
    }

    // Adiciona o card "add" na última página se houver espaço
    if (pages.length > 0) {
      const lastPage = pages[pages.length - 1];
      if (lastPage.length < cardsPerPage) {
        lastPage.push("addCard");
      } else {
        pages.push(["addCard"]);
      }
    } else {
      // Se não há cards da API, cria uma página apenas com o card "add"
      pages.push(["addCard"]);
    }

    return pages;
  };

  const pages = organizePages();
  const totalPages = pages.length;
  const isFirstPage = currentPage === 0;
  const isLastPage = currentPage === totalPages - 1;
  const needsPagination = totalPages > 1;

  // Auto slide apenas em mobile
  useEffect(() => {
    if (!isMobile || !needsPagination) return;
    const interval = setInterval(() => {
      setCurrentPage((prev) => (prev >= totalPages - 1 ? 0 : prev + 1));
    }, 8000);
    return () => clearInterval(interval);
  }, [isMobile, needsPagination, totalPages]);

  const renderCard = (item: any) => {
    // Renderiza cards de acesso rápido da API
    if (item && typeof item === "object" && item.type === "quickAccess") {
      return (
        <QuickAccessCard
          key={item.data.id}
          id={item.data.id}
          nome={item.data.nome}
          titulo={item.data.titulo}
          icone={item.data.icone}
          bg_color={item.data.bg_color}
          text_color={item.data.text_color}
          border_color={item.data.border_color}
          bg_botton_color={item.data.bg_botton_color}
          icon_color={item.data.icon_color}
          order_number={item.data.order_number}
          descricao_botao={item.data.descricao_botao}
          onClick={() => {
            if (item.data.link && onNavigate) {
              onNavigate(item.data.link);
            }
          }}
          onDelete={refetch}
        />
      );
    }

    if (item === "addCard") {
      return (
        <QuickAccessCard
          key={"addCard"}
          isAddCard
          onItemAdded={refetch}
          existingItems={quickAccessItems}
        />
      );
    }

    return null;
  };

  return (
    <div className="p-4 w-full">
      {/* Seção de Acesso Rápido */}
      <div className="mt-8">
        <h2 className="text-xl font-bold text-[#002856] mb-4">Acesso Rápido</h2>

        <div className="relative">
          {needsPagination && (
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 0))}
              disabled={isFirstPage}
              className="absolute -left-4 top-1/2 transform -translate-y-1/2 bg-white p-2 rounded-full shadow z-10 disabled:opacity-30"
            >
              <ChevronLeft />
            </button>
          )}

          <div className="overflow-hidden w-full py-10">
            <div className="flex justify-center">
              <div className="flex gap-4 items-center">
                {pages[currentPage]?.map((item: any, index: number) => (
                  <div key={index}>{renderCard(item)}</div>
                ))}
              </div>
            </div>
          </div>

          {needsPagination && (
            <button
              onClick={() =>
                setCurrentPage((prev) => Math.min(prev + 1, totalPages - 1))
              }
              disabled={isLastPage}
              className="absolute -right-4 top-1/2 transform -translate-y-1/2 bg-white p-2 rounded-full shadow z-10 disabled:opacity-30"
            >
              <ChevronRight />
            </button>
          )}
        </div>

        {needsPagination && (
          <div className="flex justify-center gap-2 mt-2">
            {Array.from({ length: totalPages }).map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentPage(index)}
                className={`w-2 h-2 rounded-full ${
                  currentPage === index ? "bg-blue-900" : "bg-gray-300"
                }`}
              />
            ))}
          </div>
        )}
      </div>
      <h1 className="text-2xl font-bold text-[#002256] mb-6">
        Dashboard Empresarial
      </h1>

      {/* Cards de Estatísticas */}
      <StatisticsCard statistics={statisticsData} />

      {/* Seção de Menus do Portal */}
      <div className="mt-8">
        <h2 className="text-xl font-bold text-[#002856] mb-6">
          Menus do Portal
        </h2>

        <MenuCard menus={portalMenus} onNavigate={onNavigate} />
      </div>
    </div>
  );
}
