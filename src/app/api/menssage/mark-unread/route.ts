import { NextRequest, NextResponse } from 'next/server';

export async function PATCH(request: NextRequest) {
  try {
    const { messageId, userId, conteudo } = await request.json();
    
    if (!messageId || messageId.trim() === '') {
      return NextResponse.json(
        { error: 'ID da mensagem não fornecido' },
        { status: 400 }
      );
    }
    
    const apiUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL_DEFAULT}/messages/1.0.0/${messageId}/marcar-lida`;
    const apiKey = process.env.NEXT_PUBLIC_API_KEY || '';
    
    console.log('📧 [PROXY] Marcando mensagem como NÃO LIDA:', apiUrl);
    console.log('📧 [PROXY] Body:', { conteudo, user_id: userId });
    
    const response = await fetch(apiUrl, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'ApiKey': apiKey,
      },
      body: JSON.stringify({
        conteudo: conteudo || '',
        user_id: userId || '',
      }),
    });
    
    const responseText = await response.text();
    console.log('📧 [PROXY] Resposta:', response.status, responseText.substring(0, 200));
    
    if (!response.ok) {
      return NextResponse.json(
        { error: `API retornou erro: ${response.status}`, details: responseText },
        { status: response.status }
      );
    }
    
    return NextResponse.json({ success: true, message: 'Mensagem marcada como não lida' });
    
  } catch (error) {
    console.error('❌ [PROXY] Erro ao marcar como não lida:', error);
    return NextResponse.json(
      { error: 'Erro ao processar requisição', details: String(error) },
      { status: 500 }
    );
  }
}

