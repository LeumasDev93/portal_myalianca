import { useState, useEffect } from "react";
import { getSession, signIn } from "next-auth/react";

export const useSessionCheckToken = () => {
  const [token, setToken] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const checkAndRefreshToken = async () => {
    try {
      setLoading(true);

      // 1. Verifica a sessão atual
      const session = await getSession();

      if (!session?.user?.accessToken) {
        throw new Error("Nenhuma sessão ativa");
      }

      // 2. Verifica expiração do token (timestamp em segundos)
      const currentTime = Math.floor(Date.now() / 1000);
      const tokenExpiry = session.user.tokenExpiry || 0;

      if (tokenExpiry <= currentTime) {
        console.log("Token expirado - renovando...");
        // 3. Força novo login silencioso
        const result = await signIn("credentials", { redirect: false });

        if (result?.error) {
          throw new Error("Falha ao renovar token");
        }

        // 4. Obtém a nova sessão
        const newSession = await getSession();
        if (!newSession?.user?.accessToken) {
          throw new Error("Token renovado não encontrado");
        }

        setToken(newSession.user.accessToken);
      } else {
        console.log("Token válido - usando existente");
        setToken(session.user.accessToken);
      }

      setError(null);
    } catch (err) {
      console.error("Erro na verificação do token:", err);
      setError(err instanceof Error ? err.message : "Erro desconhecido");
      setToken(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAndRefreshToken();
  }, []);

  return { token, error, loading, refresh: checkAndRefreshToken };
};
