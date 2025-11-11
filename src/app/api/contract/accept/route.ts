import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
  try {
    // Buscar token do header primeiro (prioridade)
    let anywhereToken = request.headers.get('X-Anywhere-Token');

    // Se não encontrar no header, tentar nos cookies
    if (!anywhereToken) {
      console.log('🔍 [API Contract Accept] Token não encontrado no header, tentando cookies...');
      const cookieStore = await cookies();
      anywhereToken = (cookieStore.get('anywhere_token')?.value || 
                      cookieStore.get('token')?.value ||
                      cookieStore.get('pay_token')?.value) ?? null;
    }

    // Log de debug
    console.log('🔍 [API Contract Accept] Token origem:', anywhereToken ? 
      (request.headers.get('X-Anywhere-Token') ? 'HEADER' : 'COOKIE') : 
      'NÃO ENCONTRADO'
    );

    if (!anywhereToken) {
      console.error('❌ [API Contract Accept] Token não encontrado');
      return NextResponse.json(
        { error: 'Token de autenticação não encontrado' },
        { status: 401 }
      );
    }

    console.log('✅ [API Contract Accept] Token encontrado:', anywhereToken.substring(0, 20) + '...');

    const body = await request.json();
    
    console.log('🔷 [API Contract Accept] Dados recebidos:', body);

    const response = await fetch(
      'https://aliancacvtest.rtcom.pt/anywhere/api/v1/private/externalsystem/contract/accept',
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${anywhereToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error('❌ [API Contract Accept] Erro:', data);
      return NextResponse.json(
        { error: data.message || 'Erro ao aceitar contrato', details: data },
        { status: response.status }
      );
    }

    console.log('✅ [API Contract Accept] Sucesso:', data);
    return NextResponse.json(data);
  } catch (error) {
    console.error('❌ [API Contract Accept] Erro no servidor:', error);
    return NextResponse.json(
      { error: 'Erro interno no servidor', details: error instanceof Error ? error.message : error },
      { status: 500 }
    );
  }
}

