import { NextRequest, NextResponse } from 'next/server';

const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL_DEFAULT || 'https://api.aliancaseguros.cv';
const API_KEY = process.env.NEXT_PUBLIC_API_KEY;

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('user_id');

    if (!userId) {
      return NextResponse.json(
        { error: 'user_id é obrigatório' },
        { status: 400 }
      );
    }

    if (!API_KEY) {
      console.error('❌ NEXT_PUBLIC_API_KEY não configurada no .env');
      return NextResponse.json(
        { error: 'API Key não configurada' },
        { status: 500 }
      );
    }

    // Construir a URL completa
    const endpoint = `${API_URL}/messages/1.0.0/count-not-read?user_id=${encodeURIComponent(userId)}`;

    console.log(`📡 [API Count Not Read] Chamando: ${endpoint}`);

    const response = await fetch(endpoint, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'ApiKey': API_KEY,
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('❌ [API Count Not Read] Erro na resposta:', {
        status: response.status,
        statusText: response.statusText,
        errorData,
      });
      return NextResponse.json(errorData, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data, { status: 200 });

  } catch (error) {
    console.error('💥 [API Count Not Read] Erro interno:', error);
    return NextResponse.json(
      { 
        error: 'Erro interno no servidor', 
        message: error instanceof Error ? error.message : String(error) 
      },
      { status: 500 }
    );
  }
}

