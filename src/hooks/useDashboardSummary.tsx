/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect, useCallback } from "react";
import { useUserProfile } from "@/hooks/useUserProfile";

interface DashboardSummaryData {
  totalApolice: number;
  totalSinistro: number;
}

interface DashboardSummaryResponse {
  info: {
    status: number;
    errors: any;
  };
  results: DashboardSummaryData;
}

export function useDashboardSummary() {
  const [data, setData] = useState<DashboardSummaryData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { profile } = useUserProfile();

  const fetchDashboardSummary = useCallback(async () => {
    if (!profile?.user?.nif) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(`/api/dashboard/summary?nif=${encodeURIComponent(profile.user.nif)}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error || "Erro ao buscar dados do dashboard"
        );
      }

      const responseData: DashboardSummaryResponse = await response.json();

      if (responseData.info.status !== 200) {
        throw new Error("Erro na resposta da API");
      }

      setData(responseData.results);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro desconhecido");
    } finally {
      setIsLoading(false);
    }
  }, [profile?.user?.nif]);

  useEffect(() => {
    if (profile?.user?.nif) {
      fetchDashboardSummary();
    }
  }, [fetchDashboardSummary, profile?.user?.nif]);

  return {
    data,
    isLoading,
    error,
    refetch: fetchDashboardSummary,
  };
}
