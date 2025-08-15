/* eslint-disable @typescript-eslint/no-explicit-any */
// app/api/ocorrencia/route.ts
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    // 1. Verificar variáveis de ambiente
    const { NEXT_PUBLIC_API_BASE_URL, API_SECRET_TOKEN, NEXT_PUBLIC_API_KEY } = process.env;

    if (!NEXT_PUBLIC_API_BASE_URL || !API_SECRET_TOKEN || !NEXT_PUBLIC_API_KEY) {
      return NextResponse.json(
        {
          info: {
            count: 0,
            page: 1,
            status: 500,
            errors: ['Variáveis de ambiente não configuradas corretamente'],
          },
          results: [],
        },
        { status: 500 }
      );
    }

    // 2. Validar parâmetro user_id
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('user_id');

    if (!userId) {
      return NextResponse.json(
        {
          info: {
            count: 0,
            page: 1,
            status: 400,
            errors: ['Parâmetro "user_id" é obrigatório'],
          },
          results: [],
        },
        { status: 400 }
      );
    }

    // 3. Configurar chamada para API externa
    const apiUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL_DEFAULT}/messages/1.0.0/?user_id=${userId}`;

    const response = await fetch(apiUrl, {
      headers: {
        'Authorization': `Bearer ${API_SECRET_TOKEN}`,
        'ApiKey': NEXT_PUBLIC_API_KEY,
        'Content-Type': 'application/json',
      },
      next: { revalidate: 60 } // Cache de 60 segundos
    });

    // 4. Tratar erros da API externa
    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      return NextResponse.json(
        {
          info: {
            count: 0,
            page: 1,
            status: response.status,
            errors: [errorData?.message || `Erro na API: ${response.statusText}`],
          },
          results: [],
        },
        { status: response.status }
      );
    }

    // 5. Retornar dados formatados
    const data = await response.json();
    
    // Calcular número de mensagens não lidas
    const unreadCount = data.results?.filter((msg: any) => !msg.read)?.length || 0;

    return NextResponse.json({
      info: {
        count: data.results?.length || 0,
        page: 1,
        status: 200,
        errors: null,
      },
      results: data.results || [],
      unreadCount: unreadCount,
    });

  } catch (error: any) {
    // 6. Tratar erros inesperados
    return NextResponse.json(
      {
        info: {
          count: 0,
          page: 1,
          status: 500,
          errors: [error?.message || 'Erro interno no servidor'],
        },
        results: [],
      },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const { messageId, userId, action } = await request.json();

    if (!messageId || !userId || !action) {
      return NextResponse.json(
        {
          error: "Parâmetros obrigatórios faltando: messageId, userId, action",
        },
        { status: 400 }
      );
    }

    // Configurar chamada para API externa para marcar como lida/não lida
    const apiUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL_DEFAULT}/messages/1.0.0/${action}`;

    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.API_SECRET_TOKEN}`,
        "ApiKey": process.env.NEXT_PUBLIC_API_KEY!,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message_id: messageId,
        user_id: userId,
      }),
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

  } catch (error: any) {
    return NextResponse.json(
      {
        error: error?.message || "Erro interno no servidor",
      },
      { status: 500 }
    );
  }
}