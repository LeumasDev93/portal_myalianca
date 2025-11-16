import { NextRequest, NextResponse } from 'next/server';

// Rota dinâmica sem cache - sempre busca dados atualizados
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
      console.error('[/api/activities][GET] Variáveis de ambiente ausentes', { hasApiKey: !!apiKey, hasBaseUrl: !!apiBaseUrl });
      return NextResponse.json(
        { error: 'Configuração da API incompleta (API Key/Base URL ausentes)' },
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
        cache: 'no-store',
      }
    );

    if (!response.ok) {
      const errorText = await response.text().catch(() => '');
      console.error('[/api/activities][GET] Erro na API externa', response.status, errorText);
      return NextResponse.json(
        { error: errorText || 'Erro ao buscar atividades' },
        { status: response.status }
      );
    }

    const data = await response.json();
    
    return NextResponse.json(data);
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
      console.error('[/api/activities][POST] Variáveis de ambiente ausentes', { hasApiKey: !!apiKey, hasBaseUrl: !!apiBaseUrl });
      return NextResponse.json(
        { error: 'Configuração da API incompleta (API Key/Base URL ausentes)' },
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
      cache: 'no-store',
      body: JSON.stringify(requestData),
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => '');
      console.error('[/api/activities][POST] Erro na API externa', response.status, errorText, { requestData });
      return NextResponse.json(
        { error: errorText || 'Erro ao registrar atividade' },
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

export async function DELETE(request: NextRequest) {
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
      console.error('[/api/activities][DELETE] Variáveis de ambiente ausentes', { hasApiKey: !!apiKey, hasBaseUrl: !!apiBaseUrl });
      return NextResponse.json(
        { error: 'Configuração da API incompleta (API Key/Base URL ausentes)' },
        { status: 500 }
      );
    }

    const response = await fetch(
      `${apiBaseUrl}/user/activity/1.0.0/user/${userId}`,
      {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'ApiKey': apiKey,
        },
        cache: 'no-store',
      }
    );

    if (!response.ok) {
      const errorText = await response.text().catch(() => '');
      console.error('[/api/activities][DELETE] Erro na API externa', response.status, errorText);
      return NextResponse.json(
        { error: errorText || 'Erro ao limpar atividades' },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Erro ao limpar atividades:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

