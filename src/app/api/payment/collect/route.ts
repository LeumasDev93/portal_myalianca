import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { reciboRef, amount, userId: userIdFromBody } = body;

    if (!reciboRef || !amount) {
      return NextResponse.json(
        { success: false, message: 'reciboRef e amount são obrigatórios' },
        { status: 400 }
      );
    }

    // Busca o token da sessão (anywhere token) via API session
    let anywhereToken: string = '';
    let sessionUserId: string | undefined = undefined;
    try {
      const sess = await fetch(new URL('/api/auth/session', request.url), {
        headers: { cookie: request.headers.get('cookie') || '' },
        cache: 'no-store',
      });
      if (sess.ok) {
        const data = await sess.json();
        if (data?.user?.accessToken) {
          anywhereToken = data.user.accessToken as string;
        }
        if (data?.user?.id) {
          sessionUserId = String(data.user.id);
        }
      }
    } catch {
      // Erro ao buscar sessão - silencioso
    }

    if (!anywhereToken) {
      return NextResponse.json(
        { success: false, message: 'Token de sessão ausente para cobrança' },
        { status: 401 }
      );
    }

    // Usa o valor exato sem arredondamento
    const amountNumber = Number(amount);

    const collectUrl = `https://aliancacvtest.rtcom.pt/anywhere/api/v1/private/mobile/invoice/${encodeURIComponent(reciboRef)}/collect`;
    const collectBody = {
      value: amountNumber,
      reference: reciboRef,
      sendEmail: false,
      apiName: 'WebsiteCollection',
    };

    const collectRes = await fetch(collectUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${anywhereToken}`,
      },
      body: JSON.stringify(collectBody),
      cache: 'no-store',
    });

    let collectMessage = '';
    try {
      const ct = collectRes.headers.get('content-type') || '';
      if (ct.includes('application/json')) {
        const payload = await collectRes.json();
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

    // Registra atividade de pagamento (não bloqueante)
    try {
      const action = collectRes.ok ? 'pagamento_confirmado' : 'pagamento_cobranca_erro';
      const description = collectRes.ok
        ? `Pagamento confirmado | ref=${reciboRef} | valor=${amountNumber}`
        : `Falha na cobrança | ref=${reciboRef} | valor=${amountNumber} | msg=${collectMessage}`;
      const activityUserId = (userIdFromBody && String(userIdFromBody)) || sessionUserId || '0';
      
      if (activityUserId === '0') {
      } else {
        const activityResponse = await fetch(new URL('/api/activities', request.url), {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            // Encaminha cookies da requisição original caso a rota dependa de contexto
            cookie: request.headers.get('cookie') || '',
          },
          cache: 'no-store',
          body: JSON.stringify({ userId: activityUserId, action, description }),
        });

        if (!activityResponse.ok) {
          const errorText = await activityResponse.text().catch(() => '');
          console.error('[PAYMENT/COLLECT] Erro ao registrar atividade:', activityResponse.status, errorText, {
            userId: activityUserId,
            action,
            description,
          });
        } else {
          console.log('[PAYMENT/COLLECT] Atividade registrada com sucesso:', { userId: activityUserId, action });
        }
      }
    } catch (error) {
      // Log do erro mas não quebra o fluxo da cobrança
      console.error('[PAYMENT/COLLECT] Exceção ao registrar atividade:', error);
    }

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

