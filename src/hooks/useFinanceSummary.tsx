/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect, useCallback } from "react";
import { useUserProfile } from "@/hooks/useUserProfile";

interface FinanceData {
  moeda: string;
  valor: number;
}

interface FinanceSummaryData {
  pago: FinanceData;
  emCobranca: FinanceData;
}

interface FinanceSummaryResponse {
  info: {
    status: number;
    errors: any;
  };
  results: FinanceSummaryData;
}

export function useFinanceSummary() {
  const [data, setData] = useState<FinanceSummaryData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { profile } = useUserProfile();

  const fetchFinanceSummary = useCallback(async () => {
    if (!profile?.user?.nif) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const apiKey = process.env.NEXT_PUBLIC_API_KEY;
      const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL_DEFAULT;

      if (!apiKey || !apiBaseUrl) {
        throw new Error("Configuração da API incompleta");
      }

      const url = `${apiBaseUrl}/dashboard/1.0.0/finance?nif=${profile.user.nif}`;

      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          ApiKey: apiKey,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message || "Erro ao buscar dados financeiros"
        );
      }

      const responseData: FinanceSummaryResponse = await response.json();

      if (responseData.info.status !== 200) {
        throw new Error("Erro na resposta da API");
      }

      setData(responseData.results);
    } catch (err) {
      console.error("Erro ao buscar dados financeiros:", err);
      setError(err instanceof Error ? err.message : "Erro desconhecido");
    } finally {
      setIsLoading(false);
    }
  }, [profile?.user?.nif]);

  useEffect(() => {
    if (profile?.user?.nif) {
      fetchFinanceSummary();
    }
  }, [fetchFinanceSummary, profile?.user?.nif]);

  return {
    data,
    isLoading,
    error,
    refetch: fetchFinanceSummary,
  };
}
