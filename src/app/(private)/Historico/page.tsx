import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState, useEffect } from "react";
import FavoriteCard from "@/components/FavoriteCard";
import PaymentHistoryCard from "@/components/PaymentHistoryCard";
import InsuranceCard from "@/components/DashboardCard";
import InsuranceCard1 from "@/components/DashboardCard_1";

import IconCar from "@/assets/Icones/AliancaAuto_Icone.svg";
import IconHosp from "@/assets/Icones/AliancaIncendio_Icone.svg";
import IconMaritima from "@/assets/Icones/AliancaMaritimo_Icone.svg";
import IconHome from "@/assets/Icones/AliancaCasa_Icone.svg";
import IconPeple from "@/assets/Icones/Alianca-VidaGrupo_Icone.svg";

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

  useEffect(() => {
    const updateCardsPerPage = () => {
      const width = window.innerWidth;
      if (width < 640) setCardsPerPage(2);
      else if (width < 768) setCardsPerPage(3);
      else if (width < 1024) setCardsPerPage(3);
      else if (width < 1620) setCardsPerPage(4);
      else setCardsPerPage(5);
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

  return (
    <div className="w-full p-4 space-y-6 overflow-hidden">
      <h1 className="text-xl font-bold text-black">Favoritos</h1>

      <div className="relative">
        {/* Seta esquerda (só aparece se precisar de paginação) */}
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
              {/* Cards normais */}
              {visibleCards.map((card, index) => (
                <div key={index} className="flex-shrink-0 basis-[160px]">
                  <FavoriteCard
                    icon={card.icon}
                    title={card.title}
                    price={card.price}
                  />
                </div>
              ))}

              {/* Card de adição (SEMPRE aparece) */}
              <div className="flex-shrink-0 basis-[160px]">
                <FavoriteCard isAddCard />
              </div>
            </div>
          </div>
        </div>

        {/* Seta direita (só aparece se precisar de paginação) */}
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

      {/* Bullets (só aparecem se precisar de paginação) */}
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

      {/* Histórico */}
      <div className="py-6">
        <h1 className="text-xl font-bold text-black">Histórico de Pagamento</h1>
      </div>
      <PaymentHistoryCard />

      <section className="flex flex-col md:flex-row gap-4">
        <InsuranceCard />
        <InsuranceCard1 />
      </section>
    </div>
  );
}
