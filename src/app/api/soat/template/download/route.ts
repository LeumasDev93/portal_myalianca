/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
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

    const response = await fetch(`${baseUrl}/soat/1.0.0/template/download`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${apiToken}`,
        ApiKey: apiKey,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Erro ao baixar template SOAT:", errorText);
      return NextResponse.json(
        { error: "Erro ao baixar template SOAT" },
        { status: response.status }
      );
    }

    // Obter o conteúdo do arquivo
    const fileBuffer = await response.arrayBuffer();
    
    // Obter o nome do arquivo do header Content-Disposition ou usar um nome padrão
    const contentDisposition = response.headers.get("content-disposition");
    let filename = "template_soat.xlsx"; // Nome padrão
    
    if (contentDisposition) {
      const filenameMatch = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
      if (filenameMatch && filenameMatch[1]) {
        filename = filenameMatch[1].replace(/['"]/g, '');
      }
    }

    // Retornar o arquivo como download
    return new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Content-Length": fileBuffer.byteLength.toString(),
      },
    });

  } catch (error) {
    console.error("Erro ao processar download do template SOAT:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
