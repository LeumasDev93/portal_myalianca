import { NextRequest, NextResponse } from "next/server";

const PAYMENT_BASE_URL = "https://pay.dev.aliancaseguros.cv";

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

    // Enviar requisição com FormData
    // No Node.js, quando usamos FormData, o fetch automaticamente define
    // o Content-Type como multipart/form-data com o boundary correto quando FormData é usado
    const response = await fetch(`${PAYMENT_BASE_URL}/gtw/purchase`, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      let errorMessage = "Erro ao criar pagamento";
      
      try {
        const contentType = response.headers.get("content-type");
        if (contentType?.includes("application/json")) {
          const errorJson = await response.json();
          errorMessage = errorJson.message || errorJson.error || errorJson.detail || errorMessage;
        } else {
          await response.text();
        }
      } catch {
        errorMessage = "Erro ao processar resposta do servidor de pagamento";
      }
      
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
      return NextResponse.json({
        ...responseData,
        type: "json",
        channelTransactionId: purchaseData.channelTransactionId,
      });
    }
  } catch (error) {
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

