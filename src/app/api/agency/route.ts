// app/api/agency/route.ts
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    const apiUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}/agencys`;
    const apiToken = process.env.API_SECRET_TOKEN;

    const response = await fetch(apiUrl, {
      headers: {
        'Authorization': `Bearer ${apiToken}`,
        'ApiKey': process.env.NEXT_PUBLIC_API_KEY || ''
      }
    });

    // Se a requisição falhar diretamente
    if (!response.ok) {
      return NextResponse.json({
        error: `Erro HTTP ao buscar agências: ${response.status}`
      }, { status: response.status });
    }

    const data = await response.json();

    // Agora verifica se o próprio conteúdo da resposta contém erro
    if (data?.info?.status !== 200 || data?.info?.errors) {
      return NextResponse.json({
        error: 'Erro retornado pela API',
        details: data?.info?.errors || 'Erro desconhecido'
      }, { status: 500 });
    }

    // Sucesso
    return NextResponse.json(data, { status: 200 });

  } catch (error) {
    console.error('Erro ao buscar agências:', error);
    return NextResponse.json(
      {
        error: 'Falha ao buscar as agências',
        details: error instanceof Error ? error.message : 'Erro desconhecido'
      },
      { status: 500 }
    );
  }
}
