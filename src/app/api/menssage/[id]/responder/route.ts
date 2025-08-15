import { NextRequest, NextResponse } from 'next/server';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const { conteudo, user_id, file_list_ids } = await request.json();

    console.log("Responder mensagem - Parâmetros recebidos:", {
      id,
      conteudo: conteudo?.substring(0, 50) + "...",
      user_id,
      file_list_ids,
    });

    // Validar parâmetros obrigatórios
    if (!conteudo || !user_id) {
      return NextResponse.json(
        {
          error: "Parâmetros obrigatórios faltando: conteudo, user_id",
        },
        { status: 400 }
      );
    }

    // Verificar variáveis de ambiente
    const { NEXT_PUBLIC_API_BASE_URL_DEFAULT, API_SECRET_TOKEN, NEXT_PUBLIC_API_KEY } = process.env;

    if (!NEXT_PUBLIC_API_BASE_URL_DEFAULT || !API_SECRET_TOKEN || !NEXT_PUBLIC_API_KEY) {
      return NextResponse.json(
        {
          error: "Variáveis de ambiente não configuradas corretamente",
        },
        { status: 500 }
      );
    }

    // Configurar chamada para API externa
    const apiUrl = `${NEXT_PUBLIC_API_BASE_URL_DEFAULT}/messages/1.0.0/${id}/responder`;

    const requestBody = {
      conteudo,
      user_id,
      file_list_ids: file_list_ids || [],
    };

    console.log("Enviando para API externa:", {
      url: apiUrl,
      body: requestBody,
    });

    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${API_SECRET_TOKEN}`,
        "ApiKey": NEXT_PUBLIC_API_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      return NextResponse.json(
        {
          error: errorData?.message || `Erro na API: ${response.statusText}`,
        },
        { status: response.status }
      );
    }

    const data = await response.json();

    return NextResponse.json({
      success: true,
      data: data,
    });

  } catch (error: unknown) {
    console.error("Erro ao responder mensagem:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Erro interno no servidor",
      },
      { status: 500 }
    );
  }
}
