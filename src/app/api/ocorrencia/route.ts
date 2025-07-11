// app/api/ocorrencia/route.ts
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('user_id');

    if (!userId) {
      return NextResponse.json(
        {
          info: {
            count: 0,
            page: 1,
            status: 400,
            errors: ['Parâmetro user_id é obrigatório']
          },
          results: []
        },
        { status: 400 }
      );
    }

    if (!process.env.NEXT_PUBLIC_API_BASE_URL || !process.env.API_SECRET_TOKEN) {
      throw new Error('Variáveis de ambiente não configuradas');
    }

    const apiUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}/sinistros?user_id=${userId}`;
    const response = await fetch(apiUrl, {
      headers: {
        'Authorization': `Bearer ${process.env.API_SECRET_TOKEN}`,
        'ApiKey': process.env.NEXT_PUBLIC_API_KEY || '',
        'Content-Type': 'application/json'
      }
    });

    const responseText = await response.text();

    if (!response.ok) {
      return NextResponse.json(
        {
          info: {
            count: 0,
            page: 1,
            status: response.status,
            errors: [`Erro na API externa: ${response.statusText}`]
          },
          results: []
        },
        { status: response.status }
      );
    }

    const data = JSON.parse(responseText);

    // ✅ Verifica se 'results' é um array dentro do objeto retornado
    if (!data || !Array.isArray(data.results)) {
      return NextResponse.json(
        {
          info: {
            count: 0,
            page: 1,
            status: 500,
            errors: ['Formato de dados inválido - esperado objeto com array em "results"']
          },
          results: []
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      info: {
        count: data.results.length,
        page: 1,
        status: 200,
        errors: null
      },
      results: data.results
    });

  } catch (error) {
    return NextResponse.json(
      {
        info: {
          count: 0,
          page: 1,
          status: 500,
          errors: [error instanceof Error ? error.message : 'Erro desconhecido']
        },
        results: []
      },
      { status: 500 }
    );
  }
}
