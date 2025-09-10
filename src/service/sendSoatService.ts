interface SendSoatPayload {
  soatId: string;
}

interface SendSoatResponse {
  info: {
    status: number;
    message: string;
    errors: string | null;
  };
  data?: unknown;
}

export async function sendSoat(payload: SendSoatPayload): Promise<SendSoatResponse> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL_DEFAULT;
    const apiKey = process.env.NEXT_PUBLIC_API_KEY;

    if (!baseUrl || !apiKey) {
      throw new Error("Configuração da API não encontrada");
    }

    if (!payload.soatId?.trim()) {
      throw new Error("ID do SOAT é obrigatório.");
    }

    const fullUrl = `${baseUrl}/soat/1.0.0/${payload.soatId}/enviar`;

    console.log("Enviando SOAT:", payload.soatId);
    console.log("URL:", fullUrl);

    const response = await fetch(fullUrl, {
      method: "PUT",
      headers: {
        apikey: apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        soat_id: payload.soatId,
      }),
    });

    const data = await response.json();

    console.log("Resposta da API (enviar SOAT):", data);

    if (!response.ok) {
      throw new Error(data.info?.errors || `Erro HTTP: ${response.status}`);
    }

    return data;
  } catch (error: unknown) {
    console.error("Erro ao enviar SOAT:", error);
    throw error;
  }
}
