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

    const { reference, amount, merchantRef, status: sispStatus, message: sispMessage } = body;
    const awtFromQuery = urlObj.searchParams.get('awt') || '';
    const reciboRefFromQuery = urlObj.searchParams.get('reciboRef') || '';

    let serverStatus: 'ok' | 'error' | 'cancelled' = 'error';
    let serverMessage = 'Pagamento não processado';
    let collectStatus: 'ok' | 'error' | 'skipped' = 'skipped';
    let collectMessage = '';

    // Verificar se foi cancelamento (normalmente vem com mensagem específica ou status específico)
    const sispMessageLower = (sispMessage || '').toLowerCase();
    const isCancelled = sispMessageLower.includes('cancel') || 
                        sispMessageLower.includes('cancelado') ||
                        sispMessageLower.includes('cancelled') ||
                        body.status_code === '3' ||
                        body.status_code === '2' && (sispMessageLower.includes('cancel') || sispMessageLower.includes('cancelado') || sispMessageLower.includes('cancelled')) ||
                        sispStatus === 'CANCELLED' ||
                        sispStatus === 'CANCEL' ||
                        sispStatus === 'ERRO' && (sispMessageLower.includes('cancel') || sispMessageLower.includes('cancelado') || sispMessageLower.includes('cancelled'));

    // SE SISP RETORNOU ERRO OU CANCELAMENTO - NÃO VALIDA HMAC
    if (isCancelled) {
      serverStatus = 'cancelled';
      serverMessage = sispMessage || 'Pagamento cancelado pelo cliente';
    } else if (sispStatus === 'ERRO' || sispStatus === 'ERROR' || sispStatus === 'FAILED') {
      serverStatus = 'error';
      serverMessage = sispMessage || 'Pagamento rejeitado pelo gateway';
    } else {
      // SISP retornou sucesso - VALIDA HMAC
      
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
        await validateRes.text().catch(() => '');
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
            ?.split('=')[1] || body.orderReference || '';

          if (!receiptRef) {
            collectStatus = 'error';
            collectMessage = 'Referência do recibo não encontrada';
          } else {
            // Usa o valor exato sem arredondamento
            const amountNumber = Number(amount);
            
            const collectUrl = `https://aliancacvtest.rtcom.pt/anywhere/api/v1/private/mobile/invoice/${encodeURIComponent(receiptRef)}/collect`;
            const collectBody = {
              value: amountNumber,
              reference: receiptRef,
              sendEmail: false,
              apiName: 'WebsiteCollection',
            };

            // Prioridade: sessão NextAuth -> awt (query/body). NÃO usar pay_token/anywhere_token cookies
            let anywhereBearer: string = '';
            try {
              const sess = await fetch(new URL('/api/auth/session', request.url), {
                headers: { cookie: request.headers.get('cookie') || '' },
                cache: 'no-store',
              });
              if (sess.ok) {
                const data = await sess.json();
                if (data?.user?.accessToken) {
                  anywhereBearer = data.user.accessToken as string;
                }
              }
            } catch {}
            if (!anywhereBearer && (awtFromQuery || body['awt'])) {
              anywhereBearer = (awtFromQuery || body['awt']) as string;
            }
            if (!anywhereBearer) {
              collectStatus = 'error';
              collectMessage = 'Token de sessão ausente para cobrança';
            } else {
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
              
              try {
                const ct = collectRes.headers.get('content-type') || '';
                if (ct.includes('application/json')) {
                  const payload = await collectRes.json();
                  // Usa apenas a mensagem da resposta, sem adicionar referência e valor
                  collectMessage = payload?.error
                    ? String(payload.error)
                    : payload?.message || payload?.desc || (collectRes.ok ? 'Cobrança confirmada com sucesso' : 'Falha ao cobrar');
                } else {
                  const text = await collectRes.text();
                  collectMessage = (text && text.trim().length > 0)
                    ? text.slice(0, 300)
                    : (collectRes.ok ? 'Cobrança confirmada com sucesso' : `Falha ao cobrar (${collectRes.status})`);
                }
              } catch {
                collectMessage = collectRes.ok ? 'Cobrança confirmada com sucesso' : `Falha ao cobrar (${collectRes.status})`;
              }
            }
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
    // Se houver status_code no body (do SISP), passar também
    if (body.status_code) {
      redirectUrl.searchParams.set('status_code', body.status_code);
    }
    if (sispMessage) {
      redirectUrl.searchParams.set('message', sispMessage);
    }
    
    // Adicionar referência do recibo se disponível
    const cookiesHeader = request.headers.get('cookie') || '';
    const receiptRef = (reciboRefFromQuery || body.reciboRef || '') || cookiesHeader
      .split(';')
      .map((c) => c.trim())
      .find((c) => c.startsWith('recibo_ref='))
      ?.split('=')[1] || body.orderReference || '';
    if (receiptRef) {
      redirectUrl.searchParams.set('reciboRef', receiptRef);
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
  } catch {
    const redirectUrl = new URL('/backoffice', request.url);
    redirectUrl.searchParams.set('menu', 'recibo');
    redirectUrl.searchParams.set('payment_status', 'error');
    return NextResponse.redirect(redirectUrl, 303);
  }
}
