

// app/api/sinistros/route.ts

import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const {
      descricao,
      data_ocorrido,
      local,
      envolvidos,
      boletim_ocorrencia,
      numero_bo,
      id_anexo,
      user_id,
      id_apolice,
      nome_apolice,
      tipo_apolice,
    } = body;

    if (
      !descricao ||
      !data_ocorrido ||
      !local ||
      !id_apolice ||
      !nome_apolice ||
      !tipo_apolice
    ) {
      return NextResponse.json(
        { error: "Campos obrigatórios ausentes." },
        { status: 400 }
      );
    }

    const apiUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}/sinistros`;

    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ApiKey: process.env.NEXT_PUBLIC_API_KEY || "",
      },
      body: JSON.stringify({
        descricao,
        data_ocorrido,
        local,
        envolvidos,
        boletim_ocorrencia,
        numero_bo,
        id_anexo,
        user_id,
        id_apolice,
        nome_apolice,
        tipo_apolice,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { error: "Erro da API externa", details: data },
        { status: response.status }
      );
    }

    return NextResponse.json({ message: "Sinistro enviado com sucesso", data });
  } catch (error) {
    console.error("Erro interno ao enviar sinistro:", error);
    return NextResponse.json(
      { error: "Erro interno no servidor" },
      { status: 500 }
    );
  }
}
