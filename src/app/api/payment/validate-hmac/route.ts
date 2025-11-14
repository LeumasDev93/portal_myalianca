import { NextRequest, NextResponse } from "next/server";

const PAYMENT_BASE_URL = "https://pay.dev.aliancaseguros.cv";
const CLIENT_ID = "ju3Rt5EEDc2yQNxOsgJVBZrOszZx-aRB";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { transactionId, hmacFingerprint } = body;

    console.log("[VALIDATE HMAC] ========== INICIANDO VALIDAÇÃO HMAC ==========");
    console.log("[VALIDATE HMAC] transactionId:", transactionId);
    console.log("[VALIDATE HMAC] hmacFingerprint:", hmacFingerprint ? hmacFingerprint.substring(0, 30) + '...' : 'N/A');

    if (!transactionId || !hmacFingerprint) {
      console.error("[VALIDATE HMAC] ❌ Parâmetros obrigatórios faltando");
      return NextResponse.json(
        { error: "transactionId e hmacFingerprint são obrigatórios" },
        { status: 400 }
      );
    }

    const payload = {
      transactionId,
      hmacFingerprint,
    };

    console.log("[VALIDATE HMAC] Enviando para:", `${PAYMENT_BASE_URL}/api/transactions/validate-hmac`);
    console.log("[VALIDATE HMAC] Payload:", { transactionId, hmacFingerprint: hmacFingerprint.substring(0, 30) + '...' });

    const response = await fetch(`${PAYMENT_BASE_URL}/api/transactions/validate-hmac`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Client-Id": CLIENT_ID,
      },
      body: JSON.stringify(payload),
    });

    const responseText = await response.text();
    console.log("[VALIDATE HMAC] Status:", response.status);
    console.log("[VALIDATE HMAC] Response:", responseText);

    if (!response.ok) {
      console.error("[VALIDATE HMAC] ❌ Validação falhou:", response.status, responseText);
      return NextResponse.json(
        { 
          error: "Validação HMAC falhou",
          status: response.status,
          message: responseText 
        },
        { status: response.status }
      );
    }

    let responseData;
    try {
      responseData = JSON.parse(responseText);
    } catch {
      responseData = { message: responseText };
    }

    console.log("[VALIDATE HMAC] ✅ Validação bem-sucedida!");
    console.log("[VALIDATE HMAC] Response data:", responseData);

    return NextResponse.json({
      success: true,
      validated: true,
      ...responseData,
    });
  } catch (error) {
    console.error("[VALIDATE HMAC] ❌ Erro ao validar HMAC:", error);
    return NextResponse.json(
      { 
        error: "Erro ao validar HMAC",
        message: error instanceof Error ? error.message : "Erro desconhecido"
      },
      { status: 500 }
    );
  }
}

