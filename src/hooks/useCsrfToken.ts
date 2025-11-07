import { useState, useEffect, useCallback } from 'react';

export function useCsrfToken() {
  const [csrfToken, setCsrfToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchCsrfToken = useCallback(async () => {
    try {
      const response = await fetch('/api/csrf-token');
      if (response.ok) {
        const data = await response.json();
        setCsrfToken(data.csrfToken);
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

  const refreshToken = useCallback(() => {
    fetchCsrfToken();
  }, [fetchCsrfToken]);

  return { csrfToken, isLoading, refreshToken };
}

