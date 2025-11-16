import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { reciboRef, amount } = body;

    if (!reciboRef || !amount) {
      return NextResponse.json(
        { success: false, message: 'reciboRef e amount são obrigatórios' },
        { status: 400 }
      );
    }

    // Busca o token da sessão (anywhere token) via API session
    let anywhereToken: string = '';
    try {
      const sess = await fetch(new URL('/api/auth/session', request.url), {
        headers: { cookie: request.headers.get('cookie') || '' },
        cache: 'no-store',
      });
      if (sess.ok) {
        const data = await sess.json();
        if (data?.user?.accessToken) {
          anywhereToken = data.user.accessToken as string;
          console.log('[COLLECT API] Token da sessão obtido com sucesso');
        }
      }
    } catch (e) {
      console.error('[COLLECT API] Erro ao buscar sessão:', e);
    }

    if (!anywhereToken) {
      console.error('[COLLECT API] Token de sessão ausente');
      return NextResponse.json(
        { success: false, message: 'Token de sessão ausente para cobrança' },
        { status: 401 }
      );
    }

    // Arredonda o valor para cima se tiver decimais
    const roundedValue = amount % 1 !== 0 ? Math.ceil(amount) : amount;
    if (amount !== roundedValue) {
      console.log(`[COLLECT API] Valor arredondado: ${amount} → ${roundedValue}`);
    }

    const collectUrl = `https://aliancacvtest.rtcom.pt/anywhere/api/v1/private/mobile/invoice/${encodeURIComponent(reciboRef)}/collect`;
    const collectBody = {
      value: roundedValue,
      reference: reciboRef,
      sendEmail: false,
      apiName: 'WebsiteCollection',
    };

    console.log('[COLLECT API] Chamando API collect:', {
      url: collectUrl,
      method: 'POST',
      body: collectBody,
      tokenLength: anywhereToken.length,
    });

    const collectRes = await fetch(collectUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${anywhereToken}`,
      },
      body: JSON.stringify(collectBody),
      cache: 'no-store',
    });

    console.log('[COLLECT API] Resposta recebida:', {
      status: collectRes.status,
      statusText: collectRes.statusText,
      ok: collectRes.ok,
    });

    let collectMessage = '';
    try {
      const ct = collectRes.headers.get('content-type') || '';
      if (ct.includes('application/json')) {
        const payload = await collectRes.json();
        console.log('[COLLECT API] Payload JSON:', payload);
        collectMessage = payload?.error
          ? String(payload.error)
          : payload?.message || payload?.desc || (collectRes.ok ? 'Cobrança confirmada com sucesso' : 'Falha ao cobrar');
      } else {
        const text = await collectRes.text();
        console.log('[COLLECT API] Resposta texto:', text.substring(0, 200));
        collectMessage = (text && text.trim().length > 0)
          ? text.slice(0, 300)
          : (collectRes.ok ? 'Cobrança confirmada com sucesso' : `Falha ao cobrar (${collectRes.status})`);
      }
    } catch (err) {
      console.error('[COLLECT API] Erro ao processar resposta:', err);
      collectMessage = collectRes.ok ? 'Cobrança confirmada com sucesso' : `Falha ao cobrar (${collectRes.status})`;
    }

    console.log('[COLLECT API] Resultado final:', {
      success: collectRes.ok,
      message: collectMessage,
    });

    return NextResponse.json({
      success: collectRes.ok,
      message: collectMessage,
      status: collectRes.status,
    });
  } catch {
    return NextResponse.json(
      { success: false, message: 'Erro ao processar cobrança' },
      { status: 500 }
    );
  }
}

