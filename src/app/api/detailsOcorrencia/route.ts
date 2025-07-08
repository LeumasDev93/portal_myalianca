// app/api/ocorrencia/route.ts
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Parâmetro user_id é obrigatório' },
        { status: 400 }
      );
    }

    if (!process.env.NEXT_PUBLIC_API_BASE_URL || !process.env.API_SECRET_TOKEN) {
      throw new Error('Variáveis de ambiente não configuradas');
    }

    const apiUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}/sinistros?id=${id}`;

    console.log('URL da API chamada:', apiUrl); // Log para debug

    const response = await fetch(apiUrl, {
      headers: {
        'Authorization': `Bearer ${process.env.API_SECRET_TOKEN}`,
        'ApiKey': process.env.NEXT_PUBLIC_API_KEY || '',
        'Content-Type': 'application/json'
      },
      // next: { revalidate: 3600 } // Comente temporariamente para testes
    });

    const responseText = await response.text();
    console.log('Resposta bruta:', responseText); // Log da resposta bruta

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = JSON.parse(responseText); // Parse manual para evitar problemas

    if (!Array.isArray(data)) {
      console.error('Dados recebidos não são array:', data);
      throw new Error('Formato de dados inválido - esperado array');
    }

    console.log('Dados retornados:', data.length, 'itens'); // Log do tamanho
    return NextResponse.json(data);

  } catch (error) {
    console.error('Erro completo:', error);
    return NextResponse.json(
      {
        error: 'Falha ao buscar ocorrências',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}