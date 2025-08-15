"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from "react";
import { useUserProfile } from "@/hooks/useUserProfile ";

interface UnreadMessagesContextType {
  unreadCount: number;
  updateUnreadCount: (count: number) => void;
  decrementUnreadCount: () => void;
  incrementUnreadCount: () => void;
  refreshUnreadCount: () => void;
  markMessageAsRead: (messageId: string) => void;
  markMessageAsUnread: (messageId: string) => void;
  isMessageRead: (messageId: string) => boolean;
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
      const res = await fetch(`/api/menssage?user_id=${profile.user.id}`, {
        cache: "no-store",
      });

      if (!res.ok) throw new Error("Erro ao carregar mensagens");

      const data = await res.json();

      // Carregar mensagens lidas do localStorage
      const storedReadMessages = loadReadMessagesFromStorage();
      setReadMessages(storedReadMessages);

      // Calcular número de mensagens não lidas baseado no localStorage
      const unreadMessages =
        data.results?.filter(
          (msg: { id: string; read: boolean }) =>
            !storedReadMessages.has(msg.id) && !msg.read
        ) || [];

      setUnreadCount(unreadMessages.length);
    } catch (error) {
      console.error("Erro ao buscar contador de mensagens não lidas:", error);
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

  const isMessageRead = useCallback(
    (messageId: string) => {
      return readMessages.has(messageId);
    },
    [readMessages]
  );

  useEffect(() => {
    if (profile?.user?.id) {
      fetchUnreadCount();
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
