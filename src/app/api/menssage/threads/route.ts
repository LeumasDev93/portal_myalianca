/* eslint-disable @typescript-eslint/no-explicit-any */
// src/app/api/menssage/threads/route.ts
import { NextRequest, NextResponse } from "next/server";

const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL_DEFAULT!;
const API_KEY = process.env.NEXT_PUBLIC_API_KEY!;
const API_TOKEN = process.env.API_SECRET_TOKEN || "";

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const thread_id = searchParams.get("thread_id");
        const user_id = searchParams.get("user_id");

        if (!thread_id?.trim() || !user_id?.trim()) {
            return NextResponse.json(
                { error: "Parâmetros obrigatórios faltando." },
                { status: 400 }
            );
        }

        const externalRes = await fetch(
            `${API_URL}/messages/1.0.0/threads?thread_id=${thread_id}&user_id=${user_id}`,
            {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    ApiKey: API_KEY,
                    Authorization: API_TOKEN ? `Bearer ${API_TOKEN}` : "",
                },
            }
        );

        if (!externalRes.ok) {
            const text = await externalRes.text();
            console.error("Erro API externa:", text);
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
