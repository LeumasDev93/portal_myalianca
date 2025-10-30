/**
 * Obtém token de acesso para o gateway de pagamento (via API route)
 */
export async function getPaymentAccessToken(): Promise<string> {
  try {
    const response = await fetch("/api/payment/authorize", {
      method: "POST",
    });

    if (!response.ok) {
      throw new Error(`Erro ao obter token: ${response.status}`);
    }

    const data = await response.json();

    if (data.error) {
      throw new Error(data.error);
    }

    return data.accessToken;
  } catch (error) {
    console.error("Erro na autorização de pagamento:", error);
    throw error;
  }
}

interface PaymentIntentRequest {
  name: string;
  amount: number;
  currency: string;
  email: string;
  billAddrCity: string;
  billAddrCountry: string;
  billAddrLine1: string;
  billAddrPostCode: string;
  merchantRef: string;
  merchantSession: string;
  phoneCode: string;
  phoneNumber: string;
}

interface PaymentIntentResponse {
  amount: number;
  currency: string;
  reference: string; // UUID do checkout
  status: string;
  createdAt: string;
  sessionId: string; // UUID de sessão
  merchantRef?: string; // Referência do recibo original
  merchantSession?: string; // Sessão merchant original
  checkoutUuid?: string; // UUID do checkout (mesmo que reference)
  htmlCheckout?: string; // HTML do checkout (opcional)
}

/**
 * Cria intenção de pagamento (via API route)
 */
export async function createPaymentIntent(
  accessToken: string,
  data: PaymentIntentRequest
): Promise<PaymentIntentResponse> {
  try {
    const response = await fetch("/api/payment/create-intent", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`, // Token no header
      },
      body: JSON.stringify(data), // Dados no body (SEM token)
    });

    if (!response.ok) {
      const ct = response.headers.get("content-type") || "";
      if (ct.includes("application/json")) {
        let parsed: unknown = null;
        try { parsed = await response.json(); } catch {}
        const brief = parsed && typeof parsed === 'object' && Object.keys(parsed as Record<string, unknown>).length > 0
          ? JSON.stringify(parsed)
          : `status=${response.status}`;
        console.warn("[PAYMENT] Falha ao criar intenção:", brief);
      } else if (ct.includes("text/plain")) {
        const text = await response.text();
        console.warn("[PAYMENT] Falha (texto):", text.slice(0, 200));
      } else {
        // HTML ou desconhecido: não despejar no console
        console.warn("[PAYMENT] Falha ao criar intenção (provável HTML)", `status=${response.status}`);
      }
      throw new Error(`Erro ao criar intenção de pagamento: ${response.status}`);
    }

    const responseData: PaymentIntentResponse = await response.json();
    return responseData;
  } catch (error) {
    console.error("Erro ao criar intenção de pagamento:", error);
    throw error;
  }
}

/**
 * Gera URL de checkout
 */
export function getCheckoutUrl(reference: string, sessionId: string): string {
  const checkoutUrl = `https://pay.dev.aliancaseguros.cv/pagamento/checkout/${reference}?sessionId=${sessionId}`;
  console.log("[PAYMENT] 🌐 URL de checkout gerada:");
  console.log("[PAYMENT] Reference:", reference);
  console.log("[PAYMENT] SessionId:", sessionId);
  console.log("[PAYMENT] URL completa:", checkoutUrl);
  
  return checkoutUrl;
}

/**
 * Abre página de checkout em nova aba (método antigo)
 */
export function openCheckout(reference: string, sessionId: string): void {
  const checkoutUrl = getCheckoutUrl(reference, sessionId);
  window.open(checkoutUrl, "_blank");
  console.log("[PAYMENT] ✅ Nova aba aberta");
}

/**
 * Fluxo completo de pagamento que retorna URL do checkout
 */
export async function processPaymentForModal(
  amount: number,
  userName: string,
  userEmail: string,
  userPhone: string,
  reciboRef: string // Referência do recibo (P...)
): Promise<{ checkoutUrl: string; reference: string; sessionId: string }> {
  
    console.log("[PAYMENT] ==================== PROCESSO DE PAGAMENTO (MODAL) ====================");
    console.log("[PAYMENT] Dados de entrada:", { amount, userName, userEmail, userPhone, reciboRef });

    // Usa a referência do recibo (P...) como merchantRef (máx. 15 chars para SISP)
    const sanitizedRef = reciboRef.replace(/[^a-zA-Z0-9\.\-]/g, "");
    const merchantRef = sanitizedRef.substring(0, 15);
    // Gera merchantSession único com máximo 15 caracteres
    const timestamp = Date.now();
    const timestampStr = timestamp.toString().slice(-8);
    const randomStr = Math.random().toString(36).substring(2, 8).toUpperCase();
    const merchantSession = `S${timestampStr}${randomStr}`.substring(0, 15);
    
    console.log("[PAYMENT] MerchantRef gerado:", merchantRef, `(${merchantRef.length} chars)`);
    console.log("[PAYMENT] MerchantSession gerado:", merchantSession, `(${merchantSession.length} chars)`);
    console.log("[PAYMENT] Recibo (referência P...):", reciboRef);
    console.log("[PAYMENT] merchantRef (mapeado para recibo):", merchantRef);
    
    // Validação de comprimento
    if (merchantRef.length > 15 || merchantSession.length > 15) {
      console.error("[PAYMENT] ⚠️ ERRO: merchantRef ou merchantSession excede 15 caracteres!");
      throw new Error("MerchantRef ou MerchantSession excede limite de 15 caracteres");
    }

    // PASSO 1: Obter token de acesso (sempre novo para evitar expiração)
    console.log("[PAYMENT] PASSO 1: Chamando API de autorização...");
    const accessToken = await getPaymentAccessToken();
    try {
      // Compartilha o token com o servidor para uso no callback (curta duração)
      const isSecure = typeof window !== 'undefined' && window.location.protocol === 'https:';
      document.cookie = `pay_token=${accessToken}; Path=/; Max-Age=600; ${isSecure ? 'SameSite=None; Secure' : 'SameSite=Lax'}`;
    } catch {}
    console.log("[PAYMENT] ✅ Token obtido com sucesso");
    console.log("[PAYMENT] Token completo:", accessToken);

    // PASSO 2: Criar intenção de pagamento com o token
    console.log("[PAYMENT] PASSO 2: Criando intenção de pagamento...");
    const paymentData: PaymentIntentRequest = {
      name: userName,
      amount: amount,
      currency: "CVE",
      email: userEmail,
      billAddrCity: "Praia",
      billAddrCountry: "608",
      billAddrLine1: "Rua Principal, 123",
      billAddrPostCode: "7600",
      merchantRef: merchantRef, // Gerado único
      merchantSession: merchantSession, // Gerado único
      phoneCode: "238",
      phoneNumber: userPhone.replace(/[^0-9]/g, ""), // Remove formatação
    };
    console.log("[PAYMENT] Dados que serão enviados:", JSON.stringify(paymentData, null, 2));
    console.log("[PAYMENT] Token que será usado:", accessToken.substring(0, 50) + "...");

    const paymentIntent = await createPaymentIntent(accessToken, paymentData);
    console.log("[PAYMENT] ✅ Intenção criada:", paymentIntent);

    // PASSO 3: Gerar URL do checkout
    console.log("[PAYMENT] PASSO 3: Gerando URL do checkout...");
    console.log("[PAYMENT] Reference (Checkout UUID):", paymentIntent.reference);
    console.log("[PAYMENT] SessionId:", paymentIntent.sessionId);
    console.log("[PAYMENT] MerchantRef (Recibo):", paymentIntent.merchantRef);
    console.log("[PAYMENT] Recibo (referência P...):", reciboRef);
    
    const checkoutUrl = getCheckoutUrl(paymentIntent.reference, paymentIntent.sessionId);
    console.log("[PAYMENT] ✅ URL do checkout gerada com sucesso!");
    
    return {
      checkoutUrl,
      reference: paymentIntent.reference,
      sessionId: paymentIntent.sessionId
    };
}

/**
 * Fluxo completo de pagamento (método antigo - abre nova aba)
 */
export async function processPayment(
  amount: number,
  userName: string,
  userEmail: string,
  userPhone: string,
  reciboRef: string // Referência do recibo (P...)
): Promise<void> {
  try {
    console.log("[PAYMENT] ==================== PROCESSO DE PAGAMENTO ====================");
    console.log("[PAYMENT] Dados de entrada:", { amount, userName, userEmail, userPhone, reciboRef });

    // Gera merchantRef e merchantSession únicos com máximo 15 caracteres
    const timestamp = Date.now();
    const timestampStr = timestamp.toString().slice(-8); // Últimos 8 dígitos do timestamp
    const randomStr = Math.random().toString(36).substring(2, 8).toUpperCase(); // 6 caracteres aleatórios
    
    // Formato: R/S + 8 dígitos + 6 caracteres = 15 caracteres
    // merchantRef deve ser a referência do recibo (P...)
    const merchantRef = reciboRef.substring(0, 15);
    const merchantSession = `S${timestampStr}${randomStr}`.substring(0, 15);
    
    console.log("[PAYMENT] MerchantRef gerado:", merchantRef, `(${merchantRef.length} chars)`);
    console.log("[PAYMENT] MerchantSession gerado:", merchantSession, `(${merchantSession.length} chars)`);
    console.log("[PAYMENT] Recibo (referência P...):", reciboRef);
    
    // Validação de comprimento
    if (merchantRef.length > 15 || merchantSession.length > 15) {
      console.error("[PAYMENT] ⚠️ ERRO: merchantRef ou merchantSession excede 15 caracteres!");
      throw new Error("MerchantRef ou MerchantSession excede limite de 15 caracteres");
    }

    // PASSO 1: Obter token de acesso (sempre novo para evitar expiração)
    console.log("[PAYMENT] PASSO 1: Chamando API de autorização...");
    const accessToken = await getPaymentAccessToken();
    console.log("[PAYMENT] ✅ Token obtido com sucesso");
    console.log("[PAYMENT] Token completo:", accessToken);

    // PASSO 2: Criar intenção de pagamento com o token
    console.log("[PAYMENT] PASSO 2: Criando intenção de pagamento...");
    const paymentData: PaymentIntentRequest = {
      name: userName,
      amount: amount,
      currency: "CVE",
      email: userEmail,
      billAddrCity: "Praia",
      billAddrCountry: "608",
      billAddrLine1: "Rua Principal, 123",
      billAddrPostCode: "7600",
      merchantRef: merchantRef, // Gerado único
      merchantSession: merchantSession, // Gerado único
      phoneCode: "238",
      phoneNumber: userPhone.replace(/[^0-9]/g, ""), // Remove formatação
    };
    console.log("[PAYMENT] Dados que serão enviados:", JSON.stringify(paymentData, null, 2));
    console.log("[PAYMENT] Token que será usado:", accessToken.substring(0, 50) + "...");

    const paymentIntent = await createPaymentIntent(accessToken, paymentData);
    console.log("[PAYMENT] ✅ Intenção criada:", paymentIntent);

    // PASSO 3: Abrir checkout com reference e sessionId
    console.log("[PAYMENT] PASSO 3: Abrindo checkout...");
    console.log("[PAYMENT] Reference (Checkout UUID):", paymentIntent.reference);
    console.log("[PAYMENT] SessionId:", paymentIntent.sessionId);
    console.log("[PAYMENT] MerchantRef (Recibo):", paymentIntent.merchantRef);
    console.log("[PAYMENT] Recibo (referência P...):", reciboRef);
    
    openCheckout(paymentIntent.reference, paymentIntent.sessionId);
    console.log("[PAYMENT] ✅ Checkout aberto com sucesso!");
  } catch (error) {
    console.error("[PAYMENT] ❌ Erro no processamento de pagamento:", error);
    throw error;
  }
}

