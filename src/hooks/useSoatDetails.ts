/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useCallback } from 'react';
import { SoatData, SoatDetailsApiResponse } from '@/types/typesData';

export const useSoatDetails = () => {
  const [soatDetails, setSoatDetails] = useState<SoatData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSoatDetails = useCallback(async (soatId: string) => {
    if (!soatId || soatId.trim() === '') {
      console.log('soatId não disponível:', soatId);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      console.log('Buscando detalhes do SOAT para ID:', soatId);
      
      // Usar a URL base do .env.local
      const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL_DEFAULT || 'https://api.aliancaseguros.cv';
      const url = `/soat/1.0.0/${soatId}`;
      const fullUrl = `${baseUrl}${url}`;
      
      console.log('URL completa:', fullUrl);
      
      const apiKey = process.env.NEXT_PUBLIC_API_KEY || '';
      console.log('API Key sendo usado:', apiKey ? `${apiKey.substring(0, 20)}...` : 'Não encontrado');
      
      const response = await fetch(fullUrl, {
        method: 'GET',
        headers: {
          'apikey': apiKey,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: SoatDetailsApiResponse = await response.json();
      
      console.log('Resposta da API SOAT Details:', data);
      
      if (data.info.status === 200) {
        const soatData = data.results;
        
        // Garantir que contents seja um array
        if (!soatData.contents || !Array.isArray(soatData.contents)) {
          soatData.contents = [];
        }
        
        setSoatDetails(soatData);
        console.log('Detalhes do SOAT carregados com sucesso:', soatData);
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
