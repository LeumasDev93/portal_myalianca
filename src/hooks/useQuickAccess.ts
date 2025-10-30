/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect } from 'react';
import { useUserProfile } from './useUserProfile ';

interface QuickAccessItem {
  id: string;
  nome: string;
  titulo: string;
  descricao?: string;
  icone: string;
  link: string;
  descricaoBotao: string;
  user_id: string;
  border_color?: string;
  icon_color?: string;
  bg_color?: string;
  text_color?: string;
  bg_botton_color?: string;
  order_number?: number;
  created_at?: string;
  updated_at?: string;
}

export function useQuickAccess() {
  const [quickAccessItems, setQuickAccessItems] = useState<QuickAccessItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { profile } = useUserProfile();

  const fetchQuickAccess = async () => {
    
    if (!profile?.user?.id) {
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

             const response = await fetch(
         `${apiBaseUrl}/quick-access/1.0.0/user/${profile.user.id}`,
         {
           method: "GET",
           headers: {
             "Content-Type": "application/json",
             "ApiKey": apiKey,
           },
         }
       );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Erro ao buscar acesso rápido");
      }

             const data = await response.json();
       console.log("API Response:", data);
       
       // A API retorna {info: {...}, results: [...]}
       const items = data.results || [];
       setQuickAccessItems(Array.isArray(items) ? items : []);
    } catch (err) {
      console.error("Erro ao buscar acesso rápido:", err);
      setError(err instanceof Error ? err.message : "Erro desconhecido");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchQuickAccess();
  }, [profile?.user?.id]);

  return {
    quickAccessItems,
    isLoading,
    error,
    refetch: fetchQuickAccess,
  };
}
