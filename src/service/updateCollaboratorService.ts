
interface UpdateCollaboratorPayload {
  id_soat: string;
  json_content: string;
}

interface UpdateCollaboratorResponse {
  info: {
    status: number;
    message: string;
    errors: string | null;
  };
  data?: unknown;
}

export async function updateCollaborator(
  collaboratorId: string,
  payload: UpdateCollaboratorPayload
): Promise<UpdateCollaboratorResponse> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL_DEFAULT;
    const apiKey = process.env.NEXT_PUBLIC_API_KEY;

    if (!baseUrl || !apiKey) {
      throw new Error("Configuração da API não encontrada");
    }

    const url = `${baseUrl}/soat/1.0.0/update-colaborator/${collaboratorId}`;

    console.log("URL da requisição:", url);
    console.log("Payload:", payload);

    const response = await fetch(url, {
      method: "PUT",
      headers: {
        apikey: apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: UpdateCollaboratorResponse = await response.json();
    console.log("Resposta da API:", data);

    return data;
  } catch (error: unknown) {
    console.error("Erro ao atualizar colaborador:", error);
    throw error;
  }
}
