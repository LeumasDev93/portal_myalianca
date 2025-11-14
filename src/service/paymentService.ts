interface PaymentError extends Error {
  status?: number;
}

/**
 * Obtém token de acesso para o gateway de pagamento (via API route)
 */
export async function getPaymentAccessToken(): Promise<string> {
  try {
    const response = await fetch("/api/payment/authorize", {
      method: "POST",
    });

    if (!response.ok) {
      let errorMessage = "Erro ao obter autorização de pagamento";
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorData.error || errorMessage;
      } catch {
      }
      throw new Error(errorMessage);
    }

    const data = await response.json();

    if (data.error) {
      throw new Error(data.error);
    }

    if (!data.accessToken) {
      throw new Error("Token de acesso não foi retornado");
    }

    return data.accessToken;
  } catch (error) {
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
  orderReference?: string;
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
      // Tenta pegar detalhes do erro
      let errorMessage = "";
      try {
        const errorData = await response.json();
        // Extrai mensagem de erro amigável
        errorMessage = errorData.message || errorData.error || errorData.detail || "Erro ao processar pagamento";
      } catch {
        errorMessage = "Erro ao processar pagamento";
      }
      const error = new Error(errorMessage) as PaymentError;
      error.status = response.status;
      throw error;
    }

    const responseData: PaymentIntentResponse = await response.json();
    return responseData;
  } catch (error) {
    throw error;
  }
}

/**
 * Gera URL de checkout
 */
export function getCheckoutUrl(reference: string, sessionId: string): string {
  const checkoutUrl = `https://pay.dev.aliancaseguros.cv/pagamento/checkout/${reference}?sessionId=${sessionId}`;
  
  return checkoutUrl;
}

/**
 * Abre página de checkout na mesma aba
 */
export function openCheckout(reference: string, sessionId: string): void {
  const checkoutUrl = getCheckoutUrl(reference, sessionId);
  window.location.assign(checkoutUrl);
}

/**
 * Fluxo completo de pagamento que retorna URL do checkout
 */
export async function processPaymentForModal(
  amount: number,
  userName: string,
  userEmail: string,
  userPhone: string,
  reciboNumber: string, // Número do recibo (para referência)
  orderReference?: string // Referência do recibo (ex: P2025.458)
): Promise<{ checkoutUrl: string; reference: string; sessionId: string }> {
  try {
    // Usa o número do recibo como merchantRef (máx. 15 chars)
    const sanitizedInvoice = reciboNumber.replace(/[^a-zA-Z0-9\.\-]/g, "");
    const merchantRef = sanitizedInvoice.substring(0, 15);
    // Gera merchantSession único com máximo 15 caracteres
    const timestamp = Date.now();
    const timestampStr = timestamp.toString().slice(-8);
    const randomStr = Math.random().toString(36).substring(2, 8).toUpperCase();
    const merchantSession = `S${timestampStr}${randomStr}`.substring(0, 15);
    
    console.log("[PAYMENT] MerchantRef gerado:", merchantRef, `(${merchantRef.length} chars)`);
    console.log("[PAYMENT] MerchantSession gerado:", merchantSession, `(${merchantSession.length} chars)`);
    console.log("[PAYMENT] Recibo original (para referência):", reciboNumber);
    console.log("[PAYMENT] merchantRef (mapeado para recibo):", merchantRef);
    
    // Validação de comprimento
    if (merchantRef.length > 15 || merchantSession.length > 15) {
      console.error("[PAYMENT] ⚠️ ERRO: merchantRef ou merchantSession excede 15 caracteres!");
      throw new Error("Referência do recibo excede limite permitido");
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
      ...(orderReference && { orderReference }), // Referência do recibo se fornecida
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
    console.log("[PAYMENT] Recibo original:", reciboNumber);
    
    const checkoutUrl = getCheckoutUrl(paymentIntent.reference, paymentIntent.sessionId);
    console.log("[PAYMENT] ✅ URL do checkout gerada com sucesso!");
    
    return {
      checkoutUrl,
      reference: paymentIntent.reference,
      sessionId: paymentIntent.sessionId
    };
  } catch (error) {
    console.error("[PAYMENT] ❌ Erro no processamento de pagamento:", error);
    throw error;
  }
}

/**
 * Gera channelTransactionId único com máximo 15 caracteres
 */
function generateChannelTransactionId(): string {
  const timestamp = Date.now();
  const timestampStr = timestamp.toString().slice(-8); // Últimos 8 dígitos
  const randomStr = Math.random().toString(36).substring(2, 7).toUpperCase(); // 5 caracteres aleatórios
  
  // Formato: T + 8 dígitos + 5 caracteres = 14 caracteres (dentro do limite de 15)
  const channelTransactionId = `T${timestampStr}${randomStr}`.substring(0, 15);
  
  if (channelTransactionId.length > 15) {
    throw new Error("channelTransactionId excede limite de 15 caracteres");
  }
  
  return channelTransactionId;
}

interface PurchaseRequest {
  amount: number;
  languageMessages: string;
  channelTransactionId: string;
  provider: string;
  clientNif: string;
  clientName: string;
  clientAddress: string;
  email: string;
  billAddrCity: string;
  billAddrCountry: string;
  billAddrLine1: string;
  billAddrPostCode: string;
  phoneCode: string;
  phoneNumber: string;
  orderReference: string;
  token: string;
  clientId: string;
}

interface PurchaseResponse {
  html: string;
  channelTransactionId: string;
}

/**
 * Cria pagamento usando nova API /gtw/purchase (via API route)
 */
async function createPurchase(
  token: string,
  data: PurchaseRequest
): Promise<PurchaseResponse> {
  try {
    const response = await fetch("/api/payment/create-purchase", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    // Lê o body como texto primeiro (SEMPRE como texto, nunca como JSON)
    const responseText = await response.text();
    console.log("[PAYMENT SISP] Resposta recebida - Status:", response.status);
    console.log("[PAYMENT SISP] Resposta recebida - Primeiros 200 chars:", responseText.substring(0, 200));
    
    // Verifica se é HTML (sempre priorizar HTML se começar com <!DOCTYPE ou <html)
    const isHTML = responseText.trim().startsWith('<!DOCTYPE') || responseText.trim().startsWith('<html');
    
    if (isHTML) {
      // É HTML - retorna diretamente (mesmo se status não for 200, pode ser HTML de erro)
      console.log("[PAYMENT SISP] ✅ HTML detectado na resposta");
      console.log("[PAYMENT SISP] HTML length:", responseText.length);
      
      if (!response.ok) {
        console.warn("[PAYMENT SISP] ⚠️ Status não é 200, mas é HTML - retornando mesmo assim");
      }
      
      return {
        html: responseText,
        channelTransactionId: data.channelTransactionId,
      };
    }
    
    // Não é HTML - trata como erro ou JSON
    if (!response.ok) {
      let errorMessage = "";
      try {
        // Tenta parsear como JSON para pegar mensagem de erro
        const errorData = JSON.parse(responseText);
        errorMessage = errorData.message || errorData.error || errorData.detail || "Erro ao processar pagamento";
      } catch {
        errorMessage = responseText || `Erro ${response.status}: Erro ao processar pagamento`;
      }
      const error = new Error(errorMessage) as PaymentError;
      error.status = response.status;
      throw error;
    }
    
    // Resposta OK e não é HTML - tenta JSON
    console.log("[PAYMENT SISP] Tentando parsear como JSON...");
    try {
      const responseData = JSON.parse(responseText);
      return {
        html: responseData.html || "",
        channelTransactionId: responseData.channelTransactionId || data.channelTransactionId,
      };
    } catch (parseError) {
      console.error("[PAYMENT SISP] ❌ Erro ao parsear JSON:", parseError);
      throw new Error("Resposta não é HTML nem JSON válido");
    }
  } catch (error) {
    throw error;
  }
}

/**
 * Novo fluxo de pagamento SISP - retorna HTML para exibir em modal
 */
export async function processPaymentSISP(
  amount: number,
  userName: string,
  userEmail: string,
  userPhone: string,
  userNif: string,
  reciboNumber: string,
  orderReference?: string
): Promise<{ html: string; channelTransactionId: string }> {
  try {
    const CLIENT_ID = "ju3Rt5EEDc2yQNxOsgJVBZrOszZx-aRB";
    
    // PASSO 1: Gerar token
    console.log("[PAYMENT SISP] PASSO 1: Gerando token...");
    const token = await getPaymentAccessToken();
    console.log("[PAYMENT SISP] ✅ Token gerado com sucesso");
    
    // Compartilha o token com o servidor para uso no callback
    try {
      const isSecure = typeof window !== 'undefined' && window.location.protocol === 'https:';
      document.cookie = `pay_token=${token}; Path=/; Max-Age=600; ${isSecure ? 'SameSite=None; Secure' : 'SameSite=Lax'}`;
    } catch {}
    
    // PASSO 2: Gerar channelTransactionId (máximo 15 caracteres)
    console.log("[PAYMENT SISP] PASSO 2: Gerando channelTransactionId...");
    const channelTransactionId = generateChannelTransactionId();
    console.log("[PAYMENT SISP] channelTransactionId gerado:", channelTransactionId, `(${channelTransactionId.length} chars)`);
    
    // PASSO 3: Criar pagamento
    console.log("[PAYMENT SISP] PASSO 3: Criando pagamento...");
    const purchaseData: PurchaseRequest = {
      amount: amount,
      languageMessages: "pt",
      channelTransactionId: channelTransactionId,
      provider: "SISP",
      clientNif: userNif.replace(/[^0-9]/g, ""), // Remove formatação do NIF
      clientName: userName,
      clientAddress: "Teste",
      email: userEmail,
      billAddrCity: "Praia",
      billAddrCountry: "608",
      billAddrLine1: "Rua Principal, 123",
      billAddrPostCode: "7600",
      phoneCode: "238",
      phoneNumber: userPhone.replace(/[^0-9]/g, ""), // Remove formatação
      orderReference: orderReference || reciboNumber,
      token: token,
      clientId: CLIENT_ID,
    };
    
    console.log("[PAYMENT SISP] Dados que serão enviados:", {
      ...purchaseData,
      token: token ? `${token.substring(0, 20)}...` : 'missing'
    });
    
    const purchaseResponse = await createPurchase(token, purchaseData);
    console.log("[PAYMENT SISP] ✅ Pagamento criado com sucesso");
    console.log("[PAYMENT SISP] HTML recebido:", purchaseResponse.html ? `Sim (${purchaseResponse.html.length} caracteres)` : "Não");
    
    if (purchaseResponse.html) {
      console.log("[PAYMENT SISP] HTML preview:", purchaseResponse.html.substring(0, 300));
      return {
        html: purchaseResponse.html,
        channelTransactionId: purchaseResponse.channelTransactionId,
      };
    } else {
      console.error("[PAYMENT SISP] ❌ Resposta não contém HTML válido:", purchaseResponse);
      throw new Error("Resposta do pagamento não contém HTML");
    }
  } catch (error) {
    console.error("[PAYMENT SISP] ❌ Erro no processamento de pagamento:", error);
    throw error;
  }
}

/**
 * Fluxo completo de pagamento (método antigo - abre nova aba)
 * @deprecated Use processPaymentSISP para novo fluxo
 */
export async function processPayment(
  amount: number,
  userName: string,
  userEmail: string,
  userPhone: string,
  reciboNumber: string, // Número do recibo (para referência)
  orderReference?: string // Referência do recibo (ex: P2025.458)
): Promise<void> {
  try {
    // Gera merchantRef e merchantSession únicos com máximo 15 caracteres
    const timestamp = Date.now();
    const timestampStr = timestamp.toString().slice(-8); // Últimos 8 dígitos do timestamp
    const randomStr = Math.random().toString(36).substring(2, 8).toUpperCase(); // 6 caracteres aleatórios
    
    // Formato: R/S + 8 dígitos + 6 caracteres = 15 caracteres
    const merchantRef = `R${timestampStr}${randomStr}`.substring(0, 15);
    const merchantSession = `S${timestampStr}${randomStr}`.substring(0, 15);
  
    // Validação de comprimento
    if (merchantRef.length > 15 || merchantSession.length > 15) {
      throw new Error("Referência do recibo excede limite permitido");
    }

    // PASSO 1: Obter token de acesso (sempre novo para evitar expiração)
    const accessToken = await getPaymentAccessToken();
    // PASSO 2: Criar intenção de pagamento com o token
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
      ...(orderReference && { orderReference }), // Referência do recibo se fornecida
    };
    const paymentIntent = await createPaymentIntent(accessToken, paymentData);
    
    openCheckout(paymentIntent.reference, paymentIntent.sessionId);
  } catch (error) {
    throw error;
  }
}

