import { useState, useEffect } from 'react';

export function useCsrfToken() {
  const [csrfToken, setCsrfToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCsrfToken = async () => {
      try {
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
    };

    fetchCsrfToken();
  }, []);

  return { csrfToken, isLoading };
}

