/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { LuSquareKanban } from "react-icons/lu";
import { IoCalculatorOutline } from "react-icons/io5";
import { FaExclamationTriangle } from "react-icons/fa";

import FavoriteCard from "@/components/FavoriteCard";
import HistoryTable from "@/components/Historico/HistoryTable";
import AtivitysLastCard from "@/components/AtivitysLastCard";
import { DashboardCharts } from "@/components/Historico/DashboartdCharts";

import IconCar from "@/assets/Icones/AliancaAuto_Icone.svg";
import IconHosp from "@/assets/Icones/AliancaIncendio_Icone.svg";
import IconMaritima from "@/assets/Icones/AliancaMaritimo_Icone.svg";

type CardData = {
  icon: any;
  title: string;
  status: string;
  quantity: number;
};

const cardsData: CardData[] = [
  {
    icon: IconCar,
    title: "Sinistros Abertos",
    status: "Em processamento",
    quantity: 1,
  },
  {
    icon: IconHosp,
    title: "Pagamentos Pendentes",
    status: "Próximo vencimento em 5 dias",
    quantity: 2,
  },
  {
    icon: IconMaritima,
    title: "Apólices Ativas",
    status: "+1 desde o último mês",
    quantity: 3,
  },
];

type HistoricoPageProps = {
  onNewSinistro: () => void;
  onOpenSimulator: () => void;
  onSelectDetail: () => void;
};

export default function Historico({
  onNewSinistro,
  onOpenSimulator,
  onSelectDetail,
}: HistoricoPageProps) {
  const [cardsPerPage, setCardsPerPage] = useState(5);
  const [specialCardsPerPage, setSpecialCardsPerPage] = useState(3); // Default para desktop
  const [currentPage, setCurrentPage] = useState(0);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const updateLayout = () => {
      const width = window.innerWidth;
      const mobile = width < 768;
      setIsMobile(mobile);

      if (mobile) {
        setCardsPerPage(2); // Mobile mostra 2 cards normais por página
        setSpecialCardsPerPage(2); // Mobile mostra cards especiais 2 a 2
      } else if (width < 1024) {
        setCardsPerPage(3); // Tablet mostra 4 cards
        setSpecialCardsPerPage(3); // Tablet mostra todos cards especiais juntos
      } else if (width < 1920) {
        setCardsPerPage(3); // Tablet mostra 4 cards
        setSpecialCardsPerPage(3); // Tablet mostra todos cards especiais juntos
      } else {
        setCardsPerPage(5); // Desktop mostra 5 cards
        setSpecialCardsPerPage(3); // Desktop mostra todos cards especiais juntos
      }
    };

    updateLayout();
    window.addEventListener("resize", updateLayout);
    return () => window.removeEventListener("resize", updateLayout);
  }, []);

  // Organiza os cards em páginas
  const organizePages = () => {
    const allCards = [...cardsData];
    const pages: (
      | CardData
      | "simulator"
      | "ocorrencias"
      | "gestao"
      | "addCard"
    )[][] = [];
    const specialCards: Array<"gestao" | "ocorrencias" | "simulator"> = [
      "gestao",
      "ocorrencias",
      "simulator",
    ];

    // Páginas de cards especiais (2 a 2 no mobile)
    for (let i = 0; i < specialCards.length; i += specialCardsPerPage) {
      const specialPage: (
        | CardData
        | "simulator"
        | "ocorrencias"
        | "gestao"
        | "addCard"
      )[] = specialCards.slice(i, i + specialCardsPerPage);

      // Adiciona cards normais se houver espaço
      const remainingSlots = cardsPerPage - specialPage.length;
      if (remainingSlots > 0) {
        specialPage.push(...allCards.splice(0, remainingSlots));
      }

      pages.push(specialPage);
    }

    // Páginas de cards normais
    for (let i = 0; i < allCards.length; i += cardsPerPage) {
      pages.push(allCards.slice(i, i + cardsPerPage));
    }

    // Adiciona o card "add" na última página se houver espaço
    const lastPage = pages[pages.length - 1];
    if (lastPage.length < cardsPerPage) {
      lastPage.push("addCard");
    } else {
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

  const renderCard = (item: any, index: number) => {
    if (item === "simulator") {
      return (
        <div
          key={"simulator"}
          className="flex flex-col items-center justify-between bg-blue-100 border border-[#002855] rounded-xl w-32 h-32 xl:h-40 sm:w-[200px] xl:w-[270px] px-4 py-6 xl:py-8 cursor-pointer hover:bg-blue-50 transition-colors"
        >
          <div className="w-full flex justify-between items-start">
            <div>
              <h3 className="text-xs xl:text-lg text-[#002855] font-semibold">
                Simulador
              </h3>
              <span className="text-[10px] xl:text-sm text-[#002855]">
                Calcule Valores de seguros
              </span>
            </div>
            <IoCalculatorOutline className="text-[#002855] size-4 xl:size-6" />
          </div>
          <button
            onClick={() => {
              onOpenSimulator();
            }}
            className="w-full cursor-pointer bg-[#002855] hover:bg-[#002855]/70 py-1 xl:px-4 rounded-lg text-white text-center text-xs xl:text-base transition-colors"
          >
            Simular Agora
          </button>
        </div>
      );
    }
    if (item === "gestao") {
      return (
        <div
          key={"gestao"}
          className="flex flex-col items-center justify-between bg-blue-50 border border-blue-200 rounded-xl w-32 h-32 xl:h-40 sm:w-[200px] xl:w-[270px] px-4 py-6 xl:py-8 cursor-pointer hover:bg-blue-100 transition-colors duration-300 shadow-sm hover:shadow-md"
        >
          <div className="w-full flex justify-between items-start">
            <div>
              <h3 className="text-[10px] sm:text-xs xl:text-lg text-blue-900 font-semibold">
                Gestão de SOAT
              </h3>
              <span className="text-[10px] xl:text-sm text-blue-900/80">
                Gerencie seus seguros
              </span>
            </div>
            <LuSquareKanban className="text-blue-800 size-4 xl:size-6" />
          </div>
          <button
            onClick={(e) => e.stopPropagation()}
            className="w-full bg-blue-900 hover:bg-blue-900/70 py-1 xl:px-4 rounded-lg text-white text-center text-xs xl:text-base cursor-pointer transition-colors duration-200 flex items-center justify-center gap-1"
          >
            <span>Acessar</span>
          </button>
        </div>
      );
    }
    if (item === "ocorrencias") {
      return (
        <div
          key={"ocorrencias"}
          className="flex flex-col items-center justify-between bg-red-50 border border-red-800 rounded-xl w-32 h-32 xl:h-40 sm:w-[200px] xl:w-[270px] px-4 py-6 xl:py-8 cursor-pointer hover:bg-red-100 transition-colors"
        >
          <div className="w-full flex justify-between items-start">
            <div>
              <h3 className="text-xs xl:text-lg text-red-700 font-semibold">
                Ocorrências
              </h3>
              <span className="text-[10px] xl:text-sm text-red-700">
                Verifique suas ocorrências
              </span>
            </div>
            <FaExclamationTriangle className="text-red-800 size-4 xl:size-6" />
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onNewSinistro();
            }}
            className="w-full bg-red-700 hover:bg-red-800/70 py-1 xl:px-4 rounded-lg text-white text-center text-xs xl:text-base cursor-pointer"
          >
            Acessar
          </button>
        </div>
      );
    }
    if (item === "addCard") {
      return <FavoriteCard key={"addCard"} isAddCard />;
    }
    return (
      <FavoriteCard
        key={index}
        icon={item.icon}
        title={item.title}
        status={item.status}
        quantity={item.quantity}
      />
    );
  };

  return (
    <div className="p-4 w-full">
      <h1 className="text-xl font-bold text-black">Acesso Rápido</h1>

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
        <h2 className="text-lg xl:text-xl font-bold text-gray-800 mb-4">
          Histórico
        </h2>
        <div className="flex flex-col lg:flex-row gap-4">
          <div
            className="w-full lg:w-[65%] xl:w-[70%] overflow-auto"
            style={{ minHeight: "400px", maxHeight: "650px" }}
          >
            <HistoryTable onSelectDetail={onSelectDetail} />
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
