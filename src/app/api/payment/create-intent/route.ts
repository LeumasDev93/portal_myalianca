import { NextRequest, NextResponse } from "next/server";

const PAYMENT_BASE_URL = "https://pay.dev.aliancaseguros.cv";
const CLIENT_ID = "4224339E02544A5EA6D1B6C6D9443CCA";

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

export async function POST(req: NextRequest) {
  try {
    
    // Pega token do header Authorization
    const authHeader = req.headers.get("Authorization");
    console.log("[PAYMENT API] Auth header recebido:", authHeader ? "SIM" : "NÃO");
    
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      console.error("[PAYMENT API] ❌ Token não fornecido ou inválido");
      return NextResponse.json(
        { error: "Token de autorização não fornecido" },
        { status: 401 }
      );
    }

    const accessToken = authHeader.replace("Bearer ", "");
    
    const paymentData: PaymentIntentRequest = await req.json();
    

    const requestBody = JSON.stringify(paymentData);

    const response = await fetch(
      `${PAYMENT_BASE_URL}/api/v1/pagamentos/intencao/compras`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Client-Id": CLIENT_ID, // Header adicional necessário
          Authorization: `Bearer ${accessToken}`, // Bearer token
        },
        body: requestBody,
      }
    );

    if (!response.ok) {
      let errorMessage = "Erro ao processar pagamento";
      let errorDetails = "";
      
      try {
        const contentType = response.headers.get("content-type");
        if (contentType?.includes("application/json")) {
          const errorJson = await response.json();
          console.error("[PAYMENT API] Erro JSON da API externa:", errorJson);
          
          // Extrai mensagem amigável do erro
          errorMessage = errorJson.message || errorJson.error || errorJson.detail || errorMessage;
          errorDetails = JSON.stringify(errorJson, null, 2);
        } else {
          errorDetails = await response.text();
       
          // Se for HTML, tenta extrair a mensagem de erro
          if (errorDetails.includes('<!DOCTYPE html>') || errorDetails.includes('<html')) {
            // Tenta extrair texto do elemento .error-message ou .error-title
            const messageMatch = errorDetails.match(/<p class="error-message">([^<]+)<\/p>/);
            const titleMatch = errorDetails.match(/<h1 class="error-title">([^<]+)<\/h1>/);
            
            if (messageMatch && messageMatch[1]) {
              errorMessage = messageMatch[1].trim();
            } else if (titleMatch && titleMatch[1]) {
              errorMessage = titleMatch[1].trim();
            } else {
              // Mapeia códigos de erro HTTP para mensagens amigáveis
              if (response.status === 500) {
                errorMessage = "Servidor de pagamento temporariamente indisponível";
              } else if (response.status === 401) {
                errorMessage = "Sessão de pagamento expirou. Tente novamente";
              } else if (response.status === 400) {
                errorMessage = "Dados de pagamento inválidos";
              } else {
                errorMessage = `Erro no servidor de pagamento (${response.status})`;
              }
            }
          }
        }
      } catch (e) {
        errorMessage = "Erro ao processar resposta do servidor de pagamento";
      }
      
      
      return NextResponse.json(
        { 
          message: errorMessage,
          error: errorMessage, // Mantém para compatibilidade
          status: response.status,
        },
        { status: response.status }
      );
    }

    // Verifica o tipo de conteúdo da resposta
    const contentType = response.headers.get("content-type");

    if (contentType?.includes("text/html")) {
      // A API retornou HTML (página de checkout do SISP)
      const htmlText = await response.text();
      
      // Extrai informações do HTML
      const merchantRefMatch = htmlText.match(/name="merchantRef"\s+value="([^"]+)"/);
      const merchantSessionMatch = htmlText.match(/name="merchantSession"\s+value="([^"]+)"/);
      const amountMatch = htmlText.match(/name="amount"\s+value="([^"]+)"/);
      const timestampMatch = htmlText.match(/name="timestamp"\s+value="([^"]+)"/);
      
      // Extrai UUID da URL de retorno (formato: /retorno/{uuid}?...sessionId={uuid})
      const urlResponseMatch = htmlText.match(/name="urlMerchantResponse"\s+value="([^"]+)"/);
      const urlResponse = urlResponseMatch ? urlResponseMatch[1] : "";
      
      // Extrai checkoutUuid (UUID principal) e sessionId (UUID de sessão) da URL
      const checkoutUuidMatch = urlResponse.match(/\/retorno\/([a-f0-9-]{36})/);
      const sessionIdMatch = urlResponse.match(/[\?&]sessionId=([a-f0-9-]{36})/i) || 
                             urlResponse.match(/[\?&]fingerPrintCode=([^&"]+)/);
      
      const checkoutUuid = checkoutUuidMatch ? checkoutUuidMatch[1] : "";
      const sessionIdUuid = sessionIdMatch ? decodeURIComponent(sessionIdMatch[1]) : "";
      
      const merchantRef = merchantRefMatch ? merchantRefMatch[1] : "";
      const merchantSession = merchantSessionMatch ? merchantSessionMatch[1] : "";
      const amount = amountMatch ? parseFloat(amountMatch[1]) : paymentData.amount;
      const timestamp = timestampMatch ? timestampMatch[1] : new Date().toISOString();

      // Retorna resposta padronizada
      const responseData = {
        amount: amount,
        currency: paymentData.currency,
        reference: checkoutUuid || merchantRef, // UUID do checkout ou merchantRef como fallback
        status: "PENDENTE",
        createdAt: timestamp,
        sessionId: sessionIdUuid || merchantSession, // UUID de sessão ou merchantSession como fallback
        merchantRef: merchantRef, // Mantém o merchantRef original (com número do recibo)
        merchantSession: merchantSession, // Mantém merchantSession original
        checkoutUuid: checkoutUuid, // UUID do checkout
        htmlCheckout: htmlText, // Inclui HTML completo caso seja necessário
      };

      
      return NextResponse.json(responseData);
    } else {
      // Resposta JSON normal
      const responseData = await response.json();
     
      return NextResponse.json(responseData);
    }
  } catch (error) {
    console.error("[PAYMENT API] ❌ Exceção ao processar pagamento:", error);
    const errorMessage = error instanceof Error ? error.message : "Erro interno ao processar pagamento";
    return NextResponse.json(
      { 
        message: errorMessage,
        error: errorMessage, // Mantém para compatibilidade
      },
      { status: 500 }
    );
  }
}

