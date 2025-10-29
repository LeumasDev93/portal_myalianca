/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect, useCallback } from "react";
import { useUserProfile } from "@/hooks/useUserProfile";

export interface Notification {
  id: string;
  titulo: string;
  mensagem: string;
  tipo: string;
  lida: boolean;
  user_id: string;
  data_criacao: string;
}

export interface NotificationsResponse {
  info: {
    count: number;
    page: number;
    status: number;
    errors: null | any;
  };
  results: Notification[];
}

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { profile } = useUserProfile();

  const fetchNotifications = useCallback(async () => {
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
        `${apiBaseUrl}/notifications/1.0.0?user_id=${profile.user.id}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            ApiKey: apiKey,
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Erro ao buscar notificações");
      }

      const data: NotificationsResponse = await response.json();
      setNotifications(data.results || []);
      
      const unread = data.results?.filter(notification => !notification.lida).length || 0;
      setUnreadCount(unread);
    } catch (err) {
      console.error("Erro ao buscar notificações:", err);
      setError(err instanceof Error ? err.message : "Erro desconhecido");
    } finally {
      setIsLoading(false);
    }
  }, [profile?.user?.id]);

  const markAsRead = useCallback(async (notificationId: string) => {
    try {
      setNotifications(prev => 
        prev.map(notification => 
          notification.id === notificationId 
            ? { ...notification, lida: true }
            : notification
        )
      );

      setNotifications(prev => {
        const updatedNotifications = prev.map(notification => 
          notification.id === notificationId 
            ? { ...notification, lida: true }
            : notification
        );
        
        const newUnreadCount = updatedNotifications.filter(notification => !notification.lida).length;
        setUnreadCount(newUnreadCount);
        
        return updatedNotifications;
      });

    } catch (err) {
      console.error("Erro ao marcar notificação como lida:", err);
    }
  }, []);

  const markAllAsRead = useCallback(async () => {
    try {
      setNotifications(prev => {
        const updatedNotifications = prev.map(notification => ({ ...notification, lida: true }));
        
        setUnreadCount(0);
        
        return updatedNotifications;
      });

    } catch (err) {
      console.error("Erro ao marcar todas como lidas:", err);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
    
    // Atualiza notificações a cada 60 segundos
    const interval = setInterval(() => {
      fetchNotifications();
    }, 60000); // 60 segundos

    return () => {
      clearInterval(interval);
    };
  }, [fetchNotifications]);

  return {
    notifications,
    unreadCount,
    isLoading,
    error,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
  };
}
