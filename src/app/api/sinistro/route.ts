import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { validateCsrfToken, validateOrigin } from '@/lib/csrf';
import { getServerSession } from 'next-auth';
import { checkRateLimit } from '@/lib/rateLimit';

export async function POST(request: Request) {
  try {
    // ===== CSRF Protection =====
    // 1. VALIDAR SESSÃO PRIMEIRO
    const session = await getServerSession();
    
    if (!session || !session.user) {
      console.warn('CSRF: Requisição sem sessão válida');
      return NextResponse.json(
        { error: 'Não autorizado - sessão inválida' },
        { status: 401 }
      );
    }

    // 2. Validar origem da requisição
    if (!validateOrigin(request)) {
      console.warn('CSRF: Requisição bloqueada - origem inválida');
      return NextResponse.json(
        { error: 'Requisição não autorizada' },
        { status: 403 }
      );
    }

    // 2.1. Validar headers de navegador (detectar Postman/curl)
    const userAgent = request.headers.get('user-agent') || '';
    const secFetchSite = request.headers.get('sec-fetch-site');
    const secFetchMode = request.headers.get('sec-fetch-mode');
    const secFetchDest = request.headers.get('sec-fetch-dest');

    // Sec-Fetch-* headers são adicionados automaticamente por navegadores modernos
    // Postman/curl não envia esses headers corretamente
    if (!secFetchSite || !secFetchMode || !secFetchDest) {
      console.warn('CSRF: Headers Sec-Fetch ausentes - possível Postman/curl');
      return NextResponse.json(
        { error: 'Requisição não autorizada - cliente inválido' },
        { status: 403 }
      );
    }

    // Validar que Sec-Fetch-Site é "same-origin"
    if (secFetchSite !== 'same-origin') {
      console.warn('CSRF: Sec-Fetch-Site inválido:', secFetchSite);
      return NextResponse.json(
        { error: 'Requisição não autorizada - origem cross-site' },
        { status: 403 }
      );
    }

    // Detectar User-Agents suspeitos (Postman, curl, etc)
    const suspiciousAgents = ['postman', 'curl', 'wget', 'python', 'insomnia', 'httpie'];
    if (suspiciousAgents.some(agent => userAgent.toLowerCase().includes(agent))) {
      console.warn('CSRF: User-Agent suspeito detectado:', userAgent);
      return NextResponse.json(
        { error: 'Requisição não autorizada - cliente não permitido' },
        { status: 403 }
      );
    }

    // 2.2. Rate Limiting - Máximo 5 requisições por minuto por usuário
    const clientIp = request.headers.get('x-forwarded-for')?.split(',')[0] || 
                     request.headers.get('x-real-ip') || 
                     'unknown';
    
    const sessionUserId = session.user.id || '';
    const rateLimit = checkRateLimit(sessionUserId, clientIp, 5, 60 * 1000);
    
    if (!rateLimit.allowed) {
      console.warn('CSRF: Rate limit excedido', { userId: sessionUserId, ip: clientIp });
      return NextResponse.json(
        { error: 'Muitas requisições. Aguarde um momento e tente novamente.' },
        { status: 429 }
      );
    }

    // 3. Validar token CSRF vinculado à sessão
    const csrfToken = request.headers.get('x-csrf-token');
    const cookieStore = await cookies();
    const csrfTokenHash = cookieStore.get('csrf-token-hash')?.value;
    const tokenTimestamp = cookieStore.get('csrf-token-ts')?.value;
    const nonce = cookieStore.get('csrf-nonce')?.value;

    if (!csrfToken || !csrfTokenHash || !tokenTimestamp || !nonce) {
      console.warn('CSRF: Token, timestamp ou nonce ausente');
      return NextResponse.json(
        { error: 'Token de segurança ausente' },
        { status: 403 }
      );
    }

    // Validar timestamp (não aceitar tokens com mais de 5 minutos)
    const tokenAge = Date.now() - parseInt(tokenTimestamp);
    if (tokenAge > 5 * 60 * 1000) {
      console.warn('CSRF: Token expirado');
      cookieStore.delete('csrf-token-hash');
      cookieStore.delete('csrf-token-ts');
      cookieStore.delete('csrf-nonce');
      return NextResponse.json(
        { error: 'Token de segurança expirado' },
        { status: 403 }
      );
    }

    // Recriar token completo com sessionId + timestamp + nonce para validar
    const sessionId = session.user.id || session.user.username || '';
    const tokenWithSession = `${csrfToken}.${sessionId}.${tokenTimestamp}.${nonce}`;
    
    if (!validateCsrfToken(tokenWithSession, csrfTokenHash)) {
      console.warn('CSRF: Token inválido ou sessão não corresponde');
      return NextResponse.json(
        { error: 'Token de segurança inválido' },
        { status: 403 }
      );
    }

    // 4. Invalidar token após uso (one-time use token)
    cookieStore.delete('csrf-token-hash');
    cookieStore.delete('csrf-token-ts');
    cookieStore.delete('csrf-nonce');
    
    console.log('CSRF: Token validado com sucesso para usuário:', sessionId);
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

    // Token validado com sucesso
    console.log('CSRF: Todas as validações passaram com sucesso');

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