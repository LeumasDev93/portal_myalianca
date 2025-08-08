import { useState, useEffect, useCallback } from 'react';
import { ApiResponse, Product } from '@/types/typesData';

export const useProductsList = () => {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchProductsList = useCallback(async () => {
        try {
            console.log("=== DEBUG PRODUCTS LIST ===");
            setLoading(true);
            setError(null);

            const response = await fetch('/api/products');

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to fetch products list');
            }

            const data: ApiResponse<Product[]> = await response.json();
            console.log("Products list received:", data);
            setProducts(data.results || []);
        } catch (err) {
            console.error("Error in fetchProductsList:", err);
            setError(err instanceof Error ? err.message : 'Unknown error occurred');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchProductsList();
    }, [fetchProductsList]);

    const refresh = () => {
        fetchProductsList();
    };

    return { products, loading, error, refresh };
}; 