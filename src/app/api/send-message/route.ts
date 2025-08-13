/* eslint-disable @typescript-eslint/no-explicit-any */
// app/api/send-message/route.ts
import { NextRequest, NextResponse } from "next/server";

const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL_DEFAULT!;
const API_KEY = process.env.NEXT_PUBLIC_API_KEY!;
const API_TOKEN = process.env.API_SECRET_TOKEN || ""; // caso precise de Bearer token

interface SendMessagePayload {
    assunto: string;
    conteudo: string;
    user_id: string;
    file_list_ids?: string[];
}

export async function POST(req: NextRequest) {
    try {
        const body: SendMessagePayload = await req.json();

        // Validação
        if (
            !body.assunto?.trim() ||
            !body.conteudo?.trim() ||
            !body.user_id?.trim()
        ) {
            return NextResponse.json(
                { error: "Campos obrigatórios faltando ou inválidos." },
                { status: 400 }
            );
        }

        if (!API_URL || !API_KEY) {
            return NextResponse.json(
                { error: "Variáveis de ambiente não configuradas." },
                { status: 500 }
            );
        }

        // Chamada à API externa
        const externalRes = await fetch(`${API_URL}/messages/1.0.0/`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                ApiKey: API_KEY, // Header separado
                Authorization: `Bearer ${API_TOKEN}`, // Caso a API precise também
            },
            body: JSON.stringify({
                assunto: body.assunto.trim(),
                conteudo: body.conteudo.trim(),
                user_id: body.user_id.trim(),
                file_list_ids: Array.isArray(body.file_list_ids)
                    ? body.file_list_ids
                    : [],
            }),
        });

        if (!externalRes.ok) {
            const text = await externalRes.text();
            console.error("Erro API externa:", externalRes.status, text);
            return NextResponse.json(
                { error: `Erro da API externa: ${text}` },
                { status: externalRes.status }
            );
        }

        const data = await externalRes.json();
        return NextResponse.json(data);
    } catch (error: any) {
        console.error("Erro interno:", error);
        return NextResponse.json(
            { error: error.message || "Erro interno no servidor." },
            { status: 500 }
        );
    }
}
