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

type MessageAPI = {
  id: string;
  sender?: string;
  assunto?: string;
  preview?: string;
  date?: string;
  data_criacao?: string;
  data_ultima_mensagem?: string;
  nome_cliente?: string;
  read?: boolean;
  starred?: boolean;
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
          ? data.results.map((msg: MessageAPI) => ({
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
    
    // Verificar se o ID existe nas mensagens antes de enviar
    if (!id || id.trim() === '') {
      console.warn('⚠️ ID da mensagem inválido, não enviando para API');
      return;
    }
    
    // Verificar se a mensagem existe na lista
    const messageExists = messages.some(msg => msg.id === id);
    if (!messageExists) {
      console.warn('⚠️ Mensagem não encontrada na lista, não enviando para API');
      return;
    }

    try {
      // Chamar PROXY para marcar como lida (evita CORS)
      console.log('📧 Marcando mensagem como LIDA via proxy:', id);
      
      // Buscar conteúdo da mensagem
      const message = messages.find(msg => msg.id === id);
      const conteudo = message?.assunto || '';
      
      const response = await fetch('/api/menssage/mark-read', {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          messageId: id,
          userId: userId,
          conteudo: conteudo,
        }),
      });

      const data = await response.json();
      console.log('📧 Resposta do proxy:', {
        status: response.status,
        data
      });

      if (response.ok) {
        setMessages((prev) => {
          const updated = prev.map((msg) =>
            msg.id === id ? { ...msg, read: true } : msg
          );
          const newUnreadCount = updated.filter((m) => !m.read).length;
          setUnreadCount(newUnreadCount);
          console.log('✅ Mensagem marcada como lida. Novo contador:', newUnreadCount);
          return updated;
        });
      } else {
        console.error('❌ Erro:', response.status, data);
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
    
    // Verificar se o ID existe nas mensagens antes de enviar
    if (!id || id.trim() === '') {
      console.warn('⚠️ ID da mensagem inválido, não enviando para API');
      return;
    }
    
    // Verificar se a mensagem existe na lista
    const messageExists = messages.some(msg => msg.id === id);
    if (!messageExists) {
      console.warn('⚠️ Mensagem não encontrada na lista, não enviando para API');
      return;
    }

    try {
      // Chamar PROXY para marcar como não lida (evita CORS)
      console.log('📧 Marcando mensagem como NÃO LIDA via proxy:', id);
      
      // Buscar conteúdo da mensagem
      const message = messages.find(msg => msg.id === id);
      const conteudo = message?.assunto || '';
      
      const response = await fetch('/api/menssage/mark-unread', {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          messageId: id,
          userId: userId,
          conteudo: conteudo,
        }),
      });

      const data = await response.json();
      console.log('📧 Resposta do proxy:', {
        status: response.status,
        data
      });

      if (response.ok) {
        setMessages((prev) => {
          const updated = prev.map((msg) =>
            msg.id === id ? { ...msg, read: false } : msg
          );
          const newUnreadCount = updated.filter((m) => !m.read).length;
          setUnreadCount(newUnreadCount);
          console.log('✅ Mensagem marcada como não lida. Novo contador:', newUnreadCount);
          return updated;
        });
      } else {
        console.error('❌ Erro:', response.status, data);
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
