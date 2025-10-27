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
}

export async function POST(req: NextRequest) {
  try {
    console.log("[PAYMENT API] ========== INICIANDO CREATE INTENT ==========");
    
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
    console.log("[PAYMENT API] Token extraído:", accessToken.substring(0, 50) + "...");
    
    const paymentData: PaymentIntentRequest = await req.json();
    console.log("[PAYMENT API] Dados recebidos do cliente:", JSON.stringify(paymentData, null, 2));

    console.log("[PAYMENT API] Fazendo chamada para:", `${PAYMENT_BASE_URL}/api/v1/pagamentos/intencao/compras`);
    console.log("[PAYMENT API] Headers:", {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken.substring(0, 30)}...`,
    });
    console.log("[PAYMENT API] Body:", JSON.stringify(paymentData, null, 2));

    const requestBody = JSON.stringify(paymentData);
    console.log("[PAYMENT API] 📤 REQUEST COMPLETO:");
    console.log("[PAYMENT API] URL:", `${PAYMENT_BASE_URL}/api/v1/pagamentos/intencao/compras`);
    console.log("[PAYMENT API] Method: POST");
    console.log("[PAYMENT API] Headers:", {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${accessToken.substring(0, 30)}...`,
      "X-Client-Id": CLIENT_ID,
    });
    console.log("[PAYMENT API] Body (string):", requestBody);

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

    console.log("[PAYMENT API] 📥 RESPOSTA:");
    console.log("[PAYMENT API] Status:", response.status);
    console.log("[PAYMENT API] Status Text:", response.statusText);
    console.log("[PAYMENT API] Headers:", Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      let errorText = "";
      let errorJson = null;
      
      try {
        const contentType = response.headers.get("content-type");
        if (contentType?.includes("application/json")) {
          errorJson = await response.json();
          errorText = JSON.stringify(errorJson, null, 2);
        } else {
          errorText = await response.text();
        }
      } catch {
        errorText = "Não foi possível ler resposta de erro";
      }
      
      console.error("[PAYMENT API] ❌ Erro HTTP:", response.status);
      console.error("[PAYMENT API] ❌ Resposta completa:", errorText);
      
      return NextResponse.json(
        { 
          error: `Erro ao criar intenção de pagamento: ${response.status}`, 
          details: errorText,
          errorJson: errorJson 
        },
        { status: response.status }
      );
    }

    // Verifica o tipo de conteúdo da resposta
    const contentType = response.headers.get("content-type");
    console.log("[PAYMENT API] Content-Type:", contentType);

    if (contentType?.includes("text/html")) {
      // A API retornou HTML (página de checkout do SISP)
      const htmlText = await response.text();
      console.log("[PAYMENT API] ⚠️ Resposta em HTML detectada");
      console.log("[PAYMENT API] HTML length:", htmlText.length);
      
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

      console.log("[PAYMENT API] Dados extraídos do HTML:");
      console.log("[PAYMENT API] - merchantRef:", merchantRef);
      console.log("[PAYMENT API] - merchantSession:", merchantSession);
      console.log("[PAYMENT API] - amount:", amount);
      console.log("[PAYMENT API] - timestamp:", timestamp);
      console.log("[PAYMENT API] - checkoutUuid:", checkoutUuid);
      console.log("[PAYMENT API] - sessionIdUuid:", sessionIdUuid);
      console.log("[PAYMENT API] - urlResponse completa:", urlResponse);

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

      console.log("[PAYMENT API] ✅ Intenção criada (HTML processado)!");
      console.log("[PAYMENT API] Resposta formatada:", JSON.stringify(responseData, null, 2));

      return NextResponse.json(responseData);
    } else {
      // Resposta JSON normal
      const responseData = await response.json();
      console.log("[PAYMENT API] ✅ Intenção criada com sucesso!");
      console.log("[PAYMENT API] Resposta completa:", JSON.stringify(responseData, null, 2));

      return NextResponse.json(responseData);
    }
  } catch (error) {
    console.error("[PAYMENT API] ❌ EXCEPTION ao criar intenção:", error);
    console.error("[PAYMENT API] Stack:", error instanceof Error ? error.stack : "N/A");
    const errorMessage = error instanceof Error ? error.message : "Erro ao criar intenção de pagamento";
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}

