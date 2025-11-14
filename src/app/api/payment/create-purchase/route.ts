import { NextRequest, NextResponse } from "next/server";

const PAYMENT_BASE_URL = "https://pay.dev.aliancaseguros.cv";
const CLIENT_ID = "ju3Rt5EEDc2yQNxOsgJVBZrOszZx-aRB";

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

export async function POST(req: NextRequest) {
  try {
    const purchaseData: PurchaseRequest = await req.json();
    
    console.log("[PURCHASE API] ========== CREATE PURCHASE ==========");
    console.log("[PURCHASE API] URL:", `${PAYMENT_BASE_URL}/gtw/purchase`);
    console.log("[PURCHASE API] Data:", { ...purchaseData, token: purchaseData.token ? `${purchaseData.token.substring(0, 20)}...` : 'missing' });

    // Criar FormData (Node.js 18+ tem FormData nativo)
    const formData = new FormData();
    formData.append("amount", purchaseData.amount.toString());
    formData.append("languageMessages", purchaseData.languageMessages);
    formData.append("channelTransactionId", purchaseData.channelTransactionId);
    formData.append("provider", purchaseData.provider);
    formData.append("clientNif", purchaseData.clientNif);
    formData.append("clientName", purchaseData.clientName);
    formData.append("clientAddress", purchaseData.clientAddress);
    formData.append("email", purchaseData.email);
    formData.append("billAddrCity", purchaseData.billAddrCity);
    formData.append("billAddrCountry", purchaseData.billAddrCountry);
    formData.append("billAddrLine1", purchaseData.billAddrLine1);
    formData.append("billAddrPostCode", purchaseData.billAddrPostCode);
    formData.append("phoneCode", purchaseData.phoneCode);
    formData.append("phoneNumber", purchaseData.phoneNumber);
    formData.append("orderReference", purchaseData.orderReference);
    formData.append("token", purchaseData.token);
    formData.append("clientId", purchaseData.clientId);

    // Log dos dados do FormData (para debug)
    console.log("[PURCHASE API] FormData criado com os seguintes campos:");
    for (const [key, value] of formData.entries()) {
      if (key === 'token' || key === 'clientId') {
        console.log(`  ${key}: ${String(value).substring(0, 20)}...`);
      } else {
        console.log(`  ${key}: ${value}`);
      }
    }

    // Enviar requisição com FormData
    // No Node.js, quando usamos FormData, o fetch automaticamente define
    // o Content-Type como multipart/form-data com o boundary correto
    console.log("[PURCHASE API] Enviando requisição para gateway externo...");
    console.log("[PURCHASE API] URL:", `${PAYMENT_BASE_URL}/gtw/purchase`);
    console.log("[PURCHASE API] Método: POST");
    console.log("[PURCHASE API] Body type: FormData");
    
    const response = await fetch(`${PAYMENT_BASE_URL}/gtw/purchase`, {
      method: "POST",
      body: formData,
      // NÃO definir Content-Type manualmente - o fetch do Node.js define automaticamente
      // como multipart/form-data com o boundary correto quando FormData é usado
    });

    // Log do Content-Type que foi enviado
    console.log("[PURCHASE API] ✅ Requisição enviada para gateway externo");
    console.log("[PURCHASE API] Content-Type enviado: multipart/form-data (definido automaticamente pelo fetch)");

    console.log("[PURCHASE API] Status da resposta:", response.status);
    console.log("[PURCHASE API] Headers da resposta:", Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      let errorMessage = "Erro ao criar pagamento";
      let errorDetails = "";
      
      try {
        const contentType = response.headers.get("content-type");
        if (contentType?.includes("application/json")) {
          const errorJson = await response.json();
          errorMessage = errorJson.message || errorJson.error || errorJson.detail || errorMessage;
          errorDetails = JSON.stringify(errorJson, null, 2);
        } else {
          errorDetails = await response.text();
        }
      } catch {
        errorMessage = "Erro ao processar resposta do servidor de pagamento";
      }
      
      console.error("[PURCHASE API] ❌ Erro:", errorMessage);
      console.error("[PURCHASE API] ❌ Detalhes:", errorDetails);
      
      return NextResponse.json(
        { 
          message: errorMessage,
          error: errorMessage,
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
      
      console.log("[PURCHASE API] ✅ HTML recebido do SISP");
      console.log("[PURCHASE API] Retornando HTML diretamente (text/html)");
      
      // Retorna o HTML diretamente como text/html (não JSON)
      return new NextResponse(htmlText, {
        status: 200,
        headers: {
          'Content-Type': 'text/html; charset=utf-8',
        },
      });
    } else {
      // Resposta JSON normal
      const responseData = await response.json();
      console.log("[PURCHASE API] ✅ Resposta JSON recebida");
      return NextResponse.json({
        ...responseData,
        type: "json",
        channelTransactionId: purchaseData.channelTransactionId,
      });
    }
  } catch (error) {
    console.error("[PURCHASE API] ❌ Exceção:", error);
    const errorMessage = error instanceof Error ? error.message : "Erro interno ao processar pagamento";
    return NextResponse.json(
      { 
        message: errorMessage,
        error: errorMessage,
      },
      { status: 500 }
    );
  }
}

