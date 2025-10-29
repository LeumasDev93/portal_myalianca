import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    let body: Record<string, string> = {};
    const contentType = request.headers.get('content-type') || '';

    if (contentType.includes('application/x-www-form-urlencoded') || contentType.includes('multipart/form-data')) {
      const form = await request.formData();
      form.forEach((value, key) => {
        body[key] = typeof value === 'string' ? value : '';
      });
    } else if (contentType.includes('application/json')) {
      body = await request.json();
    } else {
      // Tenta JSON como fallback
      try {
        body = await request.json();
      } catch {
        body = {};
      }
    }
    
    console.log('[PAYMENT CALLBACK] Recebido callback POST do SISP (via /backoffice):', body);

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
    redirectUrl.searchParams.set('payment_status', (status || 'unknown').toString());
    redirectUrl.searchParams.set('reference', reference || '');
    redirectUrl.searchParams.set('merchantSession', merchantSession || '');
    redirectUrl.searchParams.set('merchantRef', merchantRef || '');
    redirectUrl.searchParams.set('amount', amount?.toString() || '');
    redirectUrl.searchParams.set('currency', currency || '');
    redirectUrl.searchParams.set('message', message || '');
    redirectUrl.searchParams.set('timestamp', timestamp || '');
    
    const res = NextResponse.redirect(redirectUrl);
    // Permite 1 passagem sem token após pagamento para evitar loop (10s)
    res.cookies.set('postpay', '1', {
      path: '/',
      maxAge: 10,
      sameSite: 'none',
      secure: true,
    });
    return res;
  } catch (error) {
    console.error('[PAYMENT CALLBACK] Erro no callback POST:', error);
    
    // Em caso de erro, redireciona para a página de recibos
    const redirectUrl = new URL('/backoffice', request.url);
    redirectUrl.searchParams.set('menu', 'recibo');
    redirectUrl.searchParams.set('payment_status', 'error');
    
    const res = NextResponse.redirect(redirectUrl);
    res.cookies.set('postpay', '1', {
      path: '/',
      maxAge: 10,
      sameSite: 'none',
      secure: true,
    });
    return res;
  }
}
