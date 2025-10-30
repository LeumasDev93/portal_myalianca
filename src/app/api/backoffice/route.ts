import { NextRequest, NextResponse } from 'next/server';

const GATEWAY_BASE_URL = 'https://pay.dev.aliancaseguros.cv';
const GATEWAY_CLIENT_ID = '4224339E02544A5EA6D1B6C6D9443CCA';

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
      try {
        body = await request.json();
      } catch {
        body = {};
      }
    }

    console.log('[PAYMENT CALLBACK] Recebido callback POST do SISP (via /backoffice):', body);

    const { reference, amount, merchantRef } = body;

    const hmacPayload = {
      reference: (reference || merchantRef || '').toString().trim(),
      hmacFingerprint: (body.hmacFingerprint || body.fingerprint || '').toString(),
    };

    let serverStatus: 'ok' | 'error' = 'error';
    let serverMessage = 'Falha na validação HMAC';
    let collectStatus: 'ok' | 'error' | 'skipped' = 'skipped';
    let collectMessage = '';

    try {
      const gatewayToken = request.cookies.get('pay_token')?.value || '';
      const validateRes = await fetch(`${GATEWAY_BASE_URL}/api/v1/pagamentos/validar-hmac`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Client-Id': GATEWAY_CLIENT_ID,
          ...(gatewayToken ? { Authorization: `Bearer ${gatewayToken}` } : {}),
        },
        body: JSON.stringify(hmacPayload),
        cache: 'no-store',
      });
      if (!validateRes.ok) {
        const txt = await validateRes.text().catch(() => '');
        console.error('[BACKOFFICE] validar-hmac falhou:', validateRes.status, txt);
      }
      if (validateRes.ok) {
        serverStatus = 'ok';
        serverMessage = 'HMAC válido';

        if (merchantRef && amount) {
          const cookiesHeader = request.headers.get('cookie') || '';
          const receiptRef = cookiesHeader
            .split(';')
            .map((c) => c.trim())
            .find((c) => c.startsWith('recibo_ref='))
            ?.split('=')[1] || reference || '';

            console.log('receiptRef -->', receiptRef, cookiesHeader,  "<-- cookiesHeader");
          const collectUrl = `https://aliancacvtest.rtcom.pt/anywhere/api/v1/private/mobile/invoice/${encodeURIComponent(receiptRef)}/collect`;
          const collectBody = {
            value: Number(amount),
            reference: receiptRef,
            sendEmail: false,
            apiName: 'WebsiteCollection',
          };

          const anywhereBearer = request.cookies.get('anywhere_token')?.value || request.cookies.get('token')?.value || '';
          const anywhereApiKey = process.env.ANYWHERE_API_KEY || process.env.NEXT_PUBLIC_API_KEY || '';

          const collectRes = await fetch(collectUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              ...(anywhereBearer ? { Authorization: `Bearer ${anywhereBearer}` } : {}),
              ...(anywhereApiKey ? { ApiKey: anywhereApiKey } : {}),
            },
            body: JSON.stringify(collectBody),
            cache: 'no-store',
          });
          console.log('[COLLECT]', collectUrl, 'status=', collectRes.status);
          collectStatus = collectRes.ok ? 'ok' : 'error';
          collectMessage = collectRes.ok ? 'Cobrança confirmada' : `Falha ao cobrar (${collectRes.status})`;
        }
      } else {
        serverStatus = 'error';
        serverMessage = 'Validação HMAC falhou';
      }
    } catch {
      serverStatus = 'error';
      serverMessage = 'Erro no servidor ao validar/cobrar';
    }

    const redirectUrl = new URL('/backoffice', request.url);
    redirectUrl.searchParams.set('menu', 'recibo');
    redirectUrl.searchParams.set('server_status', serverStatus);
    redirectUrl.searchParams.set('server_message', serverMessage);
    redirectUrl.searchParams.set('collect_status', collectStatus);
    if (collectMessage) redirectUrl.searchParams.set('collect_message', collectMessage);
    redirectUrl.searchParams.set('merchantRef', body.merchantRef || '');
    redirectUrl.searchParams.set('amount', body.amount?.toString() || '');

    const res = NextResponse.redirect(redirectUrl, 303);
    res.cookies.set('postpay', '1', {
      path: '/',
      maxAge: 10,
      sameSite: 'none',
      secure: true,
    });
    res.cookies.set('pay_token', '', { path: '/', maxAge: 0, sameSite: 'none', secure: true });
    return res;
  } catch (error) {
    console.error('[PAYMENT CALLBACK] Erro no callback POST (/backoffice):', error);
    const redirectUrl = new URL('/backoffice', request.url);
    redirectUrl.searchParams.set('menu', 'recibo');
    redirectUrl.searchParams.set('payment_status', 'error');
    return NextResponse.redirect(redirectUrl, 303);
  }
}
