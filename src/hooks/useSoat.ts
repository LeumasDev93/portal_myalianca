/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect, useCallback } from 'react';
import { SoatData, SoatApiResponse } from '@/types/typesData';
import { useUserProfile } from './useUserProfile';

export const useSoat = () => {
  const [soatData, setSoatData] = useState<SoatData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { profile } = useUserProfile();

  const userId = profile?.user?.id;

  const fetchSoatData = useCallback(async () => {
    if (!userId || userId.trim() === '') {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      // Chamar API route do servidor
      const response = await fetch(`/api/soat?userId=${encodeURIComponent(userId)}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const data: SoatApiResponse = await response.json();
      
      if (data.info.status === 200) {
        const sortedData = data.results.sort((a: any, b: any) => {
          const dateA = new Date(a.data_criacao);
          const dateB = new Date(b.data_criacao);
          return dateB.getTime() - dateA.getTime();
        });
        setSoatData(sortedData);
      } else {
        setError(`Erro na API: ${data.info.errors || 'Status não é 200'}`);
      }
    } catch (err: any) {
      setError(`Erro na requisição: ${err instanceof Error ? err.message : 'Erro desconhecido'}`);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchSoatData();
  }, [fetchSoatData]);

  const refetch = useCallback(() => {
    fetchSoatData();
  }, [fetchSoatData]);

  return {
    soatData,
    loading,
    error,
    refetch
  };
};