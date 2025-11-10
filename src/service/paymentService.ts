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
 * Abre página de checkout em um modal
 */
export function openCheckout(reference: string, sessionId: string): void {
  const checkoutUrl = getCheckoutUrl(reference, sessionId);
  
  // Criar modal overlay
  const modalOverlay = document.createElement('div');
  modalOverlay.id = 'checkout-modal';
  modalOverlay.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.7);
    z-index: 9999;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 20px;
  `;

  // Criar container do modal
  const modalContainer = document.createElement('div');
  modalContainer.style.cssText = `
    position: relative;
    width: 100%;
    max-width: 600px;
    height: 60vh;
    background: white;
    border-radius: 12px;
    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
    display: flex;
    flex-direction: column;
  `;

  // Criar header do modal com botão fechar
  const modalHeader = document.createElement('div');
  modalHeader.style.cssText = `
    padding: 16px 24px;
    border-bottom: 1px solid #e5e7eb;
    display: flex;
    justify-content: space-between;
    align-items: center;
    background: #f9fafb;
    border-radius: 12px 12px 0 0;
  `;

  const modalTitle = document.createElement('h2');
  modalTitle.textContent = 'Checkout - Pagamento';
  modalTitle.style.cssText = `
    font-size: 18px;
    font-weight: 600;
    color: #1f2937;
    margin: 0;
  `;

  const closeButton = document.createElement('button');
  closeButton.innerHTML = '✕';
  closeButton.style.cssText = `
    background: none;
    border: none;
    font-size: 24px;
    color: #6b7280;
    cursor: pointer;
    padding: 4px 8px;
    line-height: 1;
    transition: color 0.2s;
  `;
  closeButton.onmouseover = () => closeButton.style.color = '#1f2937';
  closeButton.onmouseout = () => closeButton.style.color = '#6b7280';

  modalHeader.appendChild(modalTitle);
  modalHeader.appendChild(closeButton);

  // Criar iframe
  const iframe = document.createElement('iframe');
  iframe.src = checkoutUrl;
  iframe.style.cssText = `
    width: 100%;
    height: 100%;
    border: none;
    border-radius: 0 0 12px 12px;
  `;

  // Montar modal
  modalContainer.appendChild(modalHeader);
  modalContainer.appendChild(iframe);
  modalOverlay.appendChild(modalContainer);
  document.body.appendChild(modalOverlay);

  // Variável para o intervalo de checagem
  let urlCheckInterval: NodeJS.Timeout;

  // Função para mostrar resultado
  const showResult = (success: boolean, message: string) => {
    if (urlCheckInterval) clearInterval(urlCheckInterval);
    iframe.style.display = 'none';
    
    const resultDiv = document.createElement('div');
    resultDiv.style.cssText = `
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 100%;
      padding: 40px;
      text-align: center;
    `;

    if (success) {
      resultDiv.innerHTML = `
        <div style="background: #10b981; border-radius: 50%; width: 80px; height: 80px; display: flex; align-items: center; justify-content: center; margin-bottom: 24px;">
          <svg style="width: 48px; height: 48px; color: white;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
          </svg>
        </div>
        <h3 style="font-size: 24px; font-weight: 700; color: #047857; margin: 0 0 12px 0;">Pagamento Realizado com Sucesso!</h3>
        <p style="color: #6b7280; font-size: 16px; margin: 0 0 32px 0;">${message}</p>
        <button id="close-btn" style="background: #10b981; color: white; padding: 12px 32px; border: none; border-radius: 8px; font-weight: 600; cursor: pointer; font-size: 16px;">
          Fechar
        </button>
      `;
    } else {
      resultDiv.innerHTML = `
        <div style="background: #ef4444; border-radius: 50%; width: 80px; height: 80px; display: flex; align-items: center; justify-content: center; margin-bottom: 24px;">
          <svg style="width: 48px; height: 48px; color: white;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </div>
        <h3 style="font-size: 24px; font-weight: 700; color: #dc2626; margin: 0 0 12px 0;">Erro no Pagamento</h3>
        <p style="color: #6b7280; font-size: 16px; margin: 0 0 32px 0;">${message}</p>
        <button id="close-btn" style="background: #ef4444; color: white; padding: 12px 32px; border: none; border-radius: 8px; font-weight: 600; cursor: pointer; font-size: 16px;">
          Fechar
        </button>
      `;
    }

    modalContainer.appendChild(resultDiv);

    const closeBtn = resultDiv.querySelector('#close-btn');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        document.body.removeChild(modalOverlay);
        window.location.reload();
      });
    }
  };

  // Monitorar mudanças de URL no iframe para detectar callback
  let lastCheckedUrl = '';
  urlCheckInterval = setInterval(() => {
    try {
      // Tentar acessar a URL do iframe (vai funcionar após o callback retornar)
      const currentUrl = iframe.contentWindow?.location.href || '';
      
      if (currentUrl && currentUrl !== lastCheckedUrl) {
        lastCheckedUrl = currentUrl;
        
        // Verificar se é a página de callback
        if (currentUrl.includes('/backoffice') && currentUrl.includes('server_status')) {
          clearInterval(urlCheckInterval);
          
          const url = new URL(currentUrl);
          const serverStatus = url.searchParams.get('server_status');
          const collectStatus = url.searchParams.get('collect_status');
          const serverMessage = url.searchParams.get('server_message') || '';
          const collectMessage = url.searchParams.get('collect_message') || '';
          
          const isSuccess = serverStatus === 'ok' && collectStatus === 'ok';
          const message = isSuccess 
            ? 'Pagamento processado e confirmado com sucesso.' 
            : (serverMessage || collectMessage || 'Erro ao processar pagamento.');
          
          showResult(isSuccess, message);
        }
      }
    } catch (e) {
      // Erro de CORS quando iframe está em domínio externo - ignorar
    }
  }, 500);

  // Listener para mensagens do iframe (fallback via postMessage)
  const handleMessage = (event: MessageEvent) => {
    if (event.data?.type === 'payment-result') {
      clearInterval(urlCheckInterval);
      const { success, message } = event.data;
      showResult(success, message);
      window.removeEventListener('message', handleMessage);
    }
  };
  window.addEventListener('message', handleMessage);

  // Fechar ao clicar fora
  modalOverlay.addEventListener('click', (e) => {
    if (e.target === modalOverlay) {
      clearInterval(urlCheckInterval);
      document.body.removeChild(modalOverlay);
      window.removeEventListener('message', handleMessage);
    }
  });

  // Fechar com ESC
  const handleEsc = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      if (document.getElementById('checkout-modal')) {
        clearInterval(urlCheckInterval);
        document.body.removeChild(modalOverlay);
        window.removeEventListener('message', handleMessage);
      }
      document.removeEventListener('keydown', handleEsc);
    }
  };
  document.addEventListener('keydown', handleEsc);
  
  // Configurar fechamento pelo botão X
  closeButton.onclick = () => {
    clearInterval(urlCheckInterval);
    window.removeEventListener('message', handleMessage);
    document.removeEventListener('keydown', handleEsc);
    document.body.removeChild(modalOverlay);
  };
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
 * Fluxo completo de pagamento (método antigo - abre nova aba)
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

