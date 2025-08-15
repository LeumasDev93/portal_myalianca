/* eslint-disable @typescript-eslint/no-explicit-any */
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
            errors: ['Parâmetro "user_id" é obrigatório.'],
          },
          results: [],
        },
        { status: 400 }
      );
    }

    const { NEXT_PUBLIC_API_BASE_URL, API_SECRET_TOKEN, NEXT_PUBLIC_API_KEY } = process.env;

    if (!NEXT_PUBLIC_API_BASE_URL || !API_SECRET_TOKEN) {
      return NextResponse.json(
        {
          info: {
            count: 0,
            page: 1,
            status: 500,
            errors: ['Variáveis de ambiente obrigatórias não configuradas.'],
          },
          results: [],
        },
        { status: 500 }
      );
    }

    const apiUrl = `${NEXT_PUBLIC_API_BASE_URL}/sinistros?user_id=${userId}`;
    const externalResponse = await fetch(apiUrl, {
      headers: {
        Authorization: `Bearer ${API_SECRET_TOKEN}`,
        ApiKey: NEXT_PUBLIC_API_KEY || '',
        'Content-Type': 'application/json',
      },
    });

    const rawData = await externalResponse.text();
    const data = rawData ? JSON.parse(rawData) : null;

    if (!externalResponse.ok) {
      return NextResponse.json(
        {
          info: {
            count: 0,
            page: 1,
            status: externalResponse.status,
            errors: [`Erro na API externa: ${externalResponse.statusText}`],
          },
          results: [],
        },
        { status: externalResponse.status }
      );
    }

    if (!data || !Array.isArray(data.results)) {
      return NextResponse.json(
        {
          info: {
            count: 0,
            page: 1,
            status: 500,
            errors: ['Formato inválido: era esperado "results" como array.'],
          },
          results: [],
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      info: {
        count: data.results.length,
        page: 1,
        status: 200,
        errors: null,
      },
      results: data.results,
    });
  } catch (error: unknown) {
    return NextResponse.json(
      {
        info: {
          count: 0,
          page: 1,
          status: 500,
          errors: [error instanceof Error ? error.message : 'Erro interno inesperado.'],
        },
        results: [],
      },
      { status: 500 }
    );
  }
}
