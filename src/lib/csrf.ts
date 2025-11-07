import { randomBytes, createHash } from 'crypto';

// Gerar token CSRF único
export function generateCsrfToken(): string {
  return randomBytes(32).toString('hex');
}

// Criar hash do token para validação
export function hashCsrfToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}

// Validar token CSRF
export function validateCsrfToken(token: string, hashedToken: string): boolean {
  if (!token || !hashedToken) return false;
  return hashCsrfToken(token) === hashedToken;
}

// Verificar origem da requisição (fallback se não usar token)
export function validateOrigin(request: Request): boolean {
  const origin = request.headers.get('origin');
  const referer = request.headers.get('referer');
  const host = request.headers.get('host');

  const allowedOrigins = [
    process.env.NEXT_PUBLIC_APP_URL,
    `https://${host}`,
    `http://${host}`,
    process.env.NEXTAUTH_URL
  ].filter(Boolean);

  const isValidOrigin = origin && allowedOrigins.some(allowed => 
    origin === allowed || origin.startsWith(allowed as string)
  );

  const isValidReferer = referer && allowedOrigins.some(allowed => 
    referer.startsWith(allowed as string)
  );

  return !!(isValidOrigin || isValidReferer);
}

