import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const apiKey = process.env.NEXT_PUBLIC_API_KEY;
    const apiToken = process.env.API_SECRET_TOKEN;
    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL_DEFAULT;

    if (!apiKey || !apiToken || !baseUrl) {
      return NextResponse.json(
        { error: "Configuração da API não encontrada" },
        { status: 500 }
      );
    }

    // Obter parâmetros da URL
    const { searchParams } = new URL(request.url);
    const inicioMesReferente = searchParams.get('inicio_mes_referente');
    const fimMesReferente = searchParams.get('fim_mes_referente');
    const inicioAnoReferente = searchParams.get('inicio_ano_referente');
    const fimAnoReferente = searchParams.get('fim_ano_referente');
    const idUtilizador = searchParams.get('id_utilizador');

    if (!inicioMesReferente || !fimMesReferente || !inicioAnoReferente || !fimAnoReferente || !idUtilizador) {
      return NextResponse.json(
        { error: "Parâmetros obrigatórios não fornecidos" },
        { status: 400 }
      );
    }

    // Obter o arquivo do FormData
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { error: "Arquivo não fornecido" },
        { status: 400 }
      );
    }

    // Criar FormData para enviar para a API externa
    const externalFormData = new FormData();
    externalFormData.append('file', file);

    // Construir URL da API externa
    const externalUrl = `${baseUrl}/soat/1.0.0/template/upload?inicio_mes_referente=${inicioMesReferente}&fim_mes_referente=${fimMesReferente}&inicio_ano_referente=${inicioAnoReferente}&fim_ano_referente=${fimAnoReferente}&id_utilizador=${idUtilizador}`;

    // Fazer requisição para a API externa
    const response = await fetch(externalUrl, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiToken}`,
        ApiKey: apiKey,
      },
      body: externalFormData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Erro ao fazer upload para API externa:", errorText);
      return NextResponse.json(
        { error: "Erro ao fazer upload do arquivo" },
        { status: response.status }
      );
    }

    const result = await response.json();
    return NextResponse.json(result);

  } catch (error) {
    console.error("Erro ao processar upload:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
