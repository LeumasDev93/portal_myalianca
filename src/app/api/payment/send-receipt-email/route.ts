import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { reciboRef, amount, email } = body;

    if (!reciboRef || !amount || !email) {
      return NextResponse.json(
        { success: false, message: 'reciboRef, amount e email são obrigatórios' },
        { status: 400 }
      );
    }

    // Validação básica de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { success: false, message: 'Email inválido' },
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
        }
      }
    } catch {
      // Erro ao buscar sessão
    }

    if (!anywhereToken) {
      return NextResponse.json(
        { success: false, message: 'Token de sessão ausente para envio de email' },
        { status: 401 }
      );
    }

    // Usa o valor exato sem arredondamento
    const amountNumber = Number(amount);

    const collectUrl = `https://aliancacvtest.rtcom.pt/anywhere/api/v1/private/mobile/invoice/${encodeURIComponent(reciboRef)}/collect`;
    const collectBody = {
      value: amountNumber,
      reference: reciboRef,
      sendEmail: true,
      email: email,
      apiName: 'WebsiteCollection',
    };

    const collectRes = await fetch(collectUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${anywhereToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(collectBody),
    });

    const collectData = await collectRes.json();

    if (!collectRes.ok) {
      const errorMessage = collectData?.message || collectData?.error || collectData?.detail || `Erro ${collectRes.status}: Erro ao enviar recibo por email`;
      return NextResponse.json(
        { success: false, message: errorMessage },
        { status: collectRes.status }
      );
    }

    return NextResponse.json({
      success: true,
      message: collectData?.message || 'Recibo enviado por email com sucesso',
      data: collectData,
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Erro ao enviar recibo por email';
    return NextResponse.json(
      { success: false, message: errorMessage },
      { status: 500 }
    );
  }
}

