// app/api/auth/change-password/route.ts
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const { senha_atual, nova_senha, user_id } = await request.json();

    if (!senha_atual || !nova_senha || !user_id) {
      return NextResponse.json(
        { error: 'Todos os campos são obrigatórios' },
        { status: 400 }
      );
    }

    const apiUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}/accounts/password/change`;

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'ApiKey': process.env.NEXT_PUBLIC_API_KEY || ''
      },
      body: JSON.stringify({
        user_id,
        current_password: senha_atual,
        new_password: nova_senha
      })
    });

    const data = await response.json();

    if (!response.ok) {
      const errorMessage =
        data?.info?.errors?.length > 0
          ? data.info.errors.join(' / ')
          : data?.response?.desc || 'Erro ao alterar senha';

      return NextResponse.json(
        {
          error: errorMessage,
          details: data
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
