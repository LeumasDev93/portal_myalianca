/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useCallback } from 'react';
import { SoatData, SoatDetailsApiResponse } from '@/types/typesData';

export const useSoatDetails = () => {
  const [soatDetails, setSoatDetails] = useState<SoatData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSoatDetails = useCallback(async (soatId: string) => {
    if (!soatId || soatId.trim() === '') {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      // Chamar API route do servidor
      const response = await fetch(`/api/soat/${encodeURIComponent(soatId)}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const data: SoatDetailsApiResponse = await response.json();
      
      if (data.info.status === 200) {
        const soatData = data.results;
        
        // Garantir que contents seja um array
        if (!soatData.contents || !Array.isArray(soatData.contents)) {
          soatData.contents = [];
        }
        
        setSoatDetails(soatData);
      } else {
        setError(`Erro na API: ${data.info.errors || 'Status não é 200'}`);
      }
    } catch (err: any) {
      console.error('Erro ao buscar detalhes do SOAT:', err);
      setError(`Erro na requisição: ${err.message || 'Erro desconhecido'}`);
    } finally {
      setLoading(false);
    }
  }, []);

  const clearDetails = useCallback(() => {
    setSoatDetails(null);
    setError(null);
  }, []);

  return {
    soatDetails,
    loading,
    error,
    fetchSoatDetails,
    clearDetails
  };
};
