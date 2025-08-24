import { NextRequest } from "next/server";

export const runtime = "nodejs";

export async function PUT(req: NextRequest) {
  console.log("🚀 Atualização de perfil iniciada - " + new Date().toISOString());
  
  try {
    const body = await req.json();
    const { user_id, image_id } = body;
    
    if (!user_id || !image_id) {
      return new Response(JSON.stringify({ 
        error: "user_id e image_id são obrigatórios" 
      }), { status: 400 });
    }

    console.log(`👤 Atualizando perfil para usuário: ${user_id}`);
    console.log(`🖼️ Nova imagem ID: ${image_id}`);

    // Configurações da API
    const apiKey = process.env.NEXT_PUBLIC_API_KEY;
    const apiToken = process.env.API_SECRET_TOKEN;
    const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL_DEFAULT || "https://api.aliancaseguros.cv";
    const apiUrl = `${apiBaseUrl}/middleware/1.0.0/accounts/profile`;

    if (!apiKey || !apiToken) {
      return new Response(JSON.stringify({ 
        error: "Configuração da API incompleta" 
      }), { status: 500 });
    }

    console.log("🌐 Enviando para API...");
    console.log("🔑 API Key:", apiKey ? "Configurada" : "Não configurada");
    console.log("🔐 API Token:", apiToken ? "Configurado" : "Não configurado");
    console.log("📡 URL:", apiUrl);

    // Preparar dados para API externa
    const requestData = {
      user_id: user_id,
      image_id: image_id
    };

    console.log("📤 Dados enviados:", JSON.stringify(requestData, null, 2));

    // Requisição com timeout de 30 segundos
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 30000);

    try {
      const response = await fetch(apiUrl, {
        method: "PUT",
        signal: controller.signal,
        headers: {
          "Authorization": `Bearer ${apiToken}`,
          "ApiKey": apiKey,
          "Content-Type": "application/json",
          "Accept": "application/json",
        },
        body: JSON.stringify(requestData),
      });

      clearTimeout(timeout);
      console.log("📥 Resposta recebida:", response.status, response.statusText);

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`❌ Erro API: ${response.status} - ${errorText}`);
        return new Response(JSON.stringify({ 
          error: "Erro na API externa", 
          details: errorText 
        }), { status: response.status });
      }

      const result = await response.json();
      console.log("✅ Perfil atualizado com sucesso:", JSON.stringify(result, null, 2));

      return new Response(JSON.stringify({ 
        success: true,
        message: "Perfil atualizado com sucesso",
        data: result
      }), {
        status: 200,
        headers: { "Content-Type": "application/json" }
      });

    } catch (fetchError) {
      clearTimeout(timeout);
      console.error("❌ Erro no fetch:", fetchError);
      
      if (fetchError instanceof Error && fetchError.name === "AbortError") {
        return new Response(JSON.stringify({ 
          error: "Timeout - tente novamente" 
        }), { status: 408 });
      }
      
      return new Response(JSON.stringify({ 
        error: "Erro na requisição", 
        details: fetchError instanceof Error ? fetchError.message : "Erro desconhecido"
      }), { status: 500 });
    }

  } catch (error) {
    console.error("💥 Erro na atualização do perfil:", error);
    return new Response(JSON.stringify({ 
      error: "Erro interno na atualização do perfil",
      message: error instanceof Error ? error.message : "Erro desconhecido"
    }), { status: 500 });
  }
}
