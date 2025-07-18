/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const ids = searchParams.getAll('id');

    if (!ids || ids.length === 0) {
      return NextResponse.json(
        { error: 'Parâmetro "id" é obrigatório e deve conter pelo menos um ID' },
        { status: 400 }
      );
    }

    const { API_SECRET_TOKEN, NEXT_PUBLIC_API_KEY, NEXT_PUBLIC_API_BASE_URL } = process.env;

    if (!API_SECRET_TOKEN || !NEXT_PUBLIC_API_KEY || !NEXT_PUBLIC_API_BASE_URL) {
      return NextResponse.json(
        { error: 'Configuração da API ausente. Verifique variáveis de ambiente.' },
        { status: 500 }
      );
    }

    const resultados: {
      id: string;
      filename: string;
      mimetype: string;
      content: string;
    }[] = [];

    for (const id of ids) {
      try {
        const apiUrl = `${NEXT_PUBLIC_API_BASE_URL}/documents/base64?documento_id=${id}`;

        const response = await fetch(apiUrl, {
          headers: {
            Authorization: `Bearer ${API_SECRET_TOKEN}`,
            ApiKey: NEXT_PUBLIC_API_KEY,
          },
        });

        if (!response.ok) {
          console.error(`Erro ao buscar anexo ${id}: ${response.status} ${response.statusText}`);
          continue;
        }

        const raw = await response.json();
        const data = raw?.data || raw;

        if (!data?.id || !data?.filename || !data?.mimetype || !data?.content) {
          console.warn(`Dados incompletos para o anexo ${id}`);
          continue;
        }

        resultados.push({
          id: data.id,
          filename: data.filename,
          mimetype: data.mimetype,
          content: data.content,
        });
      } catch (err) {
        console.error(`Erro interno ao buscar anexo ${id}:`, err);
        // Continua o loop, mesmo se falhar um item
      }
    }

    return NextResponse.json(resultados);
  } catch (error: any) {
    console.error('Erro geral na API de anexos:', error);
    return NextResponse.json(
      { error: 'Erro interno no servidor', details: error.message },
      { status: 500 }
    );
  }
}
