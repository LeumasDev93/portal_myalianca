// Rate limiting simples em memória
interface RateLimitEntry {
  count: number;
  resetTime: number;
  lastIp?: string;
}

const rateLimitMap = new Map<string, RateLimitEntry>();

// Limpar entradas antigas a cada 10 minutos
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of rateLimitMap.entries()) {
    if (now > value.resetTime) {
      rateLimitMap.delete(key);
    }
  }
}, 10 * 60 * 1000);

export function checkRateLimit(
  userId: string,
  ip: string,
  maxRequests: number = 5,
  windowMs: number = 60 * 1000 // 1 minuto
): { allowed: boolean; remaining: number } {
  const now = Date.now();
  const key = userId;
  const entry = rateLimitMap.get(key);

  if (!entry || now > entry.resetTime) {
    // Criar nova entrada
    rateLimitMap.set(key, {
      count: 1,
      resetTime: now + windowMs,
      lastIp: ip
    });
    return { allowed: true, remaining: maxRequests - 1 };
  }

  // Verificar mudança de IP (possível session hijacking)
  if (entry.lastIp && entry.lastIp !== ip) {
    console.warn('Rate Limit: Mudança de IP detectada', {
      userId,
      oldIp: entry.lastIp,
      newIp: ip
    });
    // Resetar contador em caso de IP diferente
    rateLimitMap.set(key, {
      count: 1,
      resetTime: now + windowMs,
      lastIp: ip
    });
    return { allowed: true, remaining: maxRequests - 1 };
  }

  // Incrementar contador
  entry.count++;
  entry.lastIp = ip;

  if (entry.count > maxRequests) {
    return { allowed: false, remaining: 0 };
  }

  return { allowed: true, remaining: maxRequests - entry.count };
}

