import type { NextApiRequest, NextApiResponse } from "next";
import formidable from "formidable";
import fs from "fs";

export const config = {
  api: {
    bodyParser: false, // DESABILITA o body parser padrão para lidar com form-data
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  const form = new formidable.IncomingForm();

  form.parse(req, async (err, fields, files) => {
    if (err) {
      console.error("Erro formidable:", err);
      return res.status(500).json({ message: "Erro ao processar arquivo" });
    }

    const fileInput = files.file;
    const file = Array.isArray(fileInput) ? fileInput[0] : fileInput;

    if (!file) return res.status(400).json({ message: "Arquivo não enviado" });

    try {
      const fileBuffer = fs.readFileSync(file.filepath);

      const fetchResponse = await fetch("https://api.aliancaseguros.cv/files/1.0.0/upload", {
        method: "POST",
        headers: {
          "x-api-key": process.env.NEXT_PUBLIC_API_KEY || "",
        },
        body: fileBuffer,
      });

      if (!fetchResponse.ok) {
        const text = await fetchResponse.text();
        return res.status(fetchResponse.status).json({ message: "Erro na API externa", details: text });
      }

      const json = await fetchResponse.json();

      return res.status(200).json(json);
    } catch (error) {
      console.error("Erro upload API externa:", error);
      return res.status(500).json({ message: "Erro no upload para API externa" });
    }
  });
}
