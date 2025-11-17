// src/app/api/alianca/route.ts
import { NextRequest, NextResponse } from "next/server";

const ALIANCA_API_URL = process.env.NEXT_PUBLIC_API_BASE_URL_SIMULATOR;
const ALIANCA_API_KEY = process.env.NEXT_PUBLIC_API_KEY;
const apiToken = process.env.API_SECRET_TOKEN;

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const endpoint = searchParams.get("endpoint");

    if (!endpoint) {
      return NextResponse.json(
        { message: "O parâmetro 'endpoint' é obrigatório" },
        { status: 400 }
      );
    }

    if (!ALIANCA_API_URL) {
      return NextResponse.json(
        { message: "URL da API Alianca não configurada" },
        { status: 500 }
      );
    }

    // Construir URL completa
    const endpointClean = endpoint.startsWith('/') ? endpoint.substring(1) : endpoint;
    const baseUrlClean = ALIANCA_API_URL.endsWith('/') ? ALIANCA_API_URL.slice(0, -1) : ALIANCA_API_URL;
    const fullUrl = `${baseUrlClean}/${endpointClean}`;

    const response = await fetch(fullUrl, {
      method: "GET",
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiToken || ''}`,
        'ApiKey': ALIANCA_API_KEY || ''
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error("Erro ao buscar dados da API Alianca:", errorData);
      return NextResponse.json(
        {
          message: "Erro ao buscar dados da API Alianca",
          error: errorData,
        },
        { status: response.status }
      );
    }

    const result = await response.json();
    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error("Erro interno ao buscar dados da API Alianca:", error);
    return NextResponse.json(
      {
        message: "Erro interno ao processar requisição",
        error: error instanceof Error ? error.message : error,
      },
      { status: 500 }
    );
  }
}

