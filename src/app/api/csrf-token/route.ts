import { NextResponse } from 'next/server';
import { generateCsrfToken, hashCsrfToken } from '@/lib/csrf';
import { cookies } from 'next/headers';
import { getServerSession } from 'next-auth';

export async function GET() {
  try {
    // 1. VALIDAR SESSÃO - Apenas usuários autenticados podem gerar tokens
    const session = await getServerSession();
    
    if (!session || !session.user) {
      console.warn('CSRF: Tentativa de gerar token sem sessão válida');
      return NextResponse.json(
        { error: 'Não autorizado - sessão inválida' },
        { status: 401 }
      );
    }

    // 2. Gerar token CSRF único vinculado à sessão + timestamp + nonce
    const sessionId = session.user.id || session.user.username || '';
    const timestamp = Date.now().toString();
    const token = generateCsrfToken();
    const nonce = generateCsrfToken(); // Nonce adicional para cada token
    
    // Token completo: token + sessionId + timestamp + nonce (só o hash é armazenado)
    const tokenWithSession = `${token}.${sessionId}.${timestamp}.${nonce}`;
    const hashedToken = hashCsrfToken(tokenWithSession);

    // 3. Armazenar hash no cookie (HttpOnly para segurança)
    const cookieStore = await cookies();
    cookieStore.set('csrf-token-hash', hashedToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 5, // 5 minutos (one-time use)
      path: '/',
    });

    // Armazenar timestamp e nonce separados para validação
    cookieStore.set('csrf-token-ts', timestamp, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 5,
      path: '/',
    });

    cookieStore.set('csrf-nonce', nonce, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 5,
      path: '/',
    });

    // 4. Retornar apenas o token (sem session ID/timestamp) para o cliente
    console.log('CSRF: Token gerado para usuário:', sessionId);
    return NextResponse.json({ csrfToken: token });
  } catch (error) {
    console.error('Erro ao gerar token CSRF:', error);
    return NextResponse.json(
      { error: 'Erro ao gerar token de segurança' },
      { status: 500 }
    );
  }
}

