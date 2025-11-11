import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const clientReference = searchParams.get('clientReference');

    if (!clientReference) {
      return NextResponse.json(
        { error: 'clientReference é obrigatório' },
        { status: 400 }
      );
    }

    // Buscar token do header primeiro (prioridade)
    let anywhereToken = request.headers.get('X-Anywhere-Token');

    // Se não encontrar no header, tentar nos cookies
    if (!anywhereToken) {
      console.log('🔍 [API Client Info] Token não encontrado no header, tentando cookies...');
      const cookieStore = await cookies();
      anywhereToken = (cookieStore.get('anywhere_token')?.value || 
                      cookieStore.get('token')?.value ||
                      cookieStore.get('pay_token')?.value) ?? null;
    }

    console.log('🔍 [API Client Info] Token origem:', anywhereToken ? 
      (request.headers.get('X-Anywhere-Token') ? 'HEADER' : 'COOKIE') : 
      'NÃO ENCONTRADO'
    );

    if (!anywhereToken) {
      console.error('❌ [API Client Info] Token não encontrado');
      return NextResponse.json(
        { error: 'Token de autenticação não encontrado' },
        { status: 401 }
      );
    }

    console.log('✅ [API Client Info] Buscando dados do cliente:', clientReference);

    const response = await fetch(
      `https://aliancacvtest.rtcom.pt/anywhere/api/v1/private/mobile/entity/identity/${clientReference}/info`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${anywhereToken}`,
          'Content-Type': 'application/json',
        },
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error('❌ [API Client Info] Erro:', data);
      return NextResponse.json(
        { error: data.message || 'Erro ao buscar dados do cliente', details: data },
        { status: response.status }
      );
    }

    console.log('✅ [API Client Info] Dados do cliente obtidos com sucesso');
    return NextResponse.json(data);
  } catch (error) {
    console.error('❌ [API Client Info] Erro no servidor:', error);
    return NextResponse.json(
      { error: 'Erro interno no servidor', details: error instanceof Error ? error.message : error },
      { status: 500 }
    );
  }
}

