import { useState, useEffect } from 'react';
import { useSessionCheckToken } from './useSessionToken';
import { useUserProfile } from './useUserProfile ';
import { SinistroData } from '@/types/typesData';

interface SinistrosState {
    sinistros: SinistroData[];
    isLoading: boolean;
    error: string | null;
}

export const useSinistros = () => {
    // Estado único para evitar múltiplos re-renders
    const [state, setState] = useState<SinistrosState>({
        sinistros: [],
        isLoading: true,
        error: null
    });
    
    const [dataLoaded, setDataLoaded] = useState(false);

    const { token } = useSessionCheckToken();
    const { profile } = useUserProfile();
    const nifUser = profile?.user?.nif;

    useEffect(() => {
        if (!token || !nifUser) {
            setState({ sinistros: [], isLoading: false, error: null });
            return;
        }

        const controller = new AbortController();
        const { signal } = controller;

        const fetchSinistros = async () => {
            // Iniciar loading
            setState({ sinistros: [], isLoading: true, error: null });

            try {
                const response = await fetch(
                    `/api/anywhere/api/v1/private/mobile/entity/nif/${nifUser}/claims`,
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
                const sinistrosData = Array.isArray(data) ? data : [data];
                
                // ✅ Atualização ATÔMICA - tudo de uma vez
                setState({
                    sinistros: sinistrosData,
                    isLoading: false,
                    error: null
                });
                setDataLoaded(true);
            } catch (error) {
                if (signal.aborted) {
                    console.log("Requisição de sinistros cancelada");
                    return;
                }

                const errorMessage = error instanceof Error
                    ? error.message
                    : "Erro ao carregar sinistros. Tente novamente mais tarde.";

                console.error("Erro ao buscar sinistros:", error);
                
                // ✅ Erro ATÔMICO
                setState({
                    sinistros: [],
                    isLoading: false,
                    error: errorMessage
                });
            }
        };

        fetchSinistros();

        return () => {
            controller.abort();
        };
    }, [token, nifUser]);

    return {
        sinistros: state.sinistros,
        isLoadingSinistros: state.isLoading || !dataLoaded,
        errorSinistros: state.error,
    };
};
