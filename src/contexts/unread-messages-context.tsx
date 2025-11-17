"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from "react";
import { useUserProfile } from "@/hooks/useUserProfile";

interface UnreadMessagesContextType {
  unreadCount: number;
  updateUnreadCount: (count: number) => void;
  decrementUnreadCount: () => void;
  incrementUnreadCount: () => void;
  refreshUnreadCount: () => void;
  markMessageAsRead: (messageId: string) => void;
  markMessageAsUnread: (messageId: string) => void;
  isMessageRead: (messageId: string) => boolean;
  markAllMessagesAsRead: () => Promise<void>;
}

const UnreadMessagesContext = createContext<
  UnreadMessagesContextType | undefined
>(undefined);

export function UnreadMessagesProvider({ children }: { children: ReactNode }) {
  const [unreadCount, setUnreadCount] = useState(0);
  const [readMessages, setReadMessages] = useState<Set<string>>(new Set());
  const { profile } = useUserProfile();

  // Funções para gerenciar localStorage
  const getStorageKey = useCallback(() => {
    return `readMessages_${profile?.user?.id || "anonymous"}`;
  }, [profile?.user?.id]);

  const loadReadMessagesFromStorage = useCallback(() => {
    if (typeof window === "undefined") return new Set<string>();

    try {
      const storageKey = getStorageKey();
      const stored = localStorage.getItem(storageKey);
      return stored
        ? new Set(JSON.parse(stored) as string[])
        : new Set<string>();
    } catch (error) {
      console.error("Erro ao carregar mensagens lidas do localStorage:", error);
      return new Set<string>();
    }
  }, [getStorageKey]);

  const saveReadMessagesToStorage = useCallback(
    (readMessagesSet: Set<string>) => {
      if (typeof window === "undefined") return;

      try {
        const storageKey = getStorageKey();
        localStorage.setItem(
          storageKey,
          JSON.stringify(Array.from(readMessagesSet))
        );
      } catch (error) {
        console.error("Erro ao salvar mensagens lidas no localStorage:", error);
      }
    },
    [getStorageKey]
  );

  const fetchUnreadCount = useCallback(async () => {
    if (!profile?.user?.id) return;

    try {
      // Usar a nova API de contagem de mensagens não lidas
      const res = await fetch(
        `/api/messages/count-not-read?user_id=${encodeURIComponent(profile.user.id)}`,
        {
          cache: "no-store",
        }
      );

      if (!res.ok) {
        // Se a API falhar, tentar o método antigo como fallback
        console.warn("Erro ao buscar contador via API, tentando método alternativo...");
        const fallbackRes = await fetch(`/api/menssage?user_id=${profile.user.id}`, {
          cache: "no-store",
        });

        if (!fallbackRes.ok) throw new Error("Erro ao carregar mensagens");

        const fallbackData = await fallbackRes.json();
        const storedReadMessages = loadReadMessagesFromStorage();
        setReadMessages(storedReadMessages);

        const unreadMessages =
          fallbackData.results?.filter(
            (msg: { id: string; read: boolean }) =>
              !storedReadMessages.has(msg.id) && !msg.read
          ) || [];

        setUnreadCount(unreadMessages.length);
        return;
      }

      const data = await res.json();
      
      console.log('📡 Resposta da API count-not-read:', data);
      
      // A API pode retornar o contador diretamente ou em uma propriedade
      // Verificar diferentes formatos de resposta
      let count = 0;
      
      // Primeiro verificar se results é um número (caso mais comum: { "info": {...}, "results": 5 })
      if (data && typeof data.results === 'number') {
        count = Number(data.results);
      } else if (typeof data === 'number') {
        count = Number(data);
      } else if (data && data.count !== undefined) {
        count = Number(data.count);
      } else if (data && data.count_not_read !== undefined) {
        count = Number(data.count_not_read);
      } else if (data && data.results && typeof data.results === 'object' && data.results.count !== undefined) {
        count = Number(data.results.count);
      } else {
        // Se não encontrar o formato esperado, usar 0
        console.warn("Formato de resposta inesperado da API de contagem:", data);
        count = 0;
      }

      // Garantir que count é um número válido
      count = isNaN(count) ? 0 : Math.max(0, Math.floor(count));

      console.log('📊 Contador de mensagens não lidas processado:', count, typeof count);
      setUnreadCount(count);
    } catch (error) {
      console.error("Erro ao buscar contador de mensagens não lidas:", error);
      // Em caso de erro, manter o contador atual ou definir como 0
      setUnreadCount(0);
    }
  }, [profile?.user?.id, loadReadMessagesFromStorage]);

  const markMessageAsRead = useCallback(
    (messageId: string) => {
      setReadMessages((prev) => {
        const newSet = new Set(prev);
        newSet.add(messageId);
        saveReadMessagesToStorage(newSet);
        return newSet;
      });
      setUnreadCount((prev) => Math.max(0, prev - 1));
    },
    [saveReadMessagesToStorage]
  );

  const markMessageAsUnread = useCallback(
    (messageId: string) => {
      setReadMessages((prev) => {
        const newSet = new Set(prev);
        newSet.delete(messageId);
        saveReadMessagesToStorage(newSet);
        return newSet;
      });
      setUnreadCount((prev) => prev + 1);
    },
    [saveReadMessagesToStorage]
  );

  const updateUnreadCount = (count: number) => {
    setUnreadCount(count);
  };

  const decrementUnreadCount = () => {
    setUnreadCount((prev) => Math.max(0, prev - 1));
  };

  const incrementUnreadCount = () => {
    setUnreadCount((prev) => prev + 1);
  };

  const refreshUnreadCount = () => {
    fetchUnreadCount();
  };

  const markAllMessagesAsRead = useCallback(async () => {
    try {
      if (!profile?.user?.id) return;

      // Buscar todas as mensagens
      const res = await fetch(`/api/menssage?user_id=${profile.user.id}`, {
        cache: "no-store",
      });

      if (!res.ok) throw new Error("Erro ao carregar mensagens");

      const data = await res.json();
      const messages = data.results || [];

      // Marcar todas as mensagens como lidas no localStorage
      const allMessageIds = messages.map((msg: { id: string }) => msg.id);
      const newReadMessages = new Set([...readMessages, ...allMessageIds]);

      setReadMessages(newReadMessages);
      saveReadMessagesToStorage(newReadMessages);

      // Zerar o contador
      setUnreadCount(0);
    } catch (error) {
      console.error("Erro ao marcar todas as mensagens como lidas:", error);
    }
  }, [profile?.user?.id, readMessages, saveReadMessagesToStorage]);

  const isMessageRead = useCallback(
    (messageId: string) => {
      return readMessages.has(messageId);
    },
    [readMessages]
  );

  useEffect(() => {
    if (profile?.user?.id) {
      fetchUnreadCount();
      
      // Atualiza mensagens não lidas a cada 60 segundos
      const interval = setInterval(() => {
        fetchUnreadCount();
      }, 60000); // 60 segundos

      return () => {
        clearInterval(interval);
      };
    }
  }, [fetchUnreadCount, profile?.user?.id]);

  return (
    <UnreadMessagesContext.Provider
      value={{
        unreadCount,
        updateUnreadCount,
        decrementUnreadCount,
        incrementUnreadCount,
        refreshUnreadCount,
        markMessageAsRead,
        markMessageAsUnread,
        isMessageRead,
        markAllMessagesAsRead,
      }}
    >
      {children}
    </UnreadMessagesContext.Provider>
  );
}

export function useUnreadMessages() {
  const context = useContext(UnreadMessagesContext);
  if (context === undefined) {
    throw new Error(
      "useUnreadMessages must be used within a UnreadMessagesProvider"
    );
  }
  return context;
}
