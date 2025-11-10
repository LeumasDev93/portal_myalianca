import { useState, useEffect } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../ui/tabs";
import { useProducts } from "@/hooks/useProducts";
import SimulationForm from "./Form/SimulationForm";
import ProductsTab from "./ProductsTab";
import MySimulationsTab from "./MySimulations/MySimulationsTab";
import { Product } from "@/types/typesData";
import Image from "next/image";

import { LoadingContainer } from "../ui/loading-container";
import { FaExclamationTriangle } from "react-icons/fa";

export default function SimulationScreen() {
  const { products, loading, error } = useProducts();
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [activeTab, setActiveTab] = useState("types");

  const bannerImages = [
    {
      src: "https://st2.depositphotos.com/1441511/5482/i/450/depositphotos_54821609-stock-photo-happy-man-inside-car-of.jpg",
      alt: "Driver",
      title: "Bem-Vindo",
      subtitle: "Simulador Automóvel",
    },
    {
      src: "https://www.bradescoseguros.com.br/wcm/connect/3f53cb34-1619-445b-9a9d-cba6f6445e0a/central-segunda-via-boleto-bradesco-seguros1920x280.jpg?MOD=AJPERES&CACHEID=ROOTWORKSPACE-3f53cb34-1619-445b-9a9d-cba6f6445e0a-ow7qyi9",
      alt: "Couple with car",
      title: "Financiamento Facilitado",
      subtitle: "Condições especiais para você",
    },
    {
      src: "https://www.bradescoseguros.com.br/wcm/connect/602bcf7d-dd6e-4cea-8357-dfb5ee661b85/SAUD0117_Goias_Banner_Saude_01_1920x600_V5_040625.jpg?MOD=AJPERES&CACHEID=ROOTWORKSPACE-602bcf7d-dd6e-4cea-8357-dfb5ee661b85-puZPcK0",
      alt: "Family with car",
      title: "Para Toda Família",
      subtitle: "As melhores opções para seu estilo de vida",
    },
  ];

  const handleCloseForm = () => {
    setSelectedProduct(null);
    setActiveTab("mySimulations");
  };
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) =>
        prev === bannerImages.length - 1 ? 0 : prev + 1
      );
    }, 5000);
    return () => clearInterval(interval);
  }, [bannerImages.length]);

  const nextSlide = () => {
    setCurrentSlide((prev) =>
      prev === bannerImages.length - 1 ? 0 : prev + 1
    );
  };

  const prevSlide = () => {
    setCurrentSlide((prev) =>
      prev === 0 ? bannerImages.length - 1 : prev - 1
    );
  };

  return (
    <div className="w-full min-h-screen">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        {/* Banner */}
        {!selectedProduct && (
          <div className="relative bg-[#C41E3A]  overflow-hidden h-[220px] sm:h-[270px] md:h-[300px] flex items-center">
            {bannerImages.map((image, index) => (
              <div
                key={index}
                className={`absolute inset-0 flex transition-opacity duration-500 ${
                  index === currentSlide
                    ? "opacity-100 z-10"
                    : "opacity-0 z-0 pointer-events-none"
                }`}
              >
                <div className="container w-[100%] xl:w-full h-full flex flex-col items-center justify-center mt-2 sm:mt-4 md:mt-0 font-thin text-white z-5 relative px-4 pb-20 sm:pb-24 md:pb-0">
                  <h1 className="text-base sm:text-lg md:text-2xl lg:text-4xl xl:text-5xl font-bold mb-1 sm:mb-2 text-center md:text-left">
                    {image.title}
                  </h1>
                  <h2 className="text-xs sm:text-sm md:text-lg lg:text-xl xl:text-3xl text-center md:text-left">
                    {image.subtitle}
                  </h2>
                </div>
                <Image
                  src={image.src}
                  alt={image.alt}
                  width={800}
                  height={300}
                  className="hidden md:block object-cover rounded-l-full"
                  priority={index === 0}
                />
              </div>
            ))}

            {/* Navegação do banner */}
            <button
              onClick={prevSlide}
              aria-label="Previous slide"
              className="absolute left-2 sm:left-3 top-1/2 -translate-y-1/2 bg-white/30 hover:bg-white/50 p-1 sm:p-2 rounded-full z-20"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 sm:h-6 sm:w-6 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>
            <button
              onClick={nextSlide}
              aria-label="Next slide"
              className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 bg-white/30 hover:bg-white/50 p-1 sm:p-2 rounded-full z-20"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 sm:h-6 sm:w-6 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>

            {/* Indicators */}
            <div className="absolute bottom-10 sm:bottom-6 left-1/2 -translate-x-1/2 flex space-x-1 sm:space-x-2 z-10">
              {bannerImages.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentSlide(i)}
                  className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full ${
                    i === currentSlide ? "bg-white" : "bg-white/50"
                  }`}
                  aria-label={`Go to slide ${i + 1}`}
                />
              ))}
            </div>

            {/* Tabs responsivos - visíveis em todas as telas */}
            <TabsList className="absolute bottom-0 sm:bottom-2 left-2 right-2 lg:left-2 lg:right-auto flex z-10 bg-transparent space-x-1 lg:space-x-2">
              <TabsTrigger
                value="types"
                className="flex items-center justify-center bg-gray-200 hover:bg-gray-300 text-[#002B5B] font-bold text-xs lg:text-lg w-1/2 lg:w-64 p-2 lg:px-6 lg:py-4 rounded-b-none rounded-t-xl 
       data-[state=active]:bg-[#002B5B] data-[state=active]:text-white"
              >
                Simulador
              </TabsTrigger>
              <TabsTrigger
                value="mySimulations"
                className="flex items-center justify-center bg-gray-200 hover:bg-gray-300 text-[#002B5B] font-bold text-xs lg:text-lg w-1/2 lg:w-64 p-2 lg:px-6 lg:py-4 rounded-t-xl rounded-b-none
       data-[state=active]:bg-[#002B5B] data-[state=active]:text-white"
              >
                Minhas Simulações
              </TabsTrigger>
            </TabsList>

            {/* Barra azul por cima de tudo */}
            <div className="absolute bottom-0 left-0 right-0 h-1 md:h-2 bg-[#002B5B] z-20"></div>
          </div>
        )}
        <TabsContent
          value="types"
          className="bg-white flex flex-col rounded-b-lg shadow-xl px-3 sm:px-4 md:px-6 xl:p-8 py-6 sm:py-8 md:py-10"
        >
          {selectedProduct ? (
            <SimulationForm
              productId={selectedProduct.productId}
              onClose={() => setSelectedProduct(null)}
              reset={handleCloseForm}
            />
          ) : (
            <>
              <p className="text-[#002256] mb-4 sm:mb-6 text-left text-sm sm:text-base">
                Escolha um Produto e faça uma simulação.
              </p>

              {loading && (
                <LoadingContainer message="CARREGANDO SIMULAÇÕES..." />
              )}
              {error && (
                <div className="flex items-center gap-2 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-4">
                  <FaExclamationTriangle className="h-5 w-5 text-red-600" />
                  <p className="text-sm font-medium">
                    Erro ao carregar os produtos. Tente novamente mais tarde.
                  </p>
                </div>
              )}

              {products && products.length > 0 && (
                <ProductsTab
                  loading={loading}
                  error={error}
                  products={products}
                  onSelect={setSelectedProduct}
                />
              )}
            </>
          )}
        </TabsContent>

        <TabsContent
          value="mySimulations"
          className="bg-white rounded-lg shadow-xl p-3 sm:p-4 md:p-6 xl:p-8"
        >
          <MySimulationsTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
