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
      const errorText = await response.text();
      console.error("[PAYMENT API] ❌ Erro na autorização:", response.status, errorText);
      return NextResponse.json(
        { error: `Erro ao obter token: ${response.status}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log("[PAYMENT API] Resposta completa:", data);

    if (data.error) {
      console.error("[PAYMENT API] ❌ Erro retornado pela API:", data.error);
      return NextResponse.json({ error: data.error }, { status: 400 });
    }

    console.log("[PAYMENT API] ✅ Token gerado com sucesso");
    console.log("[PAYMENT API] accessToken:", data.accessToken);
    return NextResponse.json({ accessToken: data.accessToken });
  } catch (error) {
    console.error("[PAYMENT API] Erro na autorização:", error);
    const errorMessage = error instanceof Error ? error.message : "Erro ao obter token de pagamento";
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}

