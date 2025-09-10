import { useState, useEffect } from 'react';
import { useSessionCheckToken } from './useSessionToken';
import { useUserProfile } from './useUserProfile ';
import { ReciboData } from '@/types/typesData';

export const useRecibos = (initialFilters?: Record<string, string>) => {
    const [recibos, setRecibos] = useState<ReciboData[]>([]);
    const [filteredRecibos, setFilteredRecibos] = useState<ReciboData[]>([]);
    const [isLoadingRecibos, setIsLoadingRecibos] = useState(false);
    const [errorRecibo, setErrorRecibo] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>(
        initialFilters?.estado || 'all'
    );
    
    // Debug: verificar se os filtros iniciais estão chegando
    console.log('useRecibos - initialFilters:', initialFilters);
    console.log('useRecibos - statusFilter inicial:', initialFilters?.estado || 'all');
    const { token } = useSessionCheckToken();
    const { profile } = useUserProfile();
    // Busca os recibos da API
    const nifUser = profile?.user?.nif;
    useEffect(() => {
        if (!token || !nifUser) return;

        const controller = new AbortController();
        const { signal } = controller;

        const fetchRecibos = async () => {
            setIsLoadingRecibos(true);
            setErrorRecibo(null);

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

                setRecibos(recibosData);
                setFilteredRecibos(recibosData); // Inicializa com todos os recibos
            } catch (error) {
                if (signal.aborted) return;

                const errorMessage = error instanceof Error
                    ? error.message
                    : "Erro ao carregar recibos";
                setErrorRecibo(errorMessage);
            } finally {
                setIsLoadingRecibos(false);
            }
        };

        fetchRecibos();

        return () => controller.abort();
    }, [token, nifUser]);

    // Aplica os filtros sempre que houver mudanças
    useEffect(() => {
        let result = [...recibos];

        // Filtro de texto
        if (searchTerm.trim() !== "") {
            const term = searchTerm.toLowerCase();
            result = result.filter(
                (recibo) =>
                    recibo.clientName?.toLowerCase().includes(term) ||
                    recibo.number?.toLowerCase().includes(term) ||
                    (recibo.mbref && recibo.mbref.toLowerCase().includes(term))
            );
        }

        // Filtro de status
        if (statusFilter !== "all") {
            const statusNum = parseInt(statusFilter);
            console.log('Aplicando filtro de status:', statusFilter, '->', statusNum);
            console.log('Recibos antes do filtro:', result.length);
            
            // Para "Em Cobrança" (status 1), incluir também status 2
            if (statusNum === 1) {
                result = result.filter((recibo) => recibo.status === 1 || recibo.status === 2);
            } else {
                result = result.filter((recibo) => recibo.status === statusNum);
            }
            
            console.log('Recibos após filtro:', result.length);
        }

        setFilteredRecibos(result);
    }, [searchTerm, statusFilter, recibos]);

    return {
        recibos,
        filteredRecibos,
        isLoadingRecibos,
        errorRecibo,
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