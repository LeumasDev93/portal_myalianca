import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const categoryName = searchParams.get('name');
    
    console.log('📄 [PROXY API] ========== BUSCAR DOCUMENTOS ==========');
    console.log('  Parâmetro "name" recebido:', categoryName);
    
    if (!categoryName) {
      console.error('❌ [PROXY API] Nome da categoria não fornecido!');
      return NextResponse.json(
        { error: 'Nome da categoria não fornecido' },
        { status: 400 }
      );
    }
    
    const apiUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL_DEFAULT}/category/document/1.0.0?name=${categoryName}`;
    const apiKey = process.env.NEXT_PUBLIC_API_KEY || '';
    
    console.log('  URL da API externa:', apiUrl);
    console.log('  ApiKey presente?', !!apiKey);
    
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'ApiKey': apiKey,
      },
      cache: 'no-store',
    });
    
    const data = await response.json();
    console.log('📄 [PROXY API] Resposta:', {
      status: response.status,
      documentosEncontrados: data.results?.length || 0,
      data: data
    });
    
    if (!response.ok) {
      return NextResponse.json(
        { error: `API retornou erro: ${response.status}`, details: data },
        { status: response.status }
      );
    }
    
    return NextResponse.json(data);
    
  } catch (error) {
    console.error('❌ [PROXY] Erro ao buscar documentos:', error);
    return NextResponse.json(
      { error: 'Erro ao processar requisição', details: String(error) },
      { status: 500 }
    );
  }
}

