/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

import QuickAccessCard from "@/components/Layout/QuickAccessCard";
import HistoryTable from "@/components/Historico/table/HistoryTable";
import AtivitysLastCard from "@/components/Layout/AtivitysLastCard";
import { useQuickAccess } from "@/hooks/useQuickAccess";

import IconCar from "@/assets/Icones/AliancaAuto_Icone.svg";
import IconHosp from "@/assets/Icones/AliancaIncendio_Icone.svg";
import IconMaritima from "@/assets/Icones/AliancaMaritimo_Icone.svg";
import { DashboardCharts } from "./Charts/DashboartdCharts";
import { useUserProfile } from "@/hooks/useUserProfile";

type CardData = {
  icon: any;
  title: string;
  status: string;
  quantity: number;
};

const cardsData: CardData[] = [];

type HistoricoPageProps = {
  onNewSinistro: () => void;
  onOpenSimulator: () => void;
  onSelectDetailApolice: (id: string, contractNumber: string) => void;
  onSelectDetailSinistro: (id: string) => void;
  onNavigate?: (page: string) => void;
};

export default function Historico({
  onNewSinistro,
  onOpenSimulator,
  onSelectDetailApolice,
  onSelectDetailSinistro,
  onNavigate,
}: HistoricoPageProps) {
  const [cardsPerPage, setCardsPerPage] = useState(5);
  const [currentPage, setCurrentPage] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const {
    quickAccessItems,
    isLoading: isLoadingQuickAccess,
    refetch,
  } = useQuickAccess();
  const { profile } = useUserProfile();

  useEffect(() => {
    const updateLayout = () => {
      const width = window.innerWidth;
      const mobile = width < 768;
      setIsMobile(mobile);

      if (mobile) {
        setCardsPerPage(1); // Mobile mostra 2 cards por página
      } else if (width < 1024) {
        setCardsPerPage(3); // Tablet mostra 3 cards por página
      } else if (width < 1920) {
        setCardsPerPage(3); // Desktop menor mostra 3 cards por página
      } else {
        setCardsPerPage(5); // Desktop grande mostra 5 cards por página
      }
    };

    updateLayout();
    window.addEventListener("resize", updateLayout);
    return () => window.removeEventListener("resize", updateLayout);
  }, []);

  // Organiza os cards em páginas
  const organizePages = () => {
    type PageItem = CardData | "addCard" | { type: "quickAccess"; data: any };
    const pages: PageItem[][] = [];

    // Lista de todos os menus disponíveis (baseado no QuickAccessModal)
    const allAvailableMenus = [
      "Histórico",
      "Apólice",
      "Sinistros",
      "Recibos & Pagamentos",
      "Ocorrências",
      "Simular & Contratar",
      "Agências",
    ];

    // Filtrar cards de acesso rápido baseado no tipo de usuário
    const filteredQuickAccessItems = quickAccessItems.filter((item) => {
      // Se o usuário não for "Company", esconder o card "Gestão de SOAT"
      if (
        profile?.user?.tipo_cliente !== "Company" &&
        item.link === "gestaoSOAT"
      ) {
        return false;
      }
      return true;
    });

    // Verifica se todos os menus disponíveis estão adicionados (usando itens filtrados)
    const addedMenuNames = filteredQuickAccessItems.map((item) => item.nome);
    const allMenusAdded = allAvailableMenus.every((menuName) =>
      addedMenuNames.includes(menuName)
    );

    // Adiciona cards de acesso rápido da API e ordena pelo order_number (usando itens filtrados)
    const quickAccessCards = filteredQuickAccessItems
      .map((item) => ({
        type: "quickAccess" as const,
        data: item,
      }))
      .sort((a, b) => (a.data.order_number || 0) - (b.data.order_number || 0));

    // Páginas de cards de acesso rápido da API
    for (let i = 0; i < quickAccessCards.length; i += cardsPerPage) {
      pages.push(quickAccessCards.slice(i, i + cardsPerPage));
    }

    // Só adiciona o card "add" se nem todos os menus estiverem adicionados
    if (!allMenusAdded) {
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

  const renderCard = (item: any, index: number) => {
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
          hideDelete={
            item.data.link === "gestaoSOAT" ||
            item.data.link === "ocorrencias" ||
            item.data.link === "Simulation"
          }
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

    return (
      <QuickAccessCard
        key={index}
        nome={item.title}
        titulo={item.status}
        descricao_botao={item.quantity?.toString() || ""}
      />
    );
  };

  return (
    <div className="p-4 w-full mt-6">
      <h1 className="text-xl font-bold text-[#002856]">Acesso Rápido</h1>

      <div className="relative mt-4">
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
              {pages[currentPage].map((item, index) => renderCard(item, index))}
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

      <div className="py-6">
        <h1 className="text-xl font-bold text-[#002856]">Histórico</h1>
        <div className="flex flex-col lg:flex-row gap-4">
          <div
            className="w-full lg:w-[65%] xl:w-[70%] overflow-auto"
            style={{ minHeight: "400px", maxHeight: "650px" }}
          >
            <HistoryTable
              onSelectDetailApolice={onSelectDetailApolice}
              onSelectDetailSinistro={onSelectDetailSinistro}
            />
          </div>
          <div
            className="w-full lg:w-[35%] xl:w-[30%]"
            style={{ minHeight: "400px", maxHeight: "650px" }}
          >
            <DashboardCharts />
          </div>
        </div>
      </div>

      <section className="flex flex-col md:flex-row gap-4">
        <AtivitysLastCard />
      </section>
    </div>
  );
}
