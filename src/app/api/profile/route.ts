import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('user');

  if (!userId) {
    return NextResponse.json(
      { error: 'Parâmetro user_id é obrigatório.' },
      { status: 400 }
    );
  }

  const apiUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}/accounts/profile?user_id=${userId}`;
  const apiToken = process.env.API_SECRET_TOKEN;

  try {
    const response = await fetch(apiUrl, {
      headers: {
        'Authorization': `Bearer ${apiToken}`,
        'ApiKey': process.env.NEXT_PUBLIC_API_KEY || ''
      }
    });

    const responseData = await response.json();
    const { info, results } = responseData;

    // Verifica se a resposta foi bem-sucedida
    if (!info || info.status !== 200 || !results) {
      const errorMessage = info?.errors?.[0] || 'Erro ao buscar dados do perfil.';
      return NextResponse.json(
        {
          error: errorMessage,
          details: info?.errors || null,
        },
        { status: info?.status || 500 }
      );
    }

    // Sucesso
    return NextResponse.json({
      profile: results
    });

  } catch (error) {
    return NextResponse.json(
      {
        error: 'Erro interno ao buscar dados do perfil.',
        details: error instanceof Error ? error.message : error
      },
      { status: 500 }
    );
  }
}
