import { NextResponse } from 'next/server';
import { generateCsrfToken } from '@/lib/csrf';
import { cookies } from 'next/headers';
import { getServerSession } from 'next-auth';

export async function GET() {
  try {
    // 1. VALIDAR SESSÃO - Apenas usuários autenticados podem gerar tokens
    const session = await getServerSession();
    
    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      );
    }

    // 2. Gerar token CSRF único
    const token = generateCsrfToken();

    // 3. Armazenar token no cookie (HttpOnly + SameSite)
    const cookieStore = await cookies();
    cookieStore.set('csrf-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60, // 1 hora
      path: '/',
    });

    // 4. Retornar token para o cliente incluir no header
    return NextResponse.json({ csrfToken: token });
  } catch (error) {
    console.error('Erro ao gerar token CSRF:', error);
    return NextResponse.json(
      { error: 'Erro ao gerar token de segurança' },
      { status: 500 }
    );
  }
}

