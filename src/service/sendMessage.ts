// src/services/sendMessage.ts

interface SendMessagePayload {
    assunto: string;
    conteudo: string;
    user_id: string;
    file_list_ids?: string[];
}

const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL_DEFAULT!;
const API_KEY = process.env.NEXT_PUBLIC_API_KEY!;

export async function sendMessage(payload: SendMessagePayload) {
    if (!API_URL || !API_KEY) {
        throw new Error("Variáveis de ambiente da API não configuradas.");
    }

    if (
        !payload.assunto?.trim() ||
        !payload.conteudo?.trim() ||
        !payload.user_id?.trim()
    ) {
        throw new Error("Campos obrigatórios faltando.");
    }

    const response = await fetch(API_URL, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `ApiKey ${API_KEY}`,
        },
        body: JSON.stringify({
            assunto: payload.assunto.trim(),
            conteudo: payload.conteudo.trim(),
            user_id: payload.user_id.trim(),
            file_list_ids: payload.file_list_ids ?? [],
        }),
    });

    if (!response.ok) {
        const text = await response.text();
        throw new Error(`Erro na API externa: ${text}`);
    }

    return await response.json();
}
