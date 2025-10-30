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

    // SERVER-SIDE: valida HMAC e, se OK, efetiva a cobrança do recibo
    const hmacPayload = {
      reference: reference,
      hmacFingerprint: (body.hmacFingerprint || body.fingerprint || '').toString(),
    };
    let serverStatus = 'error';
    let serverMessage = 'Falha na validação HMAC';
    let collectStatus = 'skipped';
    let collectMessage = '';
    try {
      const validateRes = await fetch('https://aliancacvtest.rtcom.pt/api/v1/pagamentos/validar-hmac', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(hmacPayload),
        cache: 'no-store',
      });
      if (validateRes.ok) {
        serverStatus = 'ok';
        serverMessage = 'HMAC válido';
        if (merchantRef && amount) {
          const token = request.cookies.get('token')?.value || '';
          const collectUrl = `https://aliancacvtest.rtcom.pt/anywhere/api/v1/private/mobile/invoice/${merchantRef}/collect`;
          const collectBody = {
            value: Number(amount),
            reference: merchantRef,
            sendEmail: false,
            apiName: 'WebsiteCollection',
          };
          const collectRes = await fetch(collectUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
            body: JSON.stringify(collectBody),
            cache: 'no-store',
          });
          collectStatus = collectRes.ok ? 'ok' : 'error';
          collectMessage = collectRes.ok ? 'Cobrança confirmada' : `Falha ao cobrar (${collectRes.status})`;
        }
      } else {
        serverStatus = 'error';
        serverMessage = `Validação HMAC falhou (${validateRes.status})`;
      }
    } catch (_e) {
      serverStatus = 'error';
      serverMessage = 'Erro no servidor ao validar/cobrar';
    }

    // Redireciona para a página de recibos com resultado do servidor
    const redirectUrl = new URL('/backoffice', request.url);
    redirectUrl.searchParams.set('menu', 'recibo');
    redirectUrl.searchParams.set('server_status', serverStatus);
    redirectUrl.searchParams.set('server_message', serverMessage);
    redirectUrl.searchParams.set('collect_status', collectStatus);
    if (collectMessage) redirectUrl.searchParams.set('collect_message', collectMessage);
    redirectUrl.searchParams.set('merchantRef', merchantRef || '');
    redirectUrl.searchParams.set('amount', amount?.toString() || '');
    
    const res = NextResponse.redirect(redirectUrl, 303);
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
    
    const res = NextResponse.redirect(redirectUrl, 303);
    res.cookies.set('postpay', '1', {
      path: '/',
      maxAge: 10,
      sameSite: 'none',
      secure: true,
    });
    return res;
  }
}
