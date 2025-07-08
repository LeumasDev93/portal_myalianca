// app/api/ocorrencia/route.ts
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Validação das variáveis de ambiente
    if (!process.env.NEXT_PUBLIC_API_BASE_URL || !process.env.API_SECRET_TOKEN || !process.env.NEXT_PUBLIC_API_KEY) {
      throw new Error('Variáveis de ambiente não configuradas corretamente');
    }

    const apiUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}/sinistros`;
    const response = await fetch(apiUrl, {
      headers: {
        'Authorization': `Bearer ${process.env.API_SECRET_TOKEN}`,
        'ApiKey': process.env.NEXT_PUBLIC_API_KEY,
        'Content-Type': 'application/json'
      },
      next: { revalidate: 3600 } // Cache de 1 hora
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw new Error(
        `Erro ao buscar ocorrências: ${response.status} - ${response.statusText}`,
        { cause: errorData?.message || 'Unknown error' }
      );
    }

    const data = await response.json();

    // Validação básica dos dados
    if (!Array.isArray(data)) {
      throw new Error('Formato de dados inválido da API');
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Erro ao buscar ocorrências:', error);

    return NextResponse.json(
      {
        error: 'Falha ao buscar as ocorrências',
        details: error instanceof Error ? error.message : 'Erro desconhecido'
      },
      { status: 500 }
    );
  }
}