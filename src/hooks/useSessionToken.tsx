import { useState, useEffect, useCallback } from "react";
import { getSession, signIn } from "next-auth/react";

export const useSessionCheckToken = () => {
  const [token, setToken] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const checkAndRefreshToken = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      let session = await getSession();

      const currentTime = Math.floor(Date.now() / 1000);
      const tokenExpiry = session?.user?.tokenExpiry ?? 0;

      if (
        !session ||
        !session.user?.accessToken ||
        tokenExpiry <= currentTime
      ) {
        console.warn("Sem sessão ou token expirado — tentando renovar...");

        const result = await signIn("credentials", { redirect: false });
        console.log("Resultado do signIn:", result);

        if (result?.error) {
          throw new Error("Falha ao renovar o token.");
        }

        session = await getSession();
      }

      if (!session?.user?.accessToken) {
        throw new Error("Token ausente após tentativa de renovação.");
      }

      setToken(session.user.accessToken);
    } catch (err) {
      console.error("Erro ao obter o token:", err);
      setError(err instanceof Error ? err.message : "Erro desconhecido.");
      setToken(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAndRefreshToken();
  }, [checkAndRefreshToken]);

  return {
    token,
    error,
    loading,
    refresh: checkAndRefreshToken,
  };
};
