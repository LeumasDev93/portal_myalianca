import { useState, useEffect } from 'react';
import { useSessionCheckToken } from './useSessionToken';
import { useUserProfile } from './useUserProfile ';
import { ReciboData } from '@/types/typesData';

interface RecibosState {
    recibos: ReciboData[];
    isLoading: boolean;
    error: string | null;
}

export const useRecibos = (initialFilters?: Record<string, string>) => {
    // Estado único para evitar múltiplos re-renders
    const [state, setState] = useState<RecibosState>({
        recibos: [],
        isLoading: true,
        error: null
    });
    
    const [dataLoaded, setDataLoaded] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>(
        initialFilters?.estado || 'all'
    );
    
    const { token } = useSessionCheckToken();
    const { profile } = useUserProfile();
    const nifUser = profile?.user?.nif;

    console.log('token de anywhere', token);
    // Busca os recibos da API
    useEffect(() => {
        if (!token || !nifUser) {
            setState({ recibos: [], isLoading: false, error: null });
            return;
        }

        const controller = new AbortController();
        const { signal } = controller;

        const fetchRecibos = async () => {
            // Iniciar loading
            setState({ recibos: [], isLoading: true, error: null });

            try {
                const response = await fetch(
                    `/api/anywhere/api/v1/private/mobile/entity/nif/${nifUser}/invoices`,
                    {
                        method: "GET",
                        headers: {
                            Authorization: `Bearer ${token}`,
                            "Content-Type": "application/json",
                            Accept: "application/json",
                        },
                        signal,
                    }
                );

                if (!response.ok) {
                    throw new Error(`Erro ${response.status}: ${response.statusText}`);
                }

                const data = await response.json();
                const recibosData = Array.isArray(data) ? data : [data];

                // ✅ Atualização ATÔMICA - tudo de uma vez
                setState({
                    recibos: recibosData,
                    isLoading: false,
                    error: null
                });
                setDataLoaded(true);
            } catch (error) {
                if (signal.aborted) return;

                const errorMessage = error instanceof Error
                    ? error.message
                    : "Erro ao carregar recibos";
                    
                // ✅ Erro ATÔMICO
                setState({
                    recibos: [],
                    isLoading: false,
                    error: errorMessage
                });
            }
        };

        fetchRecibos();

        return () => controller.abort();
    }, [token, nifUser]);

    // Aplica os filtros sempre que houver mudanças
    const filteredRecibos = state.recibos.filter((recibo) => {
        // Filtro de texto
        if (searchTerm.trim() !== "") {
            const term = searchTerm.toLowerCase();
            const matchesText =
                recibo.clientName?.toLowerCase().includes(term) ||
                recibo.number?.toLowerCase().includes(term) ||
                (recibo.mbref && recibo.mbref.toLowerCase().includes(term));
            
            if (!matchesText) return false;
        }

        // Filtro de status
        if (statusFilter !== "all") {
            const statusNum = parseInt(statusFilter);
            
            // Para "Em Cobrança" (status 1), incluir também status 2
            if (statusNum === 1) {
                return recibo.status === 1 || recibo.status === 2;
            } else {
                return recibo.status === statusNum;
            }
        }

        return true;
    });

    return {
        recibos: state.recibos,
        filteredRecibos,
        isLoadingRecibos: state.isLoading || !dataLoaded,
        errorRecibo: state.error,
        searchTerm,
        setSearchTerm,
        statusFilter,
        setStatusFilter,
        resetFilters: () => {
            setSearchTerm('');
            setStatusFilter('all');
        }
    };
};
