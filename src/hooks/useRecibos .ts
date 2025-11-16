import { useState, useEffect, useCallback } from 'react';
import { useSessionCheckToken } from './useSessionToken';
import { ReciboData } from '@/types/typesData';
import { useUserProfile } from './useUserProfile';

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
    const [searchTerm, setSearchTerm] = useState(initialFilters?.reference || '');
    const [statusFilter, setStatusFilter] = useState<string>(
        initialFilters?.estado || 'all'
    );

    // Atualizar searchTerm quando filterParams.reference mudar
    useEffect(() => {
        if (initialFilters?.reference) {
            setSearchTerm(initialFilters.reference);
        }
    }, [initialFilters?.reference]);

    // Atualizar statusFilter quando filterParams.estado mudar
    useEffect(() => {
        const estadoParam = initialFilters?.estado;
        if (estadoParam && estadoParam !== statusFilter) {
            setStatusFilter(estadoParam);
        }
    }, [initialFilters?.estado, statusFilter]);
    
    const { token } = useSessionCheckToken();
    const { profile } = useUserProfile();
    const nifUser = profile?.user?.nif;
    
    // Função para buscar recibos (com ou sem loading)
    const fetchRecibos = useCallback(async (showLoading = true) => {
        if (!token || !nifUser) {
            setState({ recibos: [], isLoading: false, error: null });
            return;
        }

        try {
            if (showLoading) {
                setState(prev => ({ ...prev, isLoading: true, error: null }));
            }

            const response = await fetch(
                `/api/anywhere/api/v1/private/mobile/entity/nif/${nifUser}/invoices`,
                {
                    method: "GET",
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                        Accept: "application/json",
                    },
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
    }, [token, nifUser]);
    
    // Busca os recibos da API
    useEffect(() => {
        fetchRecibos(true);
    }, [fetchRecibos]);

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

    // Função para atualizar recibos silenciosamente (sem mostrar loading)
    const refetchSilent = useCallback(async () => {
        await fetchRecibos(false);
    }, [fetchRecibos]);

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
        },
        refetchSilent
    };
};
