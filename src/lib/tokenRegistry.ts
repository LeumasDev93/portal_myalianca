// Registro de tokens válidos em memória
// Tokens são registrados ao serem gerados e removidos ao serem usados

interface TokenEntry {
  hash: string;
  sessionId: string;
  timestamp: number;
  nonce: string;
  used: boolean;
}

const tokenRegistry = new Map<string, TokenEntry>();

// Limpar tokens expirados a cada 1 minuto
setInterval(() => {
  const now = Date.now();
  const fiveMinutes = 5 * 60 * 1000;
  
  for (const [hash, entry] of tokenRegistry.entries()) {
    if (now - entry.timestamp > fiveMinutes || entry.used) {
      tokenRegistry.delete(hash);
    }
  }
}, 60 * 1000);

export function registerToken(
  hash: string,
  sessionId: string,
  timestamp: number,
  nonce: string
): void {
  tokenRegistry.set(hash, {
    hash,
    sessionId,
    timestamp,
    nonce,
    used: false
  });
}

export function validateAndConsumeToken(
  hash: string,
  sessionId: string,
  nonce: string
): boolean {
  const entry = tokenRegistry.get(hash);
  
  if (!entry) {
    console.warn('Token Registry: Token não encontrado no registro');
    return false;
  }

  if (entry.used) {
    console.warn('Token Registry: Token já foi usado (replay attack detectado)');
    tokenRegistry.delete(hash);
    return false;
  }

  if (entry.sessionId !== sessionId) {
    console.warn('Token Registry: SessionId não corresponde');
    return false;
  }

  if (entry.nonce !== nonce) {
    console.warn('Token Registry: Nonce não corresponde');
    return false;
  }

  // Marcar como usado e remover
  entry.used = true;
  tokenRegistry.delete(hash);
  
  console.log('Token Registry: ✅ Token validado e consumido');
  return true;
}

export function getRegistryStats() {
  return {
    totalTokens: tokenRegistry.size,
    tokens: Array.from(tokenRegistry.values())
  };
}

