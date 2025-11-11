import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
  try {
    // Buscar token do header primeiro (prioridade)
    let anywhereToken = request.headers.get('X-Anywhere-Token');

    // Se não encontrar no header, tentar nos cookies
    if (!anywhereToken) {
      console.log('🔍 [API Attach] Token não encontrado no header, tentando cookies...');
      const cookieStore = await cookies();
      anywhereToken = (cookieStore.get('anywhere_token')?.value || 
                      cookieStore.get('token')?.value ||
                      cookieStore.get('pay_token')?.value) ?? null;
    }

    // Log de debug
    console.log('🔍 [API Attach] Token origem:', anywhereToken ? 
      (request.headers.get('X-Anywhere-Token') ? 'HEADER' : 'COOKIE') : 
      'NÃO ENCONTRADO'
    );

    if (!anywhereToken) {
      console.error('❌ [API Attach] Token não encontrado');
      return NextResponse.json(
        { error: 'Token de autenticação não encontrado' },
        { status: 401 }
      );
    }

    console.log('✅ [API Attach] Token encontrado:', anywhereToken.substring(0, 20) + '...');

    const formData = await request.formData();
    
    console.log('🔷 [API Attach] FormData recebido:', {
      file: formData.get('file'),
      reference: formData.get('reference'),
      system: formData.get('system'),
      attachType: formData.get('attachType'),
      attachTo: formData.get('attachTo'),
      refAttachTo: formData.get('refAttachTo'),
    });

    const response = await fetch(
      'https://aliancacvtest.rtcom.pt/anywhere/api/v1/private/externalsystem/attach',
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${anywhereToken}`,
        },
        body: formData,
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error('❌ [API Attach] Erro:', data);
      return NextResponse.json(
        { error: data.message || 'Erro ao anexar documento', details: data },
        { status: response.status }
      );
    }

    console.log('✅ [API Attach] Sucesso:', data);
    return NextResponse.json(data);
  } catch (error) {
    console.error('❌ [API Attach] Erro no servidor:', error);
    return NextResponse.json(
      { error: 'Erro interno no servidor', details: error instanceof Error ? error.message : error },
      { status: 500 }
    );
  }
}

