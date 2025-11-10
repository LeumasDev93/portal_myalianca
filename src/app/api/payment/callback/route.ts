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
    const reference = searchParams.get('reference');
    const merchantRef = searchParams.get('merchantRef');
    const amount = searchParams.get('amount');
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
      const attempt = await tryValidateHmac({ reference: hmacPayload.reference, fingerprint: hmacPayload.hmacFingerprint, accessToken: gatewayToken });
      if (!attempt.ok) {
        console.error('[PAYMENT CALLBACK][GET] validar-hmac falhou:', attempt.status, attempt.text);
      }
      if (attempt.ok) {
        serverStatus = 'ok';
        serverMessage = 'HMAC válido';
        if (amount) {
          const receiptRef = request.cookies.get('recibo_ref')?.value;
          const collectUrl = `https://aliancacvtest.rtcom.pt/anywhere/api/v1/private/mobile/invoice/${receiptRef}/collect`;
          const collectBody = {
            value: Number(amount),
            reference: receiptRef,
            sendEmail: false,
            apiName: 'WebsiteCollection',
          };
          const anywhereBearer = request.cookies.get('anywhere_token')?.value;
          const collectRes = await fetch(collectUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${anywhereBearer}`,
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

    // Determinar sucesso/erro
    const isSuccess = serverStatus === 'ok' && collectStatus === 'ok';
    const finalMessage = isSuccess 
      ? 'Pagamento processado e confirmado com sucesso.' 
      : (serverMessage || collectMessage || 'Erro ao processar pagamento.');

    // HTML para enviar mensagem ao parent window (modal)
    const htmlResponse = `
      <!DOCTYPE html>
      <html>
        <head><title>Processando...</title></head>
        <body>
          <script>
            if (window.parent) {
              window.parent.postMessage({
                type: 'payment-result',
                success: ${isSuccess},
                message: '${finalMessage.replace(/'/g, "\\'")}'
              }, '*');
            }
          </script>
          <p style="text-align: center; padding: 40px; font-family: sans-serif;">
            ${isSuccess ? 'Pagamento realizado com sucesso!' : 'Erro no pagamento.'}
          </p>
        </body>
      </html>
    `;

    const res = new NextResponse(htmlResponse, {
      status: 200,
      headers: { 
        'Content-Type': 'text/html',
        'X-Frame-Options': 'SAMEORIGIN',
        'Content-Security-Policy': "frame-ancestors 'self'"
      },
    });
    res.cookies.set('postpay', '1', {
      path: '/',
      maxAge: 10,
      sameSite: 'lax',
    });
    res.cookies.set('pay_token', '', { path: '/', maxAge: 0, sameSite: 'lax' });
    return res;
  } catch (error) {
    console.error('[PAYMENT CALLBACK] Erro no callback:', error);
    
    // HTML de erro para enviar ao parent window
    const htmlResponse = `
      <!DOCTYPE html>
      <html>
        <head><title>Erro</title></head>
        <body>
          <script>
            if (window.parent) {
              window.parent.postMessage({
                type: 'payment-result',
                success: false,
                message: 'Erro ao processar o callback do pagamento.'
              }, '*');
            }
          </script>
          <p style="text-align: center; padding: 40px; font-family: sans-serif;">Erro no pagamento.</p>
        </body>
      </html>
    `;
    
    const res = new NextResponse(htmlResponse, {
      status: 200,
      headers: { 
        'Content-Type': 'text/html',
        'X-Frame-Options': 'SAMEORIGIN',
        'Content-Security-Policy': "frame-ancestors 'self'"
      },
    });
    res.cookies.set('postpay', '1', {
      path: '/',
      maxAge: 10,
      sameSite: 'lax',
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
    
    const {
      reference,
      amount,
      merchantRef,
      fingerprint,
      reciboRef: reciboRefBody,
    } = body;

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
          const receiptRef = reciboRefBody || request.cookies.get('recibo_ref')?.value || refPost;
          const collectUrl = `https://aliancacvtest.rtcom.pt/anywhere/api/v1/private/mobile/invoice/${merchantRef}/collect`;
          const collectBody = {
            value: Number(amount),
            reference: receiptRef || merchantRef,
            sendEmail: false,
            apiName: 'WebsiteCollection',
          };
          
          const anywhereBearerPost = request.cookies.get('anywhere_token')?.value;
          const collectRes = await fetch(collectUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              ...(anywhereBearerPost ? { Authorization: `Bearer ${anywhereBearerPost}` } : {}),
            },
            body: JSON.stringify(collectBody),
            cache: 'no-store',
          });
          try {
            const contentType = collectRes.headers.get('content-type') || '';
            let respBody: unknown = null;
            if (contentType.includes('application/json')) {
              respBody = await collectRes.json();
            } else {
              const text = await collectRes.text();
              respBody = text.length > 300 ? text.slice(0, 300) : text;
            }
            console.log('[COLLECT][callback][POST]', collectUrl, 'status=', collectRes.status, 'body=', respBody);
          } catch {
            console.log('[COLLECT][callback][POST]', collectUrl, 'status=', collectRes.status, '(no body)');
          }
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

    // Determinar sucesso/erro
    const isSuccess = serverStatus === 'ok' && collectStatus === 'ok';
    const finalMessage = isSuccess 
      ? 'Pagamento processado e confirmado com sucesso.' 
      : (serverMessage || collectMessage || 'Erro ao processar pagamento.');

    // HTML para enviar mensagem ao parent window (modal)
    const htmlResponse = `
      <!DOCTYPE html>
      <html>
        <head><title>Processando...</title></head>
        <body>
          <script>
            if (window.parent) {
              window.parent.postMessage({
                type: 'payment-result',
                success: ${isSuccess},
                message: '${finalMessage.replace(/'/g, "\\'")}'
              }, '*');
            }
          </script>
          <p style="text-align: center; padding: 40px; font-family: sans-serif;">
            ${isSuccess ? 'Pagamento realizado com sucesso!' : 'Erro no pagamento.'}
          </p>
        </body>
      </html>
    `;

    const res = new NextResponse(htmlResponse, {
      status: 200,
      headers: { 
        'Content-Type': 'text/html',
        'X-Frame-Options': 'SAMEORIGIN',
        'Content-Security-Policy': "frame-ancestors 'self'"
      },
    });
    res.cookies.set('postpay', '1', {
      path: '/',
      maxAge: 10,
      sameSite: 'lax',
    });
    res.cookies.set('pay_token', '', {
      path: '/',
      maxAge: 0,
      sameSite: 'lax',
    });
    return res;
  } catch (error) {
    console.error('[PAYMENT CALLBACK] Erro no callback POST:', error);
    
    // HTML de erro para enviar ao parent window
    const htmlResponse = `
      <!DOCTYPE html>
      <html>
        <head><title>Erro</title></head>
        <body>
          <script>
            if (window.parent) {
              window.parent.postMessage({
                type: 'payment-result',
                success: false,
                message: 'Erro ao processar o callback do pagamento.'
              }, '*');
            }
          </script>
          <p style="text-align: center; padding: 40px; font-family: sans-serif;">Erro no pagamento.</p>
        </body>
      </html>
    `;
    
    const res = new NextResponse(htmlResponse, {
      status: 200,
      headers: { 
        'Content-Type': 'text/html',
        'X-Frame-Options': 'SAMEORIGIN',
        'Content-Security-Policy': "frame-ancestors 'self'"
      },
    });
    res.cookies.set('postpay', '1', {
      path: '/',
      maxAge: 10,
      sameSite: 'lax',
    });
    return res;
  }
}
