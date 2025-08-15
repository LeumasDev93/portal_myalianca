import { NextRequest } from "next/server";

export const runtime = "nodejs";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const sinistroId = params.id;
    const apiKey = process.env.NEXT_PUBLIC_API_KEY;
    const apiToken = process.env.API_SECRET_TOKEN;
    const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL_DEFAULT || "https://api.aliancaseguros.cv";

    if (!apiKey || !apiToken) {
      return new Response(JSON.stringify({ error: "Configuração da API incompleta" }), { status: 500 });
    }

    // 1. Buscar lista de anexos do sinistro
    const anexosUrl = `${apiBaseUrl}/api/v1/private/mobile/claim/${sinistroId}/attachments`;
    
    const anexosRes = await fetch(anexosUrl, {
      headers: {
        Authorization: `Bearer ${apiToken}`,
        ApiKey: apiKey,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    });

    if (!anexosRes.ok) {
      console.error("❌ Erro ao buscar anexos:", anexosRes.status, anexosRes.statusText);
      return new Response(JSON.stringify({ error: "Erro ao buscar anexos" }), { status: anexosRes.status });
    }

    const anexosData = await anexosRes.json();
    console.log("📎 Anexos encontrados:", anexosData);

    if (!anexosData || !Array.isArray(anexosData)) {
      return new Response(JSON.stringify({ anexos: [] }), { status: 200 });
    }

    // 2. Processar cada anexo para incluir o conteúdo da imagem
    const processedAnexos = await Promise.all(
      anexosData.map(async (anexo: any) => {
        try {
          const imageUrl = `${apiBaseUrl}/files/1.0.0/download/${anexo.id}`;
          console.log("🖼️ Buscando imagem:", imageUrl);
          
          const imageRes = await fetch(imageUrl, {
            headers: {
              Authorization: `Bearer ${apiToken}`,
              ApiKey: apiKey,
            },
          });

          if (imageRes.ok) {
            const blob = await imageRes.blob();
            const base64 = await new Promise<string>((resolve) => {
              const reader = new FileReader();
              reader.onloadend = () => resolve(reader.result as string);
              reader.readAsDataURL(blob);
            });

            return {
              id: anexo.id,
              filename: anexo.filename || anexo.name || `Anexo ${anexo.id}`,
              content: base64.split(',')[1], // Remove o prefixo data:image/...;base64,
              mimetype: blob.type || "image/jpeg",
              userid: anexo.user_id || "",
              datecreate: anexo.date_create || new Date().toISOString(),
            };
          } else {
            console.error("❌ Erro ao buscar imagem:", imageRes.status);
            return null;
          }
        } catch (error) {
          console.error("❌ Erro ao processar anexo:", error);
          return null;
        }
      })
    );

    const validAnexos = processedAnexos.filter(anexo => anexo !== null);
    console.log("✅ Anexos processados:", validAnexos.length);

    return new Response(JSON.stringify({ anexos: validAnexos }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });

  } catch (error) {
    console.error("💥 Erro na API de anexos:", error);
    return new Response(JSON.stringify({ 
      error: "Erro interno no servidor",
      message: error instanceof Error ? error.message : "Erro desconhecido"
    }), { status: 500 });
  }
}
