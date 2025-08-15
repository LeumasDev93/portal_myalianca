/* eslint-disable @typescript-eslint/no-explicit-any */
// hooks/useUnreadCount.ts

import { useEffect, useState } from "react";

type Message = {
  id: string;
  sender?: string;
  assunto?: string;
  preview?: string;
  date?: string;
  data_criacao?: string;
  data_ultima_mensagem?: string;
  nome_cliente?: string;
  read: boolean;
  starred: boolean;
  replyCount?: number;
};

export function useUnreadCount(userId?: string) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) {
      setMessages([]);
      setUnreadCount(0);
      return;
    }

    const fetchMessages = async () => {
      setLoading(true);
      setError(null);

      try {
        const res = await fetch(`/api/menssage?user_id=${userId}`, {
          cache: "no-store",
        });

        if (!res.ok) throw new Error("Erro ao carregar mensagens");

        const data = await res.json();

        const formattedMessages: Message[] = Array.isArray(data?.results)
          ? data.results.map((msg: any) => ({
            ...msg,
            read: msg.read ?? false,
            starred: msg.starred ?? false,
          }))
          : [];

        setMessages(formattedMessages);

        // Use o valor da API diretamente, se disponível
        let finalUnreadCount = 0;
        if (typeof data.unreadCount === "number") {
          finalUnreadCount = data.unreadCount;
        } else {
          // fallback para contar localmente
          finalUnreadCount = formattedMessages.filter((msg) => !msg.read).length;
        }
        
        setUnreadCount(finalUnreadCount);
      } catch (err) {
        console.error("Error fetching messages:", err);
        setError(err instanceof Error ? err.message : "Erro desconhecido");
        setMessages([]);
        setUnreadCount(0);
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();
  }, [userId]);

  const markAsRead = async (id: string) => {
    if (!userId) return;

    try {
      // Chamar API para marcar como lida
      const response = await fetch("/api/menssage", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messageId: id,
          userId: userId,
          action: "mark-as-read",
        }),
      });

      if (response.ok) {
        setMessages((prev) => {
          const updated = prev.map((msg) =>
            msg.id === id ? { ...msg, read: true } : msg
          );
          setUnreadCount(updated.filter((m) => !m.read).length);
          return updated;
        });
      }
    } catch (error) {
      console.error("Erro ao marcar mensagem como lida:", error);
      // Fallback: atualizar localmente mesmo se a API falhar
      setMessages((prev) => {
        const updated = prev.map((msg) =>
          msg.id === id ? { ...msg, read: true } : msg
        );
        setUnreadCount(updated.filter((m) => !m.read).length);
        return updated;
      });
    }
  };

  const markAsUnread = async (id: string) => {
    if (!userId) return;

    try {
      // Chamar API para marcar como não lida
      const response = await fetch("/api/menssage", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messageId: id,
          userId: userId,
          action: "mark-as-unread",
        }),
      });

      if (response.ok) {
        setMessages((prev) => {
          const updated = prev.map((msg) =>
            msg.id === id ? { ...msg, read: false } : msg
          );
          setUnreadCount(updated.filter((m) => !m.read).length);
          return updated;
        });
      }
    } catch (error) {
      console.error("Erro ao marcar mensagem como não lida:", error);
      // Fallback: atualizar localmente mesmo se a API falhar
      setMessages((prev) => {
        const updated = prev.map((msg) =>
          msg.id === id ? { ...msg, read: false } : msg
        );
        setUnreadCount(updated.filter((m) => !m.read).length);
        return updated;
      });
    }
  };

  const toggleStar = (id: string) => {
    setMessages((prev) =>
      prev.map((msg) =>
        msg.id === id ? { ...msg, starred: !msg.starred } : msg
      )
    );
  };

  return {
    messages,
    unreadCount,
    loading,
    error,
    markAsRead,
    markAsUnread,
    toggleStar,
    setMessages,
  };
}
