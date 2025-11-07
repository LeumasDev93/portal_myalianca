import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { validateCsrfToken, validateOrigin } from '@/lib/csrf';

export async function POST(request: Request) {
  try {
    // ===== CSRF Protection =====
    // 1. Validar origem da requisição
    if (!validateOrigin(request)) {
      console.warn('CSRF: Requisição bloqueada - origem inválida');
      return NextResponse.json(
        { error: 'Requisição não autorizada' },
        { status: 403 }
      );
    }

    // 2. Validar token CSRF
    const csrfToken = request.headers.get('x-csrf-token');
    const cookieStore = await cookies();
    const csrfTokenHash = cookieStore.get('csrf-token-hash')?.value;

    if (!csrfToken || !csrfTokenHash || !validateCsrfToken(csrfToken, csrfTokenHash)) {
      console.warn('CSRF: Token inválido ou ausente');
      return NextResponse.json(
        { error: 'Token de segurança inválido' },
        { status: 403 }
      );
    }
    // ===== Fim CSRF Protection =====

    const apiUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}/ocorrencias`;
    const apiToken = process.env.API_SECRET_TOKEN;

    const body = await request.json();

    // Validação dos campos obrigatórios
    const requiredFields = [
      'id_apolice', 'nome_apolice',
      'descricao', 'data_ocorrencia', 'local_ocorrencia',
      'user_id'
    ];

    const missingFields = requiredFields.filter(field => !body[field]);

    if (missingFields.length > 0) {
      return NextResponse.json(
        { error: `Campos obrigatórios faltando: ${missingFields.join(', ')}` },
        { status: 400 }
      );
    }

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiToken}`,
        'ApiKey': process.env.NEXT_PUBLIC_API_KEY || ''
      },
      body: JSON.stringify({
        id_apolice: body.id_apolice,
        nome_apolice: body.nome_apolice,
        objeto_seguro: body.objeto_seguro,
        descricao: body.descricao,
        id_anexos: body.id_anexos || [],
        data_ocorrencia: body.data_ocorrencia,
        hora_ocorrencia: body.hora_ocorrencia || null,
        local_ocorrencia: body.local_ocorrencia,
        user_id: body.user_id
      })
    }); 

    if (!response.ok) {
      throw new Error(`Erro ao registrar sinistro: ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data);

  } catch (error) {
    console.error('Erro no registro de sinistro:', error);
    return NextResponse.json(
      { error: 'Falha ao registrar sinistro', details: error instanceof Error ? error.message : 'Erro desconhecido' },
      { status: 500 }
    );
  }
}