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
      `${apiBaseUrl}/quick-access/1.0.0/user/${userId}`,
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
        { error: errorData.message || 'Erro ao buscar acesso rápido' },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Erro ao buscar acesso rápido:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    console.log('POST /api/quick-access - Body recebido:', body);
    
    // Aceita tanto 'link' quanto 'menu_path'
    const link = body.menu_path || body.link;
    
    const { user_id, nome, titulo, icone, border_color, icon_color, bg_color, text_color, descricao_botao, bg_botton_color, order_number } = body;

    // Validação dos campos obrigatórios
    if (!user_id || !nome || !titulo || !icone || !descricao_botao || !link) {
      console.log('Campos faltando:', { user_id, nome, titulo, icone, descricao_botao, link });
      return NextResponse.json(
        { error: 'Campos obrigatórios faltando' },
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
      user_id,
      nome,
      titulo,
      icone,
      link, // A API externa espera 'link'
      border_color,
      icon_color,
      bg_color,
      text_color,
      descricao_botao,
      bg_botton_color,
      order_number,
    };

    console.log('POST /api/quick-access - Enviando para API externa:', requestData);
    
    const response = await fetch(`${apiBaseUrl}/quick-access/1.0.0`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'ApiKey': apiKey,
      },
      body: JSON.stringify(requestData),
    });

    console.log('POST /api/quick-access - Status da API externa:', response.status);

    if (!response.ok) {
      const errorData = await response.json();
      console.log('POST /api/quick-access - Erro da API externa:', errorData);
      return NextResponse.json(
        { error: errorData.message || 'Erro ao adicionar acesso rápido' },
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log('POST /api/quick-access - Sucesso da API externa:', data);
    return NextResponse.json(data);
  } catch (error) {
    console.error('Erro ao adicionar acesso rápido:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

