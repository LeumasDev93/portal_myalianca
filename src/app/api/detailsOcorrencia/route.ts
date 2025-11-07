// app/api/ocorrencia/route.ts
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Parâmetro "id" é obrigatório' },
        { status: 400 }
      );
    }

    const { NEXT_PUBLIC_API_BASE_URL, API_SECRET_TOKEN, NEXT_PUBLIC_API_KEY } = process.env;

    if (!NEXT_PUBLIC_API_BASE_URL || !API_SECRET_TOKEN) {
      throw new Error('Variáveis de ambiente não configuradas');
    }

    const apiUrl = `${NEXT_PUBLIC_API_BASE_URL}/ocorrencias/${id}`;

    const response = await fetch(apiUrl, {
      headers: {
        Authorization: `Bearer ${API_SECRET_TOKEN}`,
        ApiKey: NEXT_PUBLIC_API_KEY || '',
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    });

    const responseText = await response.text();

    if (!response.ok) {
      throw new Error(`Erro HTTP: ${response.status}`);
    }

    const parsed = JSON.parse(responseText);

    if (!parsed || !parsed.results) {
      throw new Error('Formato de resposta inesperado: campo "results" não encontrado.');
    }

    // Se results é um objeto (dados de uma única ocorrência), retorna como array
    if (typeof parsed.results === 'object' && !Array.isArray(parsed.results)) {
      return NextResponse.json([parsed.results], { status: 200 });
    }

    // Se results já é um array, retorna diretamente
    if (Array.isArray(parsed.results)) {
      return NextResponse.json(parsed.results, { status: 200 });
    }

    throw new Error('Formato de resposta inesperado: campo "results" não é um objeto ou array válido.');

  } catch (error) {
    console.error('[Erro interno]', error);
    return NextResponse.json(
      {
        error: 'Falha ao buscar detalhes da ocorrência',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
