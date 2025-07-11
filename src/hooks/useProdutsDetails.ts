import { useState, useEffect, useCallback } from 'react';
import { ApiResponse, Product } from '@/types/typesData';

export const useProductDetails = (productId: string) => {
    const [product, setProduct] = useState<Product | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchProductDetails = useCallback(async (id: string) => {
        try {
            setLoading(true);
            setError(null);

            const apiToken = process.env.API_SECRET_TOKEN;
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_BASE_URL_SIMULATOR}/simulador/1.0.0/products/${id}`,
                {
                    headers: {
                        Authorization: `Bearer ${apiToken}`,
                        ApiKey: process.env.NEXT_PUBLIC_API_KEY || '',
                        'Content-Type': 'application/json',
                    },
                }
            );

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to fetch product details');
            }

            const data: ApiResponse<Product> = await response.json();
            setProduct(data.results);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Unknown error occurred');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (productId) {
            fetchProductDetails(productId);
        }
    }, [productId, fetchProductDetails]);

    const refresh = () => {
        if (productId) {
            fetchProductDetails(productId);
        }
    };

    return { product, loading, error, refresh };
};