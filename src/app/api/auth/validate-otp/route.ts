// app/api/auth/recover-password/route.ts
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// Função para extrair mensagens do campo 'desc'
function extractUserMessage(desc: string): string {
  const matches = [...desc.matchAll(/default message \[(.*?)\]/g)];
  if (matches.length > 0) {
    return matches.map((m) => m[1]).join(' / ');
  }
  return desc;
}

export async function POST(request: Request) {
  try {
    const { email, otp } = await request.json();

    if (!email || !otp) {
      return NextResponse.json(
        {
          code: 0,
          message: 'Campos obrigatórios ausentes',
          message_details: 'O campo email e o código OTP são obrigatórios.',
        },
        { status: 400 }
      );
    }

    const apiUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}/accounts/validate-otp`;

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ApiKey: process.env.NEXT_PUBLIC_API_KEY || '',
      },
      body: JSON.stringify({ email, otp }),
    });

    const data = await response.json();

    // Caso 1: Erro do Spring (response.code === "0")
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

    // Caso 2: Erro com code === 3
    if (data.code === 3) {
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
      {
        code: 500,
        message: 'Erro interno no servidor',
      },
      { status: 500 }
    );
  }
}
