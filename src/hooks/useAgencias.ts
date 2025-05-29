import { useEffect, useState } from 'react';

interface Agencia {
  id: string;
  nome: string;
  localizacao: string;
  latitude: number;
  longitude: number;
  criado_por: string;
}

export function useAgencias() {
  const [agencias, setAgencias] = useState<Agencia[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAgencias = async () => {
      setLoading(true);
      try {
        const res = await fetch('/api/agency');
        const json = await res.json();

        const agenciaRow = json.gel_all_agency_element?.gel_all_agency_row;
        const agenciasArray = Array.isArray(agenciaRow) ? agenciaRow : [agenciaRow];

        setAgencias(agenciasArray);
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
