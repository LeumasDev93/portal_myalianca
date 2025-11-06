import { NextResponse } from 'next/server';

// Configuração de revalidação estática a cada 60 segundos
export const revalidate = 60;

export async function GET() {
  try {
    const apiUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL_SIMULATOR}/simulador/1.0.0/products`;
    const apiToken = process.env.API_SECRET_TOKEN;
    const apiKey = process.env.NEXT_PUBLIC_API_KEY;

    if (!apiToken || !apiKey || !apiUrl) {
      return NextResponse.json(
        { error: 'Configuração da API incompleta' },
        { status: 500 }
      );
    }

    const response = await fetch(apiUrl, {
      headers: {
        'Authorization': `Bearer ${apiToken}`,
        'ApiKey': apiKey,
        'Content-Type': 'application/json',
      },
      next: { revalidate: 60 }, // Cache por 60 segundos
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: `Erro ao buscar produtos: ${response.status}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    
    // Retorna com headers de cache
    return NextResponse.json(data, {
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120',
      },
    });
  } catch (error) {
    console.error('Erro ao buscar produtos:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
