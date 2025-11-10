import { useState, useEffect } from 'react';

interface DomainOption {
    value: string;
    label: string;
}

interface DomainResponse {
    info?: {
        status: number;
    };
    results?: any[];
}

export const useDomain = (domainName: string | null) => {
    const [options, setOptions] = useState<DomainOption[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!domainName) {
            setOptions([]);
            return;
        }

        const fetchDomainData = async () => {
            setLoading(true);
            setError(null);
            
            try {
                const response = await fetch(`/api/domain?name=${encodeURIComponent(domainName)}`);
                
                if (!response.ok) {
                    throw new Error(`Erro ao buscar domínio: ${response.status}`);
                }

                const data: DomainResponse = await response.json();
                
                if (data.results && Array.isArray(data.results)) {
                    // Mapeia os resultados para o formato de opções do select
                    // API retorna: { code: "2", description: "São Vicente" }
                    const mappedOptions = data.results.map((item: any) => ({
                        value: item.code,
                        label: item.description
                    }));
                    
                    setOptions(mappedOptions);
                } else {
                    setOptions([]);
                }
            } catch (err) {
                console.error('Erro ao buscar domínio:', err);
                setError(err instanceof Error ? err.message : 'Erro desconhecido');
                setOptions([]);
            } finally {
                setLoading(false);
            }
        };

        fetchDomainData();
    }, [domainName]);

    return { options, loading, error };
};

