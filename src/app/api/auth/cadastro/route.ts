import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const formData = await request.json();

    const requiredFields = [
      "nome", "data_nascimento", "nif", "email", "telemovel", "tipo_cliente", "morada", "bi_cni"
    ];

    for (const field of requiredFields) {
      if (!formData[field]) {
        return NextResponse.json(
          { error: `Campo obrigatório faltando: ${field}` },
          { status: 400 }
        );
      }
    }

    const apiUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}/accounts`;
    const apiKey = process.env.NEXT_PUBLIC_API_KEY; // <-- variável privada

    if (!apiKey) {
      return NextResponse.json(
        { error: 'API Key não configurada no servidor' },
        { status: 500 }
      );
    }

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'ApiKey': process.env.NEXT_PUBLIC_API_KEY || '' // adicione a chave de API aqui
      },
      body: JSON.stringify(formData)
    });

    const responseData = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        {
          error: responseData.response?.desc || 'Erro ao criar conta',
          details: responseData
        },
        { status: response.status }
      );
    }

    return NextResponse.json({
      message: 'Conta criada com sucesso!',
      data: responseData
    });

  } catch (error) {
    console.error('Erro interno:', error);
    return NextResponse.json(
      { error: 'Erro interno no servidor' },
      { status: 500 }
    );
  }
}
