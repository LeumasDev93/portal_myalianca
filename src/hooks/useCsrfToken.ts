import { useState, useEffect, useCallback } from 'react';

export function useCsrfToken() {
  const [csrfToken, setCsrfToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchCsrfToken = useCallback(async (): Promise<string | null> => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/csrf-token');
      if (response.ok) {
        const data = await response.json();
        setCsrfToken(data.csrfToken);
        return data.csrfToken;
      } else {
        console.error('Erro ao obter token CSRF');
        return null;
      }
    } catch (error) {
      console.error('Erro ao buscar token CSRF:', error);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCsrfToken();
  }, [fetchCsrfToken]);

  // Função para regenerar token e retornar o novo token
  const regenerateToken = useCallback(async (): Promise<string | null> => {
    return await fetchCsrfToken();
  }, [fetchCsrfToken]);

  return { csrfToken, isLoading, regenerateToken };
}

