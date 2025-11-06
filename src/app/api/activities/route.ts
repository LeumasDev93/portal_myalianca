import { NextRequest, NextResponse } from 'next/server';

// Rota dinâmica com cache - O next.revalidate no fetch cacheia por 60s
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
      `${apiBaseUrl}/user/activity/1.0.0/user/${userId}/last?limit=10`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'ApiKey': apiKey,
        },
        next: { revalidate: 60 }, // Cache por 60 segundos
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      return NextResponse.json(
        { error: errorData.message || 'Erro ao buscar atividades' },
        { status: response.status }
      );
    }

    const data = await response.json();
    
    // Retorna com headers de cache
    return NextResponse.json(data, {
      headers: {
        'Cache-Control': 'public, s-maxage=10, stale-while-revalidate=20',
      },
    });
  } catch (error) {
    console.error('Erro ao buscar atividades:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, action, description } = body;

    if (!userId || !action || !description) {
      return NextResponse.json(
        { error: 'Campos obrigatórios faltando (userId, action, description)' },
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

    const requestData = {
      user_id: userId,
      action,
      description,
    };

    const response = await fetch(`${apiBaseUrl}/user/activity/1.0.0`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'ApiKey': apiKey,
      },
      body: JSON.stringify(requestData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      return NextResponse.json(
        { error: errorData.message || 'Erro ao registrar atividade' },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Erro ao registrar atividade:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

