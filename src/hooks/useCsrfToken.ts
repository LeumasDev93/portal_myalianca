import { useState, useEffect, useCallback } from 'react';

export function useCsrfToken() {
  const [csrfToken, setCsrfToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchCsrfToken = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/csrf-token');
      if (response.ok) {
        const data = await response.json();
        setCsrfToken(data.csrfToken);
      } else {
        console.error('Erro ao obter token CSRF');
      }
    } catch (error) {
      console.error('Erro ao buscar token CSRF:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCsrfToken();
  }, [fetchCsrfToken]);

  // Função para regenerar token (usar após cada submissão)
  const regenerateToken = useCallback(async () => {
    await fetchCsrfToken();
  }, [fetchCsrfToken]);

  return { csrfToken, isLoading, regenerateToken };
}

