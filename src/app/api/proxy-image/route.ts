import { NextRequest } from "next/server";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const imageUrl = searchParams.get('url');

    if (!imageUrl) {
      return new Response('URL da imagem não fornecida', { status: 400 });
    }

    const apiKey = process.env.NEXT_PUBLIC_API_KEY || "2b10688d-0539-4dff-8d30-d9195b32f5d6";
    const apiToken = process.env.API_SECRET_TOKEN || "2b10688d-0539-4dff-8d30-d9195b32f5d6";

    console.log('🔧 Configurações da API Proxy:');
    console.log('  - API Key:', apiKey ? 'Definida' : 'Não definida');
    console.log('  - API Token:', apiToken ? 'Definida' : 'Não definida');
    console.log('  - URL da imagem:', imageUrl);

    console.log('🖼️ Fazendo proxy para:', imageUrl);

    const response = await fetch(imageUrl, {
      headers: {
        Authorization: `Bearer ${apiToken}`,
        ApiKey: apiKey,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });

    console.log('📡 Resposta da API:', {
      status: response.status,
      statusText: response.statusText,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Erro ao buscar imagem:', {
        status: response.status,
        statusText: response.statusText,
        errorText: errorText,
      });
      return new Response(`Erro ao buscar imagem: ${response.status} - ${errorText}`, { 
        status: response.status,
        headers: { 'Content-Type': 'text/plain' }
      });
    }

    const imageBuffer = await response.arrayBuffer();
    const contentType = response.headers.get('content-type') || 'image/jpeg';

    console.log('✅ Imagem carregada com sucesso:', contentType);

    return new Response(imageBuffer, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=3600', // Cache por 1 hora
      },
    });

  } catch (error) {
    console.error('💥 Erro no proxy de imagem:', error);
    return new Response('Erro interno no servidor', { status: 500 });
  }
}
