import { useState, useEffect } from 'react';
import { useSessionCheckToken } from './useSessionToken';
import { useUserProfile } from './useUserProfile ';
import { SinistroData } from '@/types/typesData';


export const useSinistros = () => {
    const [sinistros, setSinistros] = useState<SinistroData[]>([]);
    const [isLoadingSinistros, setIsLoadingSinistros] = useState(false);
    const [errorSinistros, setErrorSinistros] = useState<string | null>(null);
    const { token } = useSessionCheckToken();
    const { profile } = useUserProfile();

    const nifUser = profile?.user?.nif;

    useEffect(() => {
        if (!token || !nifUser) return;

        const controller = new AbortController();
        const { signal } = controller;

        const fetchSinistros = async () => {
            setIsLoadingSinistros(true);
            setErrorSinistros(null);

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
                setSinistros(Array.isArray(data) ? data : [data]);
            } catch (error) {
                if (signal.aborted) {
                    console.log("Requisição de sinistros cancelada");
                    return;
                }

                const errorMessage = error instanceof Error
                    ? error.message
                    : "Erro ao carregar sinistros. Tente novamente mais tarde.";

                console.error("Erro ao buscar sinistros:", error);
                setErrorSinistros(errorMessage);
            } finally {
                setIsLoadingSinistros(false);
            }
        };

        fetchSinistros();

        return () => {
            controller.abort();
        };
    }, [token, nifUser]);

    return {
        sinistros,
        isLoadingSinistros,
        errorSinistros,
        refetch: () => {
            // Forçar nova requisição se necessário
            setSinistros([]);
            setErrorSinistros(null);
        }
    };
};