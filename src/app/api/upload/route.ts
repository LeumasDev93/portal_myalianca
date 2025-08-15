import { NextRequest } from "next/server";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  console.log("🚀 Upload iniciado - " + new Date().toISOString());
  
  try {
    // Converter NextRequest para formato compatível com formidable
    const formData = await req.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return new Response(JSON.stringify({ error: "Arquivo não encontrado" }), { status: 400 });
    }

    console.log(`📁 Arquivo: ${file.name} (${file.size} bytes)`);

    // Converter File para Buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    
    console.log("📦 Arquivo processado:", {
      fileName: file.name,
      fileSize: buffer.length,
      mimeType: file.type
    });

    // Configurações da API
    const apiKey = process.env.NEXT_PUBLIC_API_KEY;
    const apiToken = process.env.API_SECRET_TOKEN;
    const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL_DEFAULT || "https://api.aliancaseguros.cv";
    const apiUrl = `${apiBaseUrl}/files/1.0.0/upload`;

    if (!apiKey || !apiToken) {
      return new Response(JSON.stringify({ error: "Configuração da API incompleta" }), { status: 500 });
    }

    console.log("🌐 Enviando para API...");
    console.log("🔑 API Key:", apiKey ? "Configurada" : "Não configurada");
    console.log("🔐 API Token:", apiToken ? "Configurado" : "Não configurado");
    console.log("📡 URL:", apiUrl);
    console.log("📡 API Base URL:", apiBaseUrl);

    // Preparar FormData para API externa
    const externalFormData = new FormData();
    const blob = new Blob([buffer], { type: file.type || "application/octet-stream" });
    externalFormData.append("file", blob, file.name);

    // Upload com timeout de 30 segundos
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 30000);

    try {
      console.log("📤 Iniciando fetch...");
      const response = await fetch(apiUrl, {
        method: "POST",
        signal: controller.signal,
        headers: {
          "Authorization": `Bearer ${apiToken}`,
          "ApiKey": apiKey,
          "Accept": "application/json",
        },
        body: externalFormData,
      });

      clearTimeout(timeout);
      console.log("📥 Resposta recebida:", response.status, response.statusText);

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`❌ Erro API: ${response.status} - ${errorText}`);
        return new Response(JSON.stringify({ error: "Erro na API externa", details: errorText }), { status: response.status });
      }

      const result = await response.json();
      console.log("✅ Upload concluído:", JSON.stringify(result, null, 2));

      // Extrair ID
      const fileId = result.results?.id || result.id;
      
      if (!fileId) {
        return new Response(JSON.stringify({ error: "ID do arquivo não encontrado na resposta" }), { status: 500 });
      }

      return new Response(JSON.stringify({ 
        id: fileId,
        success: true,
        filename: file.name,
        size: file.size
      }), {
        status: 200,
        headers: { "Content-Type": "application/json" }
      });

    } catch (fetchError) {
      clearTimeout(timeout);
      console.error("❌ Erro no fetch:", fetchError);
      
      if (fetchError instanceof Error && fetchError.name === "AbortError") {
        return new Response(JSON.stringify({ error: "Timeout - tente novamente" }), { status: 408 });
      }
      
      return new Response(JSON.stringify({ 
        error: "Erro na requisição", 
        details: fetchError instanceof Error ? fetchError.message : "Erro desconhecido"
      }), { status: 500 });
    }

  } catch (error) {
    console.error("💥 Erro no upload:", error);
    return new Response(JSON.stringify({ 
      error: "Erro interno no upload",
      message: error instanceof Error ? error.message : "Erro desconhecido"
    }), { status: 500 });
  }
}
