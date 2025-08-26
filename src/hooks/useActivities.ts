/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect } from 'react';
import { useUserProfile } from './useUserProfile ';

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
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { profile } = useUserProfile();

  const apiKey = process.env.NEXT_PUBLIC_API_KEY;
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL_DEFAULT;

  // Buscar atividades do usuário
  const fetchActivities = async (limit: number = 5) => {
    if (!profile?.user?.id || !apiKey || !apiBaseUrl) {
      setError('Configuração incompleta');
      setActivities([]); // Garantir que é sempre um array
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `${apiBaseUrl}/user/activity/1.0.0/user/${profile.user.id}/last?limit=${limit}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'ApiKey': apiKey,
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erro ao buscar atividades');
      }

      const data = await response.json();
      
      // Extrair o array de atividades do formato da API
      const activitiesArray = data?.results && Array.isArray(data.results) ? data.results : [];
      
      setActivities(activitiesArray);
    } catch (err) {
      console.error('Erro ao buscar atividades:', err);
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
      setActivities([]); // Garantir que é sempre um array mesmo em caso de erro
    } finally {
      setLoading(false);
    }
  };

  // Registrar nova atividade
  const registerActivity = async (activityData: Omit<ActivityRequest, 'user_id'>) => {
    if (!profile?.user?.id || !apiKey || !apiBaseUrl) {
      throw new Error('Configuração incompleta');
    }

    const requestData: ActivityRequest = {
      user_id: profile.user.id,
      ...activityData,
    };

    try {
      const response = await fetch(`${apiBaseUrl}/user/activity/1.0.0`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'ApiKey': apiKey,
        },
        body: JSON.stringify(requestData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erro ao registrar atividade');
      }

      const newActivity = await response.json();
      
      // Atualizar a lista de atividades
      setActivities(prev => [newActivity, ...prev.slice(0, 4)]);
      
      return newActivity;
    } catch (err) {
      console.error('Erro ao registrar atividade:', err);
      throw err;
    }
  };

  // Buscar atividades quando o componente montar
  useEffect(() => {
    if (profile?.user?.id) {
      fetchActivities();
    } else {
      // Se não há profile, garantir que activities é um array vazio
      setActivities([]);
    }
  }, [profile?.user?.id]);

  return {
    activities: Array.isArray(activities) ? activities : [], // Garantir que sempre retorna array
    loading,
    error,
    fetchActivities,
    registerActivity,
  };
};
