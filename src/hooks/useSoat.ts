/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect, useCallback } from 'react';
import { SoatData, SoatApiResponse } from '@/types/typesData';
import { useUserProfile } from './useUserProfile ';

export const useSoat = () => {
  const [soatData, setSoatData] = useState<SoatData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { profile } = useUserProfile();

  // Usar userId do perfil ou um fixo para teste
  const userId = profile?.user?.id || "614ba529-9b3a-443d-b97d-bbdb1ff9ed1f";

  const fetchSoatData = useCallback(async () => {
    if (!userId || userId.trim() === '') {
      console.log('userId não disponível:', userId);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      console.log('Buscando dados SOAT para userId:', userId);
      
      // Usar a URL base do .env.local
      const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL_DEFAULT || 'https://api.aliancaseguros.cv';
      const url = `/soat/1.0.0?user_id=${userId}`;
      const fullUrl = `${baseUrl}${url}`;
      
      console.log('URL completa:', fullUrl);
      
      const apiKey = process.env.NEXT_PUBLIC_API_KEY || '';
      console.log('API Key sendo usado:', apiKey ? `${apiKey.substring(0, 20)}...` : 'Não encontrado');
      
      // Fazer a requisição diretamente com fetch
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

      const data: SoatApiResponse = await response.json();
      
      console.log('Resposta da API SOAT:', data);
      
      if (data.info.status === 200) {
        setSoatData(data.results);
        console.log('Dados SOAT carregados com sucesso:', data.results.length, 'itens');
      } else {
        setError(`Erro na API: ${data.info.errors || 'Status não é 200'}`);
      }
    } catch (err: any) {
      console.error('Erro ao buscar dados do SOAT:', err);
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