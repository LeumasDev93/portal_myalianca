import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: 'O campo email é obrigatório' },
        { status: 400 }
      );
    }

    const apiUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}/accounts/password/recover`;

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'ApiKey': process.env.NEXT_PUBLIC_API_KEY || '',
      },
      body: JSON.stringify({ email }),
    });

    const data = await response.json().catch(() => ({}));

    // Verifica se veio um erro no formato específico:
    if (data.info?.status === 500 && Array.isArray(data.info.errors) && data.info.errors.length > 0) {
      return NextResponse.json(
        { error: data.info.errors[0] },
        { status: 500 }
      );
    }

    // Verifica erro genérico (quando o response não é ok)
    if (!response.ok) {
      return NextResponse.json(
        {
          error: data.message || 'Erro ao solicitar recuperação de senha',
          details: data,
        },
        { status: response.status }
      );
    }

    return NextResponse.json(data);

  } catch (error) {
    console.error('Erro interno:', error);
    return NextResponse.json(
      { error: 'Erro interno no servidor' },
      { status: 500 }
    );
  }
}
