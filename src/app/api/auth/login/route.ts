import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json();

    if (!username || !password) {
      return NextResponse.json(
        { error: 'Username e password são obrigatórios' },
        { status: 400 }
      );
    }

    const apiUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}/accounts/login`;

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'ApiKey': process.env.NEXT_PUBLIC_API_KEY || '' // adicione a chave de API aqui
      },
      body: JSON.stringify({ username, password })
    });

    const responseData = await response.json();

    console.log('Resposta da API:', responseData);

    if (!response.ok) {
      return NextResponse.json(
        {
          error: responseData.response?.desc || 'Erro ao autenticar',
          details: responseData,
        },
        { status: response.status }
      );
  }


    return NextResponse.json({
    ...responseData,
    token: responseData.token,
  });

    
  } catch (error) {
    console.error('Erro interno:', error);
    return NextResponse.json(
      { error: 'Erro interno no servidor' },
      { status: 500 }
    );
  }
}
