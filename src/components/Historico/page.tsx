/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { IoCalculatorOutline } from "react-icons/io5";

import FavoriteCard from "@/components/FavoriteCard";
import PaymentHistoryCard from "@/components/PaymentHistoryCard";
import AtivitysLastCard from "@/components/AtivitysLastCard";
import { DashboardCharts } from "@/components/DashboartdCharts";

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
  {
    icon: IconMaritima,
    title: "Apólices Ativas",
    status: "+1 desde o último mês",
    quantity: 3,
  },
  {
    icon: IconMaritima,
    title: "Apólices Ativas",
    status: "+1 desde o último mês",
    quantity: 3,
  },
];

export default function Historico() {
  const [cardsPerPage, setCardsPerPage] = useState(1);
  const [currentPage, setCurrentPage] = useState(0);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const updateLayout = () => {
      const width = window.innerWidth;
      setIsMobile(width < 801);
      if (width < 640) setCardsPerPage(1);
      else if (width < 1024) setCardsPerPage(2);
      else if (width < 1920) setCardsPerPage(3);
      else setCardsPerPage(4);
    };

    updateLayout();
    window.addEventListener("resize", updateLayout);
    return () => window.removeEventListener("resize", updateLayout);
  }, []);

  // Construção das páginas com lógica de simulador e addCard
  const allCards = [...cardsData];
  const pages: (CardData | "simulator" | "addCard")[][] = [];

  for (let i = 0; i < allCards.length; i += cardsPerPage) {
    pages.push(allCards.slice(i, i + cardsPerPage));
  }

  // Inserir simulador na primeira página
  if (pages.length > 0) {
    pages[0].unshift("simulator");
  } else {
    pages.push(["simulator"]);
  }

  // Garantir addCard na última página
  const lastPageIndex = pages.length - 1;
  const lastPage = pages[lastPageIndex];

  if (lastPage.length < cardsPerPage) {
    pages[lastPageIndex].push("addCard");
  } else {
    pages.push(["addCard"]);
  }

  const totalPages = pages.length;
  const isFirstPage = currentPage === 0;
  const isLastPage = currentPage === totalPages - 1;
  const needsPagination = totalPages > 1;

  // Auto slide apenas em mobile
  useEffect(() => {
    if (!isMobile || !needsPagination) return;
    const interval = setInterval(() => {
      setCurrentPage((prev) => (prev >= totalPages - 1 ? 0 : prev + 1));
    }, 10000);
    return () => clearInterval(interval);
  }, [isMobile, needsPagination, totalPages]);

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
              {pages[currentPage].map((item, index) => {
                if (item === "simulator") {
                  return (
                    <div
                      key={"simulator"}
                      className="flex flex-col items-center justify-between bg-blue-100 border border-[#002855] rounded-xl w-32 h-32 xl:h-40 sm:w-[200px] xl:w-[270px] px-4 py-6 xl:py-8"
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
                      <div className="w-full bg-[#002855] py-1 xl:px-4 rounded-lg text-white text-center text-xs xl:text-base">
                        Simular Agora
                      </div>
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
              })}
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
            <PaymentHistoryCard />
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
