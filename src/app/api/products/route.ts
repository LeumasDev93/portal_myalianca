import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
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
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: `Erro ao buscar produtos: ${response.status}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Erro ao buscar produtos:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
