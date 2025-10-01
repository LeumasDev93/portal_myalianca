// hooks/useApolices.ts
import { useState, useEffect } from 'react';
import { useSessionCheckToken } from './useSessionToken';
import { useUserProfile } from './useUserProfile ';
import { ApoliceData } from '@/types/typesData';

interface ApolicesState {
    apolices: ApoliceData[];
    isLoading: boolean;
    error: string | null;
}

export const useApolices = () => {
    // Estado único - SEM inicializar apolices como array vazio
    const [state, setState] = useState<ApolicesState>({
        apolices: [],
        isLoading: true,
        error: null
    });
    
    const [dataLoaded, setDataLoaded] = useState(false);

    const { token } = useSessionCheckToken();
    const { profile } = useUserProfile();
    const nifUser = profile?.user?.nif;

    useEffect(() => {
        if (!token || !nifUser) {
            setState({ apolices: [], isLoading: false, error: null });
            return;
        }

        const controller = new AbortController();
        const { signal } = controller;

        const fetchApolices = async () => {
            // Iniciar loading
            setState({ apolices: [], isLoading: true, error: null });

            try {
                const response = await fetch(
                    `/api/anywhere/api/v1/private/mobile/entity/nif/${nifUser}/policies`,
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
                const apolicesData = Array.isArray(data) ? data : [data];
                
                // ✅ Atualização ATÔMICA - tudo de uma vez
                setState({
                    apolices: apolicesData,
                    isLoading: false,
                    error: null
                });
                setDataLoaded(true);
            } catch (error) {
                if (signal.aborted) {
                    console.log("Requisição cancelada");
                    return;
                }

                const errorMessage = error instanceof Error
                    ? error.message
                    : "Erro ao carregar apólices. Tente novamente mais tarde.";

                console.error("Erro ao buscar apólices:", error);
                
                // ✅ Erro ATÔMICO
                setState({
                    apolices: [],
                    isLoading: false,
                    error: errorMessage
                });
            }
        };

        fetchApolices();

        return () => {
            controller.abort();
        };
    }, [token, nifUser]);

    return { 
        apolices: state.apolices, 
        isLoadingApolices: state.isLoading || !dataLoaded, 
        errorApolices: state.error,
        hasData: dataLoaded && state.apolices.length > 0
    };
};