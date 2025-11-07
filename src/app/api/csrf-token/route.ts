import { NextResponse } from 'next/server';
import { generateCsrfToken, hashCsrfToken } from '@/lib/csrf';
import { cookies } from 'next/headers';

export async function GET() {
  try {
    // Gerar token CSRF único (one-time use)
    const token = generateCsrfToken();
    const hashedToken = hashCsrfToken(token);

    // Armazenar hash no cookie (HttpOnly para segurança)
    // Este token será invalidado após o primeiro uso
    const cookieStore = await cookies();
    cookieStore.set('csrf-token-hash', hashedToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60, // 1 hora (mas será deletado após uso)
      path: '/',
    });

    // Retornar token para o cliente
    return NextResponse.json({ csrfToken: token });
  } catch (error) {
    console.error('Erro ao gerar token CSRF:', error);
    return NextResponse.json(
      { error: 'Erro ao gerar token de segurança' },
      { status: 500 }
    );
  }
}

