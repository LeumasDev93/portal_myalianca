import { NextRequest, NextResponse } from "next/server";

/**
 * Rota de proxy para capturar o callback do SISP
 * O SISP redireciona para esta rota após processar o pagamento
 * Esta rota captura os parâmetros e redireciona para a página de resultado
 */
export async function GET(request: NextRequest) {
  try {
    
    const searchParams = request.nextUrl.searchParams;
    
    // Captura todos os parâmetros da URL
    const statusCode = searchParams.get("status_code");
    const message = searchParams.get("message");
    const transactionId = searchParams.get("transaction_id");
    const channelTransactionId = searchParams.get("channel_transaction_id");
    const fingerPrint = searchParams.get("finger_print");

    // Valida se temos os parâmetros mínimos
    if (!statusCode || !transactionId) {
      // Redireciona para página de resultado com erro
      const errorUrl = new URL("/payment-result", request.url);
      errorUrl.searchParams.set("status_code", "3");
      errorUrl.searchParams.set("message", "Parâmetros de pagamento inválidos");
      return NextResponse.redirect(errorUrl, 303);
    }
    
    // Constrói a URL de redirecionamento para a página de resultado
    const resultUrl = new URL("/payment-result", request.url);
    
    // Adiciona todos os parâmetros à URL de resultado
    resultUrl.searchParams.set("status_code", statusCode);
    if (message) {
      resultUrl.searchParams.set("message", message);
    }
    resultUrl.searchParams.set("transaction_id", transactionId);
    if (channelTransactionId) {
      resultUrl.searchParams.set("channel_transaction_id", channelTransactionId);
    }
    if (fingerPrint) {
      resultUrl.searchParams.set("finger_print", fingerPrint);
    }
    
    // Redireciona para a página de resultado com todos os parâmetros
    return NextResponse.redirect(resultUrl, 303);
    
  } catch (error) {
    // Em caso de erro, redireciona para página de resultado com erro
    const errorUrl = new URL("/payment-result", request.url);
    errorUrl.searchParams.set("status_code", "3");
    errorUrl.searchParams.set("message", "Erro ao processar callback do pagamento");
    
    return NextResponse.redirect(errorUrl, 303);
  }
}

/**
 * Também suporta POST caso o SISP envie via POST
 */
export async function POST(request: NextRequest) {
  try {
    let body: Record<string, string> = {};
    const contentType = request.headers.get("content-type") || "";
    
    // Tenta parsear o body
    if (contentType.includes("application/x-www-form-urlencoded")) {
      const formData = await request.formData();
      formData.forEach((value, key) => {
        body[key] = typeof value === "string" ? value : "";
      });
    } else if (contentType.includes("application/json")) {
      body = await request.json();
    } else {
      // Tenta como query params também
      const searchParams = request.nextUrl.searchParams;
      searchParams.forEach((value, key) => {
        body[key] = value;
      });
    }
    
    // Extrai os parâmetros (pode vir com nomes diferentes)
    const statusCode = body.status_code || body.statusCode || request.nextUrl.searchParams.get("status_code");
    const message = body.message || request.nextUrl.searchParams.get("message");
    const transactionId = body.transaction_id || body.transactionId || request.nextUrl.searchParams.get("transaction_id");
    const channelTransactionId = body.channel_transaction_id || body.channelTransactionId || request.nextUrl.searchParams.get("channel_transaction_id");
    const fingerPrint = body.finger_print || body.fingerPrint || request.nextUrl.searchParams.get("finger_print");
    
    // Valida se temos os parâmetros mínimos
    if (!statusCode || !transactionId) {
      const errorUrl = new URL("/payment-result", request.url);
      errorUrl.searchParams.set("status_code", "3");
      errorUrl.searchParams.set("message", "Parâmetros de pagamento inválidos");
      return NextResponse.redirect(errorUrl, 303);
    }
    
    // Constrói a URL de redirecionamento
    const resultUrl = new URL("/payment-result", request.url);
    resultUrl.searchParams.set("status_code", String(statusCode));
    if (message) {
      resultUrl.searchParams.set("message", String(message));
    }
    resultUrl.searchParams.set("transaction_id", String(transactionId));
    if (channelTransactionId) {
      resultUrl.searchParams.set("channel_transaction_id", String(channelTransactionId));
    }
    if (fingerPrint) {
      resultUrl.searchParams.set("finger_print", String(fingerPrint));
    }
    
    return NextResponse.redirect(resultUrl, 303);
    
  } catch (error) {
    const errorUrl = new URL("/payment-result", request.url);
    errorUrl.searchParams.set("status_code", "3");
    errorUrl.searchParams.set("message", "Erro ao processar callback do pagamento");
    
    return NextResponse.redirect(errorUrl, 303);
  }
}

