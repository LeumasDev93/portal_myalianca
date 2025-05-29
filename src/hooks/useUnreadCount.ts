import { useState, useEffect } from "react";

type Message = {
  id: string;
  sender: string;
  subject: string;
  preview: string;
  date: string;
  read: boolean;
  starred: boolean;
  replyCount: number;
};

export function useUnreadCount(): number {
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const updateUnreadCount = () => {
      const storedMessages = localStorage.getItem("messages");
      if (storedMessages) {
        try {
          const parsed: Message[] = JSON.parse(storedMessages);
          const count = parsed.filter((msg) => !msg.read).length;
          setUnreadCount(count);
        } catch (error) {
          console.error("Erro ao analisar mensagens do localStorage:", error);
          setUnreadCount(0);
        }
      } else {
        setUnreadCount(0);
      }
    };

    updateUnreadCount();

    // Ouve alterações no localStorage vindas de outras abas
    window.addEventListener("storage", updateUnreadCount);

    return () => {
      window.removeEventListener("storage", updateUnreadCount);
    };
  }, []);

  // Atualiza o contador manualmente toda vez que a aba atual salva no localStorage
  useEffect(() => {
    const interval = setInterval(() => {
      const storedMessages = localStorage.getItem("messages");
      if (storedMessages) {
        const parsed: Message[] = JSON.parse(storedMessages);
        const count = parsed.filter((msg) => !msg.read).length;
        setUnreadCount(count);
      }
    }, 1000); // Verifica a cada 1 segundo — pode ajustar

    return () => clearInterval(interval);
  }, []);

  return unreadCount;
}
