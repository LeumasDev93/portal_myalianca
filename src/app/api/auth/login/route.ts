import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json();

    if (!username || !password) {
      return NextResponse.json(
        { error: 'Username e password são obrigatórios.' },
        { status: 400 }
      );
    }

    const apiUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}/accounts/login`;

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'ApiKey': process.env.NEXT_PUBLIC_API_KEY || '',
      },
      body: JSON.stringify({ username, password }),
    });

    const responseData = await response.json();
    const { info, results } = responseData;

    console.log('Resposta da API:', responseData);

    // Verifica se a resposta da API tem erro
    if (!info || info.status !== 200 || !results) {
      const errorMessage = info?.errors?.[0] || 'Erro ao autenticar.';

      return NextResponse.json(
        {
          error: errorMessage,
          details: info?.errors || null,
        },
        { status: info?.status || 500 }
      );
    }

    // Resposta com sucesso
    return NextResponse.json({
      user: results,
      sessionId: results.session_id,
    });

  } catch (error) {
    console.error('Erro interno:', error);
    return NextResponse.json(
      { error: 'Erro interno no servidor.' },
      { status: 500 }
    );
  }
}
