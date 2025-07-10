"use client";

import Card from "./Card";
import { LoadingScreen } from "../ui/loading-screen";
import { useProducts } from "@/hooks/useProducts";
import { FaFilter, FaSearch } from "react-icons/fa";

export default function SimulationScreen() {
  const { products, loading, error } = useProducts();

  return (
    <div className="container p-6">
      <div className="mb-8">
        <h1 className="text-xl lg:text-2xl xl:text-3xl font-bold mb-2 text-[#002256]">
          Simulação
        </h1>
        <p className="text-gray-600 mb-6">
          Faz uma simulação e encontre a agência mais próxima de você para
          atendimento presencial.
        </p>
      </div>
      {loading ? (
        <div className="flex items-center justify-center h-screen">
          <LoadingScreen />
        </div>
      ) : error ? (
        <p className="text-red-500">{error}</p>
      ) : products.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-2 py-8">
          <div className="relative">
            <FaSearch className="text-4xl text-gray-400 animate-pulse" />
            <FaFilter
              className="absolute -top-2 -right-2 text-xl text-[#2d4e7f] animate-spin-slow"
              style={{ animationDuration: "3s" }}
            />
          </div>
          <p className="text-gray-500 text-center">
            Nenhum dado encontrado!
            <br />
            Tente novamnete mas tarde.
          </p>
        </div>
      ) : (
        <div className="max-w-7xl mx-auto grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <Card key={product.productId} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
