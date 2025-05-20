/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState, useEffect } from "react";
import FavoriteCard from "@/components/FavoriteCard";
import PaymentHistoryCard from "@/components/PaymentHistoryCard";
import AtivitysLastCard from "@/components/AtivitysLastCard";

import IconCar from "@/assets/Icones/AliancaAuto_Icone.svg";
import IconHosp from "@/assets/Icones/AliancaIncendio_Icone.svg";
import IconMaritima from "@/assets/Icones/AliancaMaritimo_Icone.svg";
import IconHome from "@/assets/Icones/AliancaCasa_Icone.svg";
import IconPeple from "@/assets/Icones/Alianca-VidaGrupo_Icone.svg";
import { MdCalculate } from "react-icons/md";
import { DashboardCharts } from "@/components/DashboartdCharts";

const cardsData = [
  { icon: IconCar, title: "Aliança Auto", price: "1000 ECV" },
  { icon: IconHosp, title: "Seguro de Incendio", price: "3500 ECV" },
  { icon: IconMaritima, title: "Seguro Maritimo", price: "4000 ECV" },
  { icon: IconHome, title: "Seguro Residencial", price: "2500 ECV" },
  { icon: IconPeple, title: "Seguro de Vida", price: "1000 ECV" },
];

export default function Historico() {
  const [currentPage, setCurrentPage] = useState(0);
  const [cardsPerPage, setCardsPerPage] = useState(1);
  const [isCollapsed, setIsCollapsed] = useState(false);

  useEffect(() => {
    const updateCardsPerPage = () => {
      const width = window.innerWidth;
      if (width < 640) setCardsPerPage(2); // Mobile
      else if (width < 768) setCardsPerPage(2); // Tablet pequeno
      else if (width < 1024) setCardsPerPage(3); // Tablet grande
      else if (width < 1920) setCardsPerPage(4); // Desktop
      else setCardsPerPage(5); // Grandes telas
    };

    updateCardsPerPage();
    window.addEventListener("resize", updateCardsPerPage);

    return () => window.removeEventListener("resize", updateCardsPerPage);
  }, []);

  // Calcula se precisa de paginação
  const needsPagination = cardsData.length > cardsPerPage;
  const totalPages = Math.ceil(cardsData.length / cardsPerPage);

  // Pega os cards visíveis (se precisar de paginação)
  const start = currentPage * cardsPerPage;
  const visibleCards = needsPagination
    ? cardsData.slice(start, start + cardsPerPage - 1) // Deixa espaço para o card de adição
    : cardsData;

  useEffect(() => {
    let interval: NodeJS.Timeout;

    const isMobile = window.innerWidth < 640;

    if (isMobile && needsPagination) {
      interval = setInterval(() => {
        setCurrentPage((prev) => {
          // Avança para a próxima página ou volta à primeira
          return prev >= totalPages - 1 ? 0 : prev + 1;
        });
      }, 10000); // 10 segundos
    }

    return () => clearInterval(interval);
  }, [needsPagination, totalPages]);

  return (
    <div className="w-full p-4 overflow-hidden">
      <h1 className="text-xl font-bold text-black">Acesso Rápido</h1>

      <div className="relative">
        {needsPagination && (
          <button
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 0))}
            disabled={currentPage === 0}
            className="absolute -left-4 sm:left-0 top-1/2 transform -translate-y-1/2 bg-white p-1 sm:p-2 rounded-full shadow z-10 disabled:opacity-30"
          >
            <ChevronLeft />
          </button>
        )}

        <div className="overflow-hidden w-full py-10">
          <div className="flex justify-center">
            <div className="flex gap-2 sm:gap-4">
              <div className=" hidden sm:flex flex-col items-center justify-center cursor-pointer space-y-2 bg-[#002855] rounded-xl w-32 h-32 sm:h-40 sm:w-40 xl:w-52">
                <div className="flex items-center justify-center bg-white rounded-full p-2 lg:p-3">
                  <MdCalculate className="text-[#002855] size-8 sm:size-8" />
                </div>
                <h3 className="text-xs xl:text-sm text-white font-semibold text-center leading-tight">
                  Seguros Aliança
                </h3>
                <div className="sm:w-[80%] w-[100%] flex items-center justify-center bg-red-800 py-2 px-4 rounded-full my-2">
                  <p className="text-xs lg-text-lg text-white text-center">
                    Fazer simulação
                  </p>
                </div>
              </div>
              {visibleCards.map((card, index) => (
                <div key={index} className="flex-shrink-0 basis-[160px]">
                  <FavoriteCard
                    icon={card.icon}
                    title={card.title}
                    price={card.price}
                  />
                </div>
              ))}

              <div className="flex-shrink-0 basis-[160px]">
                <FavoriteCard isAddCard />
              </div>
            </div>
          </div>
        </div>

        {needsPagination && (
          <button
            onClick={() =>
              setCurrentPage((prev) => Math.min(prev + 1, totalPages - 1))
            }
            disabled={currentPage >= totalPages - 1}
            className="absolute -right-4 sm:right-0 top-1/2 transform -translate-y-1/2 bg-white p-1 sm:p-2 rounded-full shadow z-10 disabled:opacity-30"
          >
            <ChevronRight />
          </button>
        )}
      </div>

      {needsPagination && (
        <div className="flex justify-center gap-2">
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

      <div className="py-4 sm:py-6 w-full">
        <h1 className="text-lg xl:text-xl font-bold text-gray-800 mb-2 sm:mb-4">
          Histórico
        </h1>
        <div className="flex flex-col lg:flex-row gap-4 w-full items-stretch">
          <div
            className={`w-full ${
              isCollapsed ? "lg:w-[65%]" : "lg:w-[65%]"
            } xl:w-[70%] min-w-0 overflow-auto`}
            style={{
              minHeight: "400px",
              maxHeight: "650px",
            }}
          >
            <PaymentHistoryCard />
          </div>

          <div
            className={`${
              isCollapsed ? "lg:w-[35%]" : "lg:w-[35%]"
            } xl:w-[30%] min-w-0 h-full`}
            style={{
              minHeight: "400px",
              maxHeight: "650px",
            }}
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
