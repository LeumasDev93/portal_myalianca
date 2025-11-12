import { NextRequest } from "next/server";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const imageUrl = searchParams.get('url');

    if (!imageUrl) {
      return new Response('URL da imagem não fornecida', { status: 400 });
    }

    // API Key do arquivo .env
    const apiKey = process.env.NEXT_PUBLIC_API_KEY || '';

    if (!apiKey) {
      console.error('❌ NEXT_PUBLIC_API_KEY não configurada no .env');
      return new Response('API Key não configurada', { status: 500 });
    }

    console.log('🖼️ Fazendo proxy para:', imageUrl);
    console.log('🔑 Usando API Key do .env');

    const response = await fetch(imageUrl, {
      headers: {
        'ApiKey': apiKey,
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
        'Cache-Control': 'public, max-age=604800, s-maxage=604800, stale-while-revalidate=2592000, immutable', // Cache por 7 dias, revalidação em 30 dias
        'X-Content-Type-Options': 'nosniff',
        'Vary': 'Accept-Encoding',
      },
    });

  } catch (error) {
    console.error('💥 Erro no proxy de imagem:', error);
    return new Response('Erro interno no servidor', { status: 500 });
  }
}
