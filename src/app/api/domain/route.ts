// src/app/api/domain/route.ts

import { NextRequest, NextResponse } from "next/server";

const ALIANCA_API_URL = process.env.NEXT_PUBLIC_API_BASE_URL_SIMULATOR;
const ALIANCA_API_KEY = process.env.NEXT_PUBLIC_API_KEY;
const apiToken = process.env.API_SECRET_TOKEN;

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const name = searchParams.get("name");

        if (!name) {
            return NextResponse.json(
                { message: "O parâmetro 'name' é obrigatório" },
                { status: 400 }
            );
        }

        const response = await fetch(
            `${ALIANCA_API_URL}/domain/find/1.0.0?name=${encodeURIComponent(name)}`,
            {
                method: "GET",
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${apiToken}`,
                    'ApiKey': ALIANCA_API_KEY || ''
                },
            }
        );

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            console.error("Erro ao buscar domínio:", errorData);
            return NextResponse.json(
                {
                    message: "Erro ao buscar dados do domínio",
                    error: errorData,
                },
                { status: response.status }
            );
        }

        const result = await response.json();
        return NextResponse.json(result, { status: 200 });
    } catch (error) {
        console.error("Erro interno ao buscar domínio:", error);
        return NextResponse.json(
            {
                message: "Erro interno ao processar requisição",
                error: error instanceof Error ? error.message : error,
            },
            { status: 500 }
        );
    }
}

