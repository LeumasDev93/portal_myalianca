/* eslint-disable @typescript-eslint/no-explicit-any */
import type { NextApiRequest, NextApiResponse } from "next";

const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL_DEFAULT!;
const API_KEY = process.env.NEXT_PUBLIC_API_KEY!;
const API_TOKEN = process.env.API_SECRET_TOKEN || "";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== "POST") {
        return res.status(405).json({ error: "Método não permitido" });
    }

    try {
        const { messageId, conteudo, user_id } = req.body;

        if (!messageId || !user_id || !conteudo) {
            return res.status(400).json({ error: "Parâmetros obrigatórios ausentes" });
        }

        const url = `${API_URL}/messages/1.0.0/${messageId}/marcar-lida`;

        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "x-api-key": API_KEY,
                "Authorization": `Bearer ${API_TOKEN}`,
            },
            body: JSON.stringify({
                conteudo,
                user_id,
            }),
        });

        if (!response.ok) {
            const errData = await response.json().catch(() => null);
            return res.status(response.status).json({
                error: errData?.message || "Erro ao marcar como lida",
            });
        }

        const data = await response.json();
        return res.status(200).json({ success: true, data });
    } catch (error: any) {
        return res.status(500).json({
            error: error.message || "Erro interno no servidor",
        });
    }
}
