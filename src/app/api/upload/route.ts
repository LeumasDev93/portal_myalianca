/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest } from "next/server";
import formidable from "formidable";
import fs from "fs";
import { IncomingForm } from "formidable";

// Requer habilitar a leitura de arquivos no Edge Runtime (desativar)
export const runtime = "nodejs"; // <- IMPORTANTE PARA USAR FS no App Router

export async function POST(req: NextRequest) {
  const form = new IncomingForm();

  // Transformar `form.parse` em Promise
  const parseForm = () =>
    new Promise<{ fields: formidable.Fields; files: formidable.Files }>((resolve, reject) => {
      form.parse(req as any, (err, fields, files) => {
        if (err) reject(err);
        else resolve({ fields, files });
      });
    });

  try {
    const { files } = await parseForm();
    const fileInput = files.file;
    const file = Array.isArray(fileInput) ? fileInput[0] : fileInput;

    if (!file) {
      return new Response(JSON.stringify({ message: "Arquivo não enviado" }), {
        status: 400,
      });
    }

    const fileBuffer = fs.readFileSync(file.filepath);

    const uploadRes = await fetch("https://api.aliancaseguros.cv/files/1.0.0/upload", {
      method: "POST",
      headers: {
        "x-api-key": process.env.NEXT_PUBLIC_API_KEY || "",
      },
      body: fileBuffer,
    });

    if (!uploadRes.ok) {
      const text = await uploadRes.text();
      return new Response(JSON.stringify({ message: "Erro na API externa", details: text }), {
        status: uploadRes.status,
      });
    }

    const json = await uploadRes.json();

    return new Response(JSON.stringify(json), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Erro upload:", error);
    return new Response(JSON.stringify({ message: "Erro no upload" }), {
      status: 500,
    });
  }
}
