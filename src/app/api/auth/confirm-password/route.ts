import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

function extractUserMessage(desc: string): string {
  const matches = [...desc.matchAll(/default message \[(.*?)\]/g)];
  if (matches.length > 0) {
    return matches.map((m) => m[1]).join(' / ');
  }
  return desc;
}
export async function POST(request: Request) {
  try {
    const { email, otp, new_password } = await request.json();

    if (!email || !otp || !new_password) {
      return NextResponse.json(
        { error: 'O campo email é obrigatório' },
        { status: 400 }
      );
    }

    const apiUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}/accounts/password/recover-confirm`;

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'ApiKey': process.env.NEXT_PUBLIC_API_KEY || '' // adicione a chave de API aqui
      },
      body: JSON.stringify({ email, otp, new_password }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return NextResponse.json(
        {
          error: errorData.message || 'Erro ao solicitar recuperação de senha',
          details: errorData,
        },
        { status: response.status }
      );
    }

    const data = await response.json();
    if (data.response?.code === "0") {
      const desc = data.response?.desc;
      return NextResponse.json(
        {
          code: 0,
          message: desc,
          message_details: extractUserMessage(desc),
        },
        { status: 400 }
      );
    }

    // Caso 2: Erro com code === 2
    if (data.code === 2) {
      return NextResponse.json(
        {
          code: 3,
          message: data.message_details,
          message_details: data.message_details
        },
        { status: 400 }
      );
    }

    // Caso de sucesso
    return NextResponse.json({
      code: 1,
      message: data.message || 'Código verificado com sucesso',
      details: data.message_details || '',
    });


  } catch (error) {
    console.error('Erro interno:', error);
    return NextResponse.json(
      { error: 'Erro interno no servidor' },
      { status: 500 }
    );
  }
}
