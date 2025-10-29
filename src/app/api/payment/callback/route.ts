import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const reference = searchParams.get('reference');
    const sessionId = searchParams.get('sessionId');
    
    console.log('[PAYMENT CALLBACK] Recebido callback do SISP:', {
      status,
      reference,
      sessionId,
      searchParams: Object.fromEntries(searchParams.entries())
    });

    // Redireciona para a página de recibos com status de pagamento
    const redirectUrl = new URL('/backoffice', request.url);
    redirectUrl.searchParams.set('menu', 'recibo');
    redirectUrl.searchParams.set('payment_status', status || 'unknown');
    redirectUrl.searchParams.set('reference', reference || '');
    
    return NextResponse.redirect(redirectUrl);
  } catch (error) {
    console.error('[PAYMENT CALLBACK] Erro no callback:', error);
    
    // Em caso de erro, redireciona para a página de recibos
    const redirectUrl = new URL('/backoffice', request.url);
    redirectUrl.searchParams.set('menu', 'recibo');
    redirectUrl.searchParams.set('payment_status', 'error');
    
    return NextResponse.redirect(redirectUrl);
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    console.log('[PAYMENT CALLBACK] Recebido callback POST do SISP:', body);

    // Processa o callback POST se necessário
    // Por enquanto, redireciona para GET
    const redirectUrl = new URL('/api/payment/callback', request.url);
    redirectUrl.searchParams.set('status', body.status || 'unknown');
    redirectUrl.searchParams.set('reference', body.reference || '');
    redirectUrl.searchParams.set('sessionId', body.sessionId || '');
    
    return NextResponse.redirect(redirectUrl);
  } catch (error) {
    console.error('[PAYMENT CALLBACK] Erro no callback POST:', error);
    
    // Em caso de erro, redireciona para a página de recibos
    const redirectUrl = new URL('/backoffice', request.url);
    redirectUrl.searchParams.set('menu', 'recibo');
    redirectUrl.searchParams.set('payment_status', 'error');
    
    return NextResponse.redirect(redirectUrl);
  }
}
