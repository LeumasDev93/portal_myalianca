// src/app/api/sendToAlianca/route.ts

import { NextRequest, NextResponse } from "next/server";

const ALIANCA_API_URL = process.env.NEXT_PUBLIC_API_BASE_URL_SIMULATOR;
const ALIANCA_API_KEY = process.env.NEXT_PUBLIC_API_KEY;
const apiToken = process.env.API_SECRET_TOKEN;

export async function POST(req: NextRequest) {
    try {
        const simulationResult = await req.json();

        if (!simulationResult) {
            return NextResponse.json(
                { message: "Corpo da requisição está vazio" },
                { status: 400 }
            );
        }

        console.log("📦 Enviando para API Aliança:", {
            productId: simulationResult.productId,
            url: `${ALIANCA_API_URL}/simulador/1.0.0/simulations`
        });

        const response = await fetch(`${ALIANCA_API_URL}/simulador/1.0.0/simulations`, {
            method: "POST",
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiToken}`,
                'ApiKey': ALIANCA_API_KEY || ''
            },
            body: JSON.stringify(simulationResult),
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            console.error("Erro na API externa:", errorData);
            return NextResponse.json(
                {
                    message: "Erro ao enviar para a API da Aliança",
                    error: errorData,
                },
                { status: response.status }
            );
        }

        const result = await response.json();
        return NextResponse.json(result, { status: 200 });
    } catch (error) {
        console.error("Erro interno ao enviar para Aliança:", error);
        return NextResponse.json(
            {
                message: "Erro interno ao processar requisição",
                error: error instanceof Error ? error.message : error,
            },
            { status: 500 }
        );
    }
}
