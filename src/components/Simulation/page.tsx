/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
// components/SimulationScreen.tsx
"use client";

import { useEffect, useState } from "react";
import Card from "./Card";
import { LoadingScreen } from "../ui/loading-screen";

// types/Product.ts
export interface Product {
  productId: string;
  name: string;
  description: string;
  category: string;
  mainProduct: boolean;
  icon: string;
  parentProductId: string | null;
  active: boolean;
}

export default function SimulationScreen() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const apiUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL_SIMULATOR}/simulador/1.0.0/products`;
  const apiToken = process.env.API_SECRET_TOKEN;

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch(apiUrl, {
          headers: {
            Authorization: `Bearer ${apiToken}`,
            ApiKey: process.env.NEXT_PUBLIC_API_KEY || "",
          },
        });

        const data = await res.json();
        setProducts(data);
      } catch (error) {
        setError("Erro ao buscar produtos");
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

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
        <LoadingScreen />
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
          {products.map((product) => (
            <Card key={product.productId} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
