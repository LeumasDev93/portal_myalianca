/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const ids = searchParams.getAll('id');

    console.log("IDs recebidos:", ids);

    if (!ids || ids.length === 0) {
      return NextResponse.json(
        { error: 'Parâmetro "id" é obrigatório e deve conter pelo menos um ID' },
        { status: 400 }
      );
    }

    if (
      !process.env.API_SECRET_TOKEN ||
      !process.env.NEXT_PUBLIC_API_KEY ||
      !process.env.NEXT_PUBLIC_API_BASE_URL
    ) {
      throw new Error('Configuração da API incompleta');
    }

    const resultados: {
      id: string;
      filename: string;
      mimetype: string;
      content: string;
    }[] = [];

    for (const id of ids) {
      try {
        const apiUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}/documents/base64?documento_id=${id}`;

        const response = await fetch(apiUrl, {
          headers: {
            Authorization: `Bearer ${process.env.API_SECRET_TOKEN}`,
            ApiKey: process.env.NEXT_PUBLIC_API_KEY,
          },
        });

        if (!response.ok) {
          console.error(`Erro ao buscar anexo ${id}: ${response.statusText}`);
          continue;
        }

        const raw = await response.json();
        console.log(`Resposta da API externa para ID ${id}:`, raw);

        const data = raw?.data || raw;

        if (!data?.id || !data?.content || !data?.mimetype || !data?.filename) {
          console.warn(`Anexo com ID ${id} retornou dados incompletos.`);
          continue;
        }

        resultados.push({
          id: data.id,
          filename: data.filename,
          mimetype: data.mimetype,
          content: data.content,
        });
      } catch (err) {
        console.error(`Erro ao processar o anexo ${id}:`, err);
      }
    }

    return NextResponse.json(resultados);
  } catch (error: any) {
    console.error("Erro geral no download de anexos:", error);
    return NextResponse.json(
      { error: 'Falha ao buscar anexos', details: error.message },
      { status: 500 }
    );
  }
}
