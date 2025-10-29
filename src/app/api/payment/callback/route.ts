import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const reference = searchParams.get('reference');
    const sessionId = searchParams.get('sessionId');
    const merchantSession = searchParams.get('merchantSession');
    const merchantRef = searchParams.get('merchantRef');
    const amount = searchParams.get('amount');
    const currency = searchParams.get('currency');
    const message = searchParams.get('message');
    const timestamp = searchParams.get('timestamp');
    
    console.log('[PAYMENT CALLBACK] Recebido callback GET do SISP:', {
      status,
      reference,
      sessionId,
      merchantSession,
      merchantRef,
      amount,
      currency,
      message,
      timestamp,
      allParams: Object.fromEntries(searchParams.entries())
    });

    // Redireciona para a página de recibos com todos os parâmetros
    const redirectUrl = new URL('/backoffice', request.url);
    redirectUrl.searchParams.set('menu', 'recibo');
    redirectUrl.searchParams.set('payment_status', status || 'unknown');
    redirectUrl.searchParams.set('reference', reference || '');
    redirectUrl.searchParams.set('merchantSession', merchantSession || '');
    redirectUrl.searchParams.set('merchantRef', merchantRef || '');
    redirectUrl.searchParams.set('amount', amount || '');
    redirectUrl.searchParams.set('currency', currency || '');
    redirectUrl.searchParams.set('message', message || '');
    redirectUrl.searchParams.set('timestamp', timestamp || '');
    
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

    // Extrai os dados do callback do SISP
    const {
      reference,
      status,
      message,
      amount,
      currency,
      merchantSession,
      merchantRef,
      timestamp,
      panMascarado,
      fingerprint
    } = body;

    console.log('[PAYMENT CALLBACK] Dados processados:', {
      reference,
      status,
      message,
      amount,
      currency,
      merchantSession,
      merchantRef,
      timestamp,
      panMascarado: panMascarado ? '***' : 'N/A',
      fingerprint: fingerprint ? '***' : 'N/A'
    });

    // Redireciona para a página de recibos com todos os parâmetros
    const redirectUrl = new URL('/backoffice', request.url);
    redirectUrl.searchParams.set('menu', 'recibo');
    redirectUrl.searchParams.set('payment_status', status || 'unknown');
    redirectUrl.searchParams.set('reference', reference || '');
    redirectUrl.searchParams.set('merchantSession', merchantSession || '');
    redirectUrl.searchParams.set('merchantRef', merchantRef || '');
    redirectUrl.searchParams.set('amount', amount?.toString() || '');
    redirectUrl.searchParams.set('currency', currency || '');
    redirectUrl.searchParams.set('message', message || '');
    redirectUrl.searchParams.set('timestamp', timestamp || '');
    
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
