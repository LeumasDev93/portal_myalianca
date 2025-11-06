import { NextRequest, NextResponse } from "next/server";

const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL_DEFAULT || 'https://api.aliancaseguros.cv';
const apiKey = process.env.NEXT_PUBLIC_API_KEY || '';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    if (!id) {
      return NextResponse.json(
        { error: "Parâmetro id é obrigatório" },
        { status: 400 }
      );
    }

    const url = `${apiBaseUrl}/soat/1.0.0/${id}`;

    const response = await fetch(url, {
      method: "GET",
      headers: {
        apikey: apiKey,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    return NextResponse.json(data, {
      headers: {
        "Cache-Control": "private, no-cache, no-store, must-revalidate",
      },
    });
  } catch (error) {
    console.error("Erro ao buscar detalhes do SOAT:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Erro ao buscar detalhes do SOAT",
      },
      { status: 500 }
    );
  }
}

