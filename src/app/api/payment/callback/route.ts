import { NextRequest, NextResponse } from 'next/server';

const GATEWAY_BASE_URL = 'https://pay.dev.aliancaseguros.cv';
const GATEWAY_CLIENT_ID = '4224339E02544A5EA6D1B6C6D9443CCA';


async function tryValidateHmac(options: {
  reference: string;
  fingerprint: string;
  accessToken?: string;
}): Promise<{ ok: boolean; status: number; text: string }> {
  const { reference, fingerprint, accessToken } = options;
  const url = `${GATEWAY_BASE_URL}/api/v1/pagamentos/validar-hmac`;
  const payload = { reference, hmacFingerprint: fingerprint };
  console.log('[HMAC] ->', payload);
  // 1) Authorization: Bearer {token}
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Client-Id': GATEWAY_CLIENT_ID,
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
    },
    body: JSON.stringify(payload),
    cache: 'no-store',
  });
  if (res.ok || !accessToken) {
    return { ok: res.ok, status: res.status, text: await res.text().catch(() => '') };
  }
  // 1.1) Tentar normalizar '+' (caso tenha virado espaço)
  const normalizedFp = fingerprint.replace(/\s+/g, '+');
  if (normalizedFp !== fingerprint) {
    const res1b = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({ reference, hmacFingerprint: normalizedFp }),
      cache: 'no-store',
    });
    if (res1b.ok) {
      return { ok: true, status: res1b.status, text: await res1b.text().catch(() => '') };
    }
  }
  // 2) Authorization: {token} (sem Bearer)
  const res2 = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Client-Id': GATEWAY_CLIENT_ID,
      Authorization: accessToken,
    },
    body: JSON.stringify(payload),
    cache: 'no-store',
  });
  if (res2.ok) {
    return { ok: true, status: res2.status, text: await res2.text().catch(() => '') };
  }
  // 3) accessToken no cabeçalho dedicado
  const res3 = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Client-Id': GATEWAY_CLIENT_ID,
      accessToken: accessToken,
    } as Record<string, string>,
    body: JSON.stringify(payload),
    cache: 'no-store',
  });
  return { ok: res3.ok, status: res3.status, text: await res3.text().catch(() => '') };
}

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
    const fingerprint = searchParams.get('fingerprint');
 

    // SERVER-SIDE: valida HMAC também para GET
    const refGet = (reference || merchantRef || '').toString().trim();
    const fpGet = (fingerprint || '').toString(); // mantém como veio (base64)
    const hmacPayload = { reference: refGet, hmacFingerprint: fpGet };
    let serverStatus = 'error';
    let serverMessage = 'Falha na validação HMAC';
    let collectStatus = 'skipped';
    let collectMessage = '';
    try {
      const gatewayToken = request.cookies.get('pay_token')?.value || '';
      console.log('[PAYMENT CALLBACK][GET] Validar HMAC - payload:', hmacPayload);
      console.log('[PAYMENT CALLBACK][GET] Validar HMAC - Authorization Bearer presente?:', !!gatewayToken);
      const attempt = await tryValidateHmac({ reference: hmacPayload.reference, fingerprint: hmacPayload.hmacFingerprint, accessToken: gatewayToken });
      if (!attempt.ok) {
        console.error('[PAYMENT CALLBACK][GET] validar-hmac falhou:', attempt.status, attempt.text);
      }
      if (attempt.ok) {
        serverStatus = 'ok';
        serverMessage = 'HMAC válido';
        if (merchantRef && amount) {
          const receiptRef = request.cookies.get('recibo_ref')?.value || (reference || '');
          const collectUrl = `https://aliancacvtest.rtcom.pt/anywhere/api/v1/private/mobile/invoice/${merchantRef}/collect`;
          const collectBody = {
            value: Number(amount),
            reference: receiptRef,
            sendEmail: false,
            apiName: 'WebsiteCollection',
          };
          const anywhereBearer = (await (async () => {
            try {
              const base = new URL(request.url).origin;
              const s = await fetch(`${base}/api/auth/session`, { headers: { cookie: request.headers.get('cookie') || '' }, cache: 'no-store' });
              if (s.ok) { const d = await s.json(); return d?.user?.accessToken || ''; }
            } catch {}
            return '';
          })());
          const anywhereApiKey = process.env.ANYWHERE_API_KEY || process.env.NEXT_PUBLIC_API_KEY || '';
          const collectRes = await fetch(collectUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              ...(anywhereBearer ? { Authorization: `Bearer ${anywhereBearer}` } : {}),
              ...(anywhereApiKey ? { ApiKey: anywhereApiKey } : {}),
              'X-Client-Id': GATEWAY_CLIENT_ID,
              'clientId': GATEWAY_CLIENT_ID,
            },
            body: JSON.stringify(collectBody),
            cache: 'no-store',
          });
          collectStatus = collectRes.ok ? 'ok' : 'error';
          collectMessage = collectRes.ok ? 'Cobrança confirmada' : `Falha ao cobrar (${collectRes.status})`;
        }
      } else {
        serverStatus = 'error';
        serverMessage = `Validação HMAC falhou`;
      }
    } catch {
      serverStatus = 'error';
      serverMessage = 'Erro no servidor ao validar/cobrar';
    }

    // Redireciona com resultado server-side 
    const redirectUrl = new URL('/backoffice', request.url);
    redirectUrl.searchParams.set('menu', 'recibo');
    redirectUrl.searchParams.set('server_status', serverStatus);
    redirectUrl.searchParams.set('server_message', serverMessage);
    redirectUrl.searchParams.set('collect_status', collectStatus);
    if (collectMessage) redirectUrl.searchParams.set('collect_message', collectMessage);
    redirectUrl.searchParams.set('merchantRef', merchantRef || '');
    redirectUrl.searchParams.set('amount', (amount || '').toString());
    // Em caso de erro, devolve os dados usados para HMAC via query string (debug)
    if (serverStatus !== 'ok') {
      try {
        redirectUrl.searchParams.set('debug_ref', (reference || merchantRef || ''));
        redirectUrl.searchParams.set('debug_fp', (fingerprint || ''));
      } catch {}
    }

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
    console.error('[PAYMENT CALLBACK] Erro no callback:', error);
    
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
      const json = await request.json();
      body = json as Record<string, string>;
    } else {
      // Tenta JSON como fallback
      try {
        body = await request.json();
      } catch {
        body = {};
      }
    }
    
    console.log('[PAYMENT CALLBACK] Recebido callback POST do SISP:', body);
    try { console.log('[PAYMENT CALLBACK][POST][DEBUG] rawBody:', JSON.stringify(body)); } catch {}

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
    const refPost = (reference || merchantRef || '').toString().trim();
    const fpPost = (body.hmacFingerprint || fingerprint || '').toString(); // mantém como veio
    const hmacPayload = { reference: refPost, hmacFingerprint: fpPost };
    let serverStatus = 'error';
    let serverMessage = 'Falha na validação HMAC';
    let collectStatus = 'skipped';
    let collectMessage = '';
    try {
      const gatewayToken = request.cookies.get('pay_token')?.value || '';
      const attempt = await tryValidateHmac({ reference: hmacPayload.reference, fingerprint: hmacPayload.hmacFingerprint, accessToken: gatewayToken });
      if (!attempt.ok) {
        console.error('[PAYMENT CALLBACK][POST] validar-hmac falhou:', attempt.status, attempt.text);
      }
      if (attempt.ok) {
        serverStatus = 'ok';
        serverMessage = 'HMAC válido';
        if (merchantRef && amount) {
          const receiptRef = request.cookies.get('recibo_ref')?.value || refPost;
          const collectUrl = `https://aliancacvtest.rtcom.pt/anywhere/api/v1/private/mobile/invoice/${merchantRef}/collect`;
          const collectBody = {
            value: Number(amount),
            reference: receiptRef || merchantRef,
            sendEmail: false,
            apiName: 'WebsiteCollection',
          };
          
          const anywhereBearerPost = (await (async () => {
            try {
              const base = new URL(request.url).origin;
              const s = await fetch(`${base}/api/auth/session`, { headers: { cookie: request.headers.get('cookie') || '' }, cache: 'no-store' });
              if (s.ok) { const d = await s.json(); return d?.user?.accessToken || ''; }
            } catch {}
            return '';
          })());
          const anywhereApiKeyPost = process.env.ANYWHERE_API_KEY || process.env.NEXT_PUBLIC_API_KEY || '';
          const collectRes = await fetch(collectUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              ...(anywhereBearerPost ? { Authorization: `Bearer ${anywhereBearerPost}` } : {}),
              ...(anywhereApiKeyPost ? { ApiKey: anywhereApiKeyPost } : {}),
              'X-Client-Id': GATEWAY_CLIENT_ID,
              'clientId': GATEWAY_CLIENT_ID,
            },
            body: JSON.stringify(collectBody),
            cache: 'no-store',
          });
          collectStatus = collectRes.ok ? 'ok' : 'error';
          collectMessage = collectRes.ok ? 'Cobrança confirmada' : `Falha ao cobrar (${collectRes.status})`;
        }
      } else {
        serverStatus = 'error';
        serverMessage = `Validação HMAC falhou`;
      }
    } catch {
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
    // Em caso de erro, devolve os dados usados para HMAC via query string (debug)
    if (serverStatus !== 'ok') {
      try {
        redirectUrl.searchParams.set('debug_ref', (refPost));
        redirectUrl.searchParams.set('debug_fp', (fpPost));
      } catch {}
    }

    const res = NextResponse.redirect(redirectUrl, 303);
    res.cookies.set('postpay', '1', {
      path: '/',
      maxAge: 10,
      sameSite: 'none',
      secure: true,
    });
    // Limpa o gateway token curto após uso
    res.cookies.set('pay_token', '', {
      path: '/',
      maxAge: 0,
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
    
    return NextResponse.redirect(redirectUrl, 303);
  }
}
