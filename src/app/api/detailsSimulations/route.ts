
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const reference = searchParams.get('reference');

    if (!reference) {
        console.log("Erro: reference não fornecido");
        return NextResponse.json(
            { error: 'Parâmetro "reference" é obrigatório na URL.' },
            { status: 400 }
        );
    }

    const apiUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL_SIMULATOR}/simulador/1.0.0/simulations/${reference}`;
    const apiToken = process.env.API_SECRET_TOKEN;

    if (!apiUrl || !apiToken) {
        return NextResponse.json(
            { error: 'Variáveis de ambiente da API estão faltando.' },
            { status: 500 }
        );
    }

    try {
        const response = await fetch(apiUrl, {
            headers: {
                Authorization: `Bearer ${apiToken}`,
                ApiKey: process.env.NEXT_PUBLIC_API_KEY || '',
            },
        });

        const responseData = await response.json();
        
        const { info, results } = responseData;

        if (!info || info.status !== 200 || !results) {
            const errorMessage = info?.errors?.[0] || 'Erro ao buscar simulação.';
            return NextResponse.json(
                {
                    error: errorMessage,
                    details: info?.errors || null,
                },
                { status: info?.status || 500 }
            );
        }

        return NextResponse.json({ simulation: results });
    } catch (error) {
        return NextResponse.json(
            {
                error: 'Erro interno ao buscar simulação.',
                details: error instanceof Error ? error.message : error,
            },
            { status: 500 }
        );
    }
}
