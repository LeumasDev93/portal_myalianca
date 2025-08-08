import { NextRequest, NextResponse } from 'next/server';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    console.log("=== DEBUG API PRODUCTS ===");
    const { id: productId } = await params;
    console.log("Product ID requested:", productId);

    if (!productId) {
        console.log("Error: Product ID is required");
        return NextResponse.json(
            { error: 'Product ID is required' },
            { status: 400 }
        );
    }

    const apiUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL_SIMULATOR}/simulador/1.0.0/products/${productId}`;
    const apiToken = process.env.API_SECRET_TOKEN;
    console.log("API URL:", apiUrl);
    console.log("API Token exists:", !!apiToken);

    if (!apiUrl || !apiToken) {
        console.log("Error: API environment variables are missing");
        return NextResponse.json(
            { error: 'API environment variables are missing' },
            { status: 500 }
        );
    }

    try {
        console.log("Making request to external API...");
        const response = await fetch(apiUrl, {
            headers: {
                Authorization: `Bearer ${apiToken}`,
                ApiKey: process.env.NEXT_PUBLIC_API_KEY || '',
                'Content-Type': 'application/json',
            },
        });

        console.log("External API response status:", response.status);
        const responseData = await response.json();
        console.log("External API response data:", responseData);

        if (!response.ok) {
            console.log("External API error:", responseData);
            return NextResponse.json(
                { error: 'Failed to fetch product details', details: responseData },
                { status: response.status }
            );
        }

        console.log("Successfully returning product data");
        return NextResponse.json(responseData);
    } catch (error) {
        console.error("Error in API route:", error);
        return NextResponse.json(
            {
                error: 'Internal error while fetching product details',
                details: error instanceof Error ? error.message : error,
            },
            { status: 500 }
        );
    }
} 