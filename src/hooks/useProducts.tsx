/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from "react";

// types/Product.ts
export interface Product {
  name: string;
  description: string;
  category: string;
  mainProduct: boolean;
  icon: string;
  parentProductId: string | null;
  active: boolean;
  productId: string;
}

interface ApiResponse<T> {
  info: {
    count: number;
    page: number;
    status: number;
    errors: string[] | null;
  };
  results: T[] | null;
}
export function useProducts() {
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

        if (!res.ok) throw new Error("Erro na resposta da API");

        const data: ApiResponse<Product> = await res.json();

        if (data.info.errors || !data.results) {
          throw new Error(data.info.errors?.[0] || "Erro desconhecido");
        }

        setProducts(data.results);
      } catch (err) {
        console.error("Erro ao buscar produtos:", err);
        setError("Erro ao buscar produtos");
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  return { products, loading, error };
}
