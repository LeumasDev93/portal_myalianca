/* eslint-disable @typescript-eslint/no-explicit-any */
interface RemoveSoatResponse {
  info: {
    status: number;
    message: string;
    errors?: string;
  };
  data?: any;
}

export const removeSoat = async (soatId: string): Promise<RemoveSoatResponse> => {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL_DEFAULT;
    const apiKey = process.env.NEXT_PUBLIC_API_KEY;

    if (!baseUrl || !apiKey) {
      throw new Error("Configuração da API não encontrada");
    }

    const fullUrl = `${baseUrl}/soat/1.0.0/${soatId}`;

    console.log("Removendo SOAT:", soatId);
    console.log("URL:", fullUrl);

    const response = await fetch(fullUrl, {
      method: "DELETE",
      headers: {
        apikey: apiKey,
        "Content-Type": "application/json",
      },
    });

    const data = await response.json();

    console.log("Resposta da API (remover SOAT):", data);

    if (!response.ok) {
      throw new Error(data.info?.errors || `Erro HTTP: ${response.status}`);
    }

    return data;
  } catch (error: any) {
    console.error("Erro ao remover SOAT:", error);
    throw error;
  }
};
