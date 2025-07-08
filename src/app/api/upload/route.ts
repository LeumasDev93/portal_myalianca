// app/api/upload/route.ts
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const apiUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}/documents/upload`;
    const apiToken = process.env.API_SECRET_TOKEN;

    const body = await request.json();

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiToken}`,
        'ApiKey': process.env.NEXT_PUBLIC_API_KEY || ''
      },
      body: JSON.stringify(body)
    });

    if (!response.ok) {
      throw new Error(`Erro no upload: ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data);

  } catch (error) {
    console.error('Erro no upload de documento:', error);
    return NextResponse.json(
      { error: 'Falha ao enviar documento', details: error instanceof Error ? error.message : 'Erro desconhecido' },
      { status: 500 }
    );
  }
}