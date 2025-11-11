import { NextRequest, NextResponse } from 'next/server';

const GATEWAY_BASE_URL = 'https://pay.dev.aliancaseguros.cv';
const GATEWAY_CLIENT_ID = '4224339E02544A5EA6D1B6C6D9443CCA';

export async function POST(request: NextRequest) {
  try {
    const urlObj = new URL(request.url);
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

    const { reference, amount, merchantRef, status: sispStatus, message: sispMessage } = body;
    const awtFromQuery = urlObj.searchParams.get('awt') || '';
    const reciboRefFromQuery = urlObj.searchParams.get('reciboRef') || '';

    let serverStatus: 'ok' | 'error' = 'error';
    let serverMessage = 'Pagamento não processado';
    let collectStatus: 'ok' | 'error' | 'skipped' = 'skipped';
    let collectMessage = '';

    console.log('[BACKOFFICE] Status do SISP:', sispStatus);
    console.log('[BACKOFFICE] Mensagem do SISP:', sispMessage);

    // SE SISP RETORNOU ERRO - NÃO VALIDA HMAC
    if (sispStatus === 'ERRO' || sispStatus === 'ERROR' || sispStatus === 'FAILED') {
      serverStatus = 'error';
      serverMessage = sispMessage || 'Pagamento rejeitado pelo gateway';
      console.log('❌ [BACKOFFICE] SISP retornou ERRO - NÃO validando HMAC');
      console.log('❌ [BACKOFFICE] Mensagem:', serverMessage);
    } else {
      // SISP retornou sucesso - VALIDA HMAC
      console.log('✅ [BACKOFFICE] SISP OK - Validando HMAC...');
      
      const hmacPayload = {
        reference: (reference || merchantRef || '').toString().trim(),
        hmacFingerprint: (body.hmacFingerprint || body.fingerprint || '').toString(),
      };

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
          const receiptRef = (reciboRefFromQuery || body.reciboRef || '') || cookiesHeader
            .split(';')
            .map((c) => c.trim())
            .find((c) => c.startsWith('recibo_ref='))
            ?.split('=')[1] || reference || '';

            console.log('receiptRef -->', receiptRef, cookiesHeader,  "<-- cookiesHeader");
          const collectUrl = `https://aliancacvtest.rtcom.pt/anywhere/api/v1/private/mobile/invoice/P2025.422/collect`;
          const collectBody = {
            value: Number(amount),
            reference: "P2025.422",
            sendEmail: false,
            apiName: 'WebsiteCollection',
          };

          // Prioridade: sessão NextAuth -> awt (query/body). NÃO usar pay_token/anywhere_token cookies
          let anywhereBearer: string = '';
          let tokenSource = 'none';
          try {
            const sess = await fetch(new URL('/api/auth/session', request.url), {
              headers: { cookie: request.headers.get('cookie') || '' },
              cache: 'no-store',
            });
            if (sess.ok) {
              const data = await sess.json();
              if (data?.user?.accessToken) {
                anywhereBearer = data.user.accessToken as string;
                tokenSource = 'session';
              }
            }
          } catch {}
          if (!anywhereBearer && (awtFromQuery || body['awt'])) {
            anywhereBearer = (awtFromQuery || body['awt']) as string;
            tokenSource = 'awt';
          }
          console.log('[COLLECT TOKEN]', tokenSource, anywhereBearer ? String(anywhereBearer).slice(0, 8) : 'MISSING');
          if (!anywhereBearer) {
            collectStatus = 'error';
            collectMessage = 'Token de sessão ausente para cobrança';
            throw new Error('MISSING_ANYWHERE_TOKEN');
          }

          const collectRes = await fetch(collectUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              ...(anywhereBearer ? { Authorization: `Bearer ${anywhereBearer}` } : {}),
            },
            body: JSON.stringify(collectBody),
            cache: 'no-store',
          });
          console.log('[COLLECT]', collectUrl, 'status=', collectRes.status);
          collectStatus = collectRes.ok ? 'ok' : 'error';
          try {
            const ct = collectRes.headers.get('content-type') || '';
            if (ct.includes('application/json')) {
              const payload = await collectRes.json();
              // monta mensagem amigável com campos relevantes se existirem
              const msg = payload?.error
                ? String(payload.error)
                : payload?.message || payload?.desc || (collectRes.ok ? 'Cobrança confirmada' : 'Falha ao cobrar');
              const value = payload?.value ?? collectBody.value;
              const ref = payload?.reference ?? collectBody.reference;
              collectMessage = `${msg}${ref ? ` | Ref: ${ref}` : ''}${value ? ` | Valor: ${value}` : ''}`;
            } else {
              const text = await collectRes.text();
              collectMessage = (text && text.trim().length > 0)
                ? text.slice(0, 300)
                : (collectRes.ok ? 'Cobrança confirmada' : `Falha ao cobrar (${collectRes.status})`);
            }
          } catch {
            collectMessage = collectRes.ok ? 'Cobrança confirmada' : `Falha ao cobrar (${collectRes.status})`;
          }
        }
      } else {
        serverStatus = 'error';
        serverMessage = 'Falha na validação de segurança do pagamento';
      }
    } catch {
      serverStatus = 'error';
      serverMessage = 'Erro no servidor ao validar/cobrar';
    }
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
