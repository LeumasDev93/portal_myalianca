// Validação de requisições para bloquear ferramentas de API testing

interface RequestValidationResult {
  valid: boolean;
  reason?: string;
}

// Armazenar tokens usados em memória
const usedTokens = new Set<string>();
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

// Limpar tokens usados e rate limits antigos a cada 5 minutos
setInterval(() => {
  usedTokens.clear();
  const now = Date.now();
  for (const [key, value] of rateLimitMap.entries()) {
    if (now > value.resetAt) {
      rateLimitMap.delete(key);
    }
  }
}, 5 * 60 * 1000);

export function validateRequest(request: Request, userId: string): RequestValidationResult {
  // 1. Validar User-Agent (bloquear ferramentas conhecidas)
  const userAgent = request.headers.get('user-agent') || '';
  const suspiciousAgents = ['postman', 'curl', 'wget', 'python-requests', 'insomnia', 'httpie', 'axios/'];
  
  if (suspiciousAgents.some(agent => userAgent.toLowerCase().includes(agent))) {
    return { valid: false, reason: 'Cliente não autorizado' };
  }

  // 2. Validar headers Sec-Fetch-* (navegadores modernos only)
  const secFetchSite = request.headers.get('sec-fetch-site');
  const secFetchMode = request.headers.get('sec-fetch-mode');
  const secFetchDest = request.headers.get('sec-fetch-dest');

  if (!secFetchSite || secFetchSite !== 'same-origin') {
    return { valid: false, reason: 'Headers de navegador ausentes ou inválidos' };
  }

  // 3. Rate limiting agressivo (2 requisições por minuto)
  const now = Date.now();
  const userLimit = rateLimitMap.get(userId);

  if (userLimit) {
    if (now < userLimit.resetAt) {
      if (userLimit.count >= 2) {
        return { valid: false, reason: 'Muitas requisições. Aguarde 1 minuto.' };
      }
      userLimit.count++;
    } else {
      rateLimitMap.set(userId, { count: 1, resetAt: now + 60 * 1000 });
    }
  } else {
    rateLimitMap.set(userId, { count: 1, resetAt: now + 60 * 1000 });
  }

  return { valid: true };
}

export function markTokenAsUsed(token: string): void {
  usedTokens.add(token);
}

export function isTokenUsed(token: string): boolean {
  return usedTokens.has(token);
}

