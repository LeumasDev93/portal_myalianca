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
    
    // Validação de comprimento
    if (merchantRef.length > 15 || merchantSession.length > 15) {
      throw new Error("Referência do recibo excede limite permitido");
    }

    // PASSO 1: Obter token de acesso (sempre novo para evitar expiração)
    const accessToken = await getPaymentAccessToken();
    try {
      // Compartilha o token com o servidor para uso no callback (curta duração)
      const isSecure = typeof window !== 'undefined' && window.location.protocol === 'https:';
      document.cookie = `pay_token=${accessToken}; Path=/; Max-Age=600; ${isSecure ? 'SameSite=None; Secure' : 'SameSite=Lax'}`;
    } catch {}

    // PASSO 2: Criar intenção de pagamento com o token
    // Arredonda o valor para cima se tiver decimais
    const roundedAmount = roundAmountUp(amount);
    const paymentData: PaymentIntentRequest = {
      name: userName,
      amount: roundedAmount,
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

    // PASSO 3: Gerar URL do checkout
    const checkoutUrl = getCheckoutUrl(paymentIntent.reference, paymentIntent.sessionId);
    
    return {
      checkoutUrl,
      reference: paymentIntent.reference,
      sessionId: paymentIntent.sessionId
    };
  } catch (error) {
    throw error;
  }
}

/**
 * Arredonda o valor para cima se tiver decimais (não pode conter valor após a vírgula)
 */
function roundAmountUp(amount: number): number {
  // Se o valor tem decimais (parte decimal > 0), arredonda para cima
  if (amount % 1 !== 0) {
    return Math.ceil(amount);
  }
  return amount;
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
    
    // Verifica se é HTML (sempre priorizar HTML se começar com <!DOCTYPE ou <html)
    const isHTML = responseText.trim().startsWith('<!DOCTYPE') || responseText.trim().startsWith('<html');
    
    if (isHTML) {
      // É HTML - retorna diretamente (mesmo se status não for 200, pode ser HTML de erro)
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
        errorMessage = errorData.message || errorData.error || errorData.detail || `Erro ${response.status}: Erro ao criar pagamento`;
      } catch {
        // Se não conseguir parsear como JSON, usa o texto da resposta ou status
        errorMessage = responseText && responseText.trim() 
          ? responseText.substring(0, 200) 
          : `Erro ${response.status}: Erro ao criar pagamento`;
      }
      const error = new Error(errorMessage) as PaymentError;
      error.status = response.status;
      throw error;
    }
    
    // Resposta OK e não é HTML - tenta JSON
    try {
      const responseData = JSON.parse(responseText);
      return {
        html: responseData.html || "",
        channelTransactionId: responseData.channelTransactionId || data.channelTransactionId,
      };
    } catch {
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
    const token = await getPaymentAccessToken();
    
    // Compartilha o token com o servidor para uso no callback
    try {
      const isSecure = typeof window !== 'undefined' && window.location.protocol === 'https:';
      document.cookie = `pay_token=${token}; Path=/; Max-Age=600; ${isSecure ? 'SameSite=None; Secure' : 'SameSite=Lax'}`;
    } catch {}
    
    // PASSO 2: Gerar channelTransactionId (máximo 15 caracteres)
    const channelTransactionId = generateChannelTransactionId();
    
    // PASSO 3: Criar pagamento
    // Arredonda o valor para cima se tiver decimais
    const roundedAmount = roundAmountUp(amount);
    const purchaseData: PurchaseRequest = {
      amount: roundedAmount,
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
    
    const purchaseResponse = await createPurchase(token, purchaseData);
    
    if (purchaseResponse.html) {
      return {
        html: purchaseResponse.html,
        channelTransactionId: purchaseResponse.channelTransactionId,
      };
    } else {
      throw new Error("Resposta do pagamento não contém HTML");
    }
  } catch (error) {
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
    // Arredonda o valor para cima se tiver decimais
    const roundedAmount = roundAmountUp(amount);
    const paymentData: PaymentIntentRequest = {
      name: userName,
      amount: roundedAmount,
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

