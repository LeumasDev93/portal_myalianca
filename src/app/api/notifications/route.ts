import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'Parâmetro userId é obrigatório' },
        { status: 400 }
      );
    }

    const apiKey = process.env.NEXT_PUBLIC_API_KEY;
    const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL_DEFAULT;

    if (!apiKey || !apiBaseUrl) {
      return NextResponse.json(
        { error: 'Configuração da API incompleta' },
        { status: 500 }
      );
    }

    const response = await fetch(
      `${apiBaseUrl}/notifications/1.0.0?user_id=${userId}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'ApiKey': apiKey,
        },
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      return NextResponse.json(
        { error: errorData.message || 'Erro ao buscar notificações' },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Erro ao buscar notificações:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

