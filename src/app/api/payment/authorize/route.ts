import { NextResponse } from "next/server";

const PAYMENT_BASE_URL = "https://pay.dev.aliancaseguros.cv";

// Credenciais estáticas
const PAYMENT_CREDENTIALS = {
  clientId: "4224339E02544A5EA6D1B6C6D9443CCA",
  clientSecret: "eM5fGfyOQzYkGiABMmtzhrrniAY6X7toIk7Fmiqt32c"
};

export async function POST() {
  try {
    console.log("[PAYMENT API] ========== AUTHORIZE ==========");
    console.log("[PAYMENT API] URL:", `${PAYMENT_BASE_URL}/api/v1/authorize`);
    console.log("[PAYMENT API] Credentials:", PAYMENT_CREDENTIALS);
    
    const response = await fetch(`${PAYMENT_BASE_URL}/api/v1/authorize`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(PAYMENT_CREDENTIALS),
    });

    console.log("[PAYMENT API] Status da resposta:", response.status);

    if (!response.ok) {
      let errorMessage = "Erro ao obter autorização de pagamento";
      try {
        const contentType = response.headers.get("content-type");
        if (contentType?.includes("application/json")) {
          const errorJson = await response.json();
          console.error("[PAYMENT API] ❌ Erro JSON na autorização:", errorJson);
          errorMessage = errorJson.message || errorJson.error || errorMessage;
        } else {
          const errorText = await response.text();
          console.error("[PAYMENT API] ❌ Erro texto na autorização:", errorText);
        }
      } catch (e) {
        console.error("[PAYMENT API] Erro ao processar resposta de erro:", e);
      }
      
      return NextResponse.json(
        { 
          message: errorMessage,
          error: errorMessage, // Mantém para compatibilidade
          status: response.status
        },
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log("[PAYMENT API] Resposta completa:", data);

    if (data.error) {
      console.error("[PAYMENT API] ❌ Erro retornado pela API:", data.error);
      const errorMessage = typeof data.error === 'string' ? data.error : "Erro ao obter token de pagamento";
      return NextResponse.json({ 
        message: errorMessage,
        error: errorMessage 
      }, { status: 400 });
    }

    console.log("[PAYMENT API] ✅ Token gerado com sucesso");
    console.log("[PAYMENT API] accessToken:", data.accessToken);
    const res = NextResponse.json({ accessToken: data.accessToken });
    // Define cookie curto para reuso server-side (validação HMAC)
    res.cookies.set('pay_token', data.accessToken, {
      path: '/',
      maxAge: 600,
      sameSite: 'none',
      secure: true,
    });
    return res;
  } catch (error) {
    console.error("[PAYMENT API] ❌ Exceção na autorização:", error);
    const errorMessage = error instanceof Error ? error.message : "Erro interno ao obter token de pagamento";
    return NextResponse.json(
      { 
        message: errorMessage,
        error: errorMessage, // Mantém para compatibilidade
      },
      { status: 500 }
    );
  }
}

