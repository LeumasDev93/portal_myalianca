/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from 'react';

interface Agencia {
  id: string;
  nome: string;
  localizacao: string;
  latitude: number;
  longitude: number;
  criado_por: string | null;
}

export function useAgencias() {
  const [agencias, setAgencias] = useState<Agencia[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAgencias = async () => {
      try {
        const res = await fetch('/api/agency');
        if (!res.ok) throw new Error('Erro na resposta da API');

        const data = await res.json();

        // Verifica se a resposta tem o formato esperado
        if (!data.results || !Array.isArray(data.results)) {
          throw new Error('Formato de resposta inválido da API');
        }

        const agenciasFormatadas = data.results.map((agencia: any): Agencia => ({
          id: agencia.id,
          nome: agencia.nome,
          localizacao: agencia.localizacao,
          latitude: Number(agencia.latitude),
          longitude: Number(agencia.longitude),
          criado_por: agencia.criado_por ?? null,
        }));

        setAgencias(agenciasFormatadas);
        setError(null);
      } catch (err) {
        console.error('Erro ao carregar agências:', err);
        setError('Erro ao carregar agências');
      } finally {
        setLoading(false);
      }
    };

    fetchAgencias();
  }, []);

  return { agencias, loading, error };
}
