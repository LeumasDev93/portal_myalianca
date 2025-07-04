// hooks/useApolices.ts
import { useState, useEffect } from 'react';
import { useSessionCheckToken } from './useSessionToken';
import { useUserProfile } from './useUserProfile ';
import { ApoliceData } from '@/types/typesData';


export const useApolices = () => {
    const [apolices, setApolices] = useState<ApoliceData[]>([]);
    const [isLoadingApolices, setIsLoadingApolices] = useState(false);
    const [errorApolices, setErrorApolices] = useState<string | null>(null);
    const { token } = useSessionCheckToken();
    const { profile } = useUserProfile();


    useEffect(() => {
        if (!token || !profile?.nif) return;

        const controller = new AbortController();
        const { signal } = controller;

        const fetchApolices = async () => {
            setIsLoadingApolices(true);
            setErrorApolices(null);

            try {
                const response = await fetch(
                    `/api/anywhere/api/v1/private/mobile/entity/nif/${profile.nif}/policies`,
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
                setApolices(Array.isArray(data) ? data : [data]);
            } catch (error) {
                if (signal.aborted) {
                    console.log("Requisição cancelada");
                    return;
                }

                const errorMessage = error instanceof Error
                    ? error.message
                    : "Erro ao carregar apólices. Tente novamente mais tarde.";

                console.error("Erro ao buscar apólices:", error);
                setErrorApolices(errorMessage);
            } finally {
                setIsLoadingApolices(false);
            }
        };

        fetchApolices();

        return () => {
            controller.abort();
        };
    }, [token, profile?.nif]);

    return { apolices, isLoadingApolices, errorApolices };
};