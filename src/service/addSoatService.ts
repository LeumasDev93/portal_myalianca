/* eslint-disable @typescript-eslint/no-explicit-any */

interface AddSoatRequest {
  inicio_mes_referente: number;
  inicio_ano_referente: number;
  fim_mes_referente?: number;
  fim_ano_referente?: number;
  id_utilizador: string;
}

interface AddSoatResponse {
  info: {
    status: number;
    message: string;
    errors?: string;
  };
  data?: any;
}

export const addSoat = async (data: AddSoatRequest): Promise<AddSoatResponse> => {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL_DEFAULT;
    const apiKey = process.env.NEXT_PUBLIC_API_KEY;

    if (!baseUrl || !apiKey) {
      throw new Error("Configuração da API não encontrada");
    }

    const fullUrl = `${baseUrl}/soat/1.0.0`;

    console.log("Criando SOAT:", data);
    console.log("URL:", fullUrl);

    const response = await fetch(fullUrl, {
      method: "POST",
      headers: {
        apikey: apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    const responseData = await response.json();

    console.log("Resposta da API (criar SOAT):", responseData);

    if (!response.ok) {
      throw new Error(responseData.info?.errors || `Erro HTTP: ${response.status}`);
    }

    return responseData;
  } catch (error: any) {
    console.error("Erro ao criar SOAT:", error);
    throw error;
  }
};
