/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect } from 'react';
import { useUserProfile } from './useUserProfile';

export interface Activity {
  id: string;
  user_id: string;
  action: string;
  description: string;
  created_at: string;
  updated_at?: string;
  username?: string;
  ip_address?: string;
  user_agent?: string;
}

export interface ActivityRequest {
  user_id: string;
  action: string;
  description: string;
}

export const useActivities = () => {
  const [allActivities, setAllActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const { profile } = useUserProfile();

  const ITEMS_PER_PAGE = 10;

  // Buscar todas as atividades do usuário
  const fetchActivities = async () => {
    if (!profile?.user?.id) {
      setError('Usuário não autenticado');
      setAllActivities([]); // Garantir que é sempre um array
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/activities?userId=${encodeURIComponent(profile.user.id)}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro ao buscar atividades');
      }

      const data = await response.json();
      
      // Extrair o array de atividades do formato da API
      const activitiesArray = data?.results && Array.isArray(data.results) ? data.results : [];
      
      // Ordenar por data mais recente primeiro
      const sortedActivities = activitiesArray.sort((a: Activity, b: Activity) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
      
      setAllActivities(sortedActivities);
      setCurrentPage(1); // Reset para primeira página
    } catch (err) {
      console.error('Erro ao buscar atividades:', err);
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
      setAllActivities([]); // Garantir que é sempre um array mesmo em caso de erro
    } finally {
      setLoading(false);
    }
  };

  // Calcular atividades da página atual
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const activities = allActivities.slice(startIndex, endIndex);
  const totalPages = Math.ceil(allActivities.length / ITEMS_PER_PAGE);

  // Mudar para uma página específica
  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages && page !== currentPage) {
      setCurrentPage(page);
    }
  };

  // Registrar nova atividade
  const registerActivity = async (activityData: Omit<ActivityRequest, 'user_id'>) => {
    
    if (!profile?.user?.id) {
      throw new Error('Usuário não autenticado');
    }

    try {
      const response = await fetch('/api/activities', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: profile.user.id,
          ...activityData,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro ao registrar atividade');
      }

      const newActivity = await response.json();
      
      // Atualizar a lista de atividades
      setAllActivities(prev => [newActivity, ...prev.slice(0, 4)]);
      
      return newActivity;
    } catch (err) {
      console.error('❌ useActivities: Erro ao registrar atividade:', err);
      throw err;
    }
  };

  // Buscar atividades quando o componente montar
  useEffect(() => {
    if (profile?.user?.id) {
      fetchActivities();
    } else {
      // Se não há profile, garantir que activities é um array vazio
      setAllActivities([]);
    }
  }, [profile?.user?.id]);

  return {
    activities: Array.isArray(activities) ? activities : [], // Garantir que sempre retorna array
    loading,
    error,
    currentPage,
    totalPages,
    totalActivities: allActivities.length,
    fetchActivities,
    goToPage,
    registerActivity,
  };
};
