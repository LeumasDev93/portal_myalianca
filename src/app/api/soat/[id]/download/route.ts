import { NextRequest, NextResponse } from "next/server";

export async function GET(
	request: NextRequest,
	{ params }: { params: Promise<{ id: string }> }
) {
	try {
		const apiKey = process.env.NEXT_PUBLIC_API_KEY;
		const apiToken = process.env.API_SECRET_TOKEN;
		const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL_DEFAULT;

		if (!apiKey || !apiToken || !baseUrl) {
			return NextResponse.json(
				{ error: "Configuração da API não encontrada" },
				{ status: 500 }
			);
		}

		const resolvedParams = await params;
		const soatId = resolvedParams.id;
		if (!soatId) {
			return NextResponse.json(
				{ error: "ID do SOAT é obrigatório" },
				{ status: 400 }
			);
		}

		const upstream = await fetch(
			`${baseUrl}/soat/1.0.0/${soatId}/download`,
			{
				method: "GET",
				headers: {
					Authorization: `Bearer ${apiToken}`,
					ApiKey: apiKey,
					"Content-Type": "application/json",
				},
			}
		);

		if (!upstream.ok) {
			const errorText = await upstream.text();
			console.error("Erro ao baixar SOAT:", errorText);
			return NextResponse.json(
				{ error: "Erro ao baixar SOAT" },
				{ status: upstream.status }
			);
		}

		const fileBuffer = await upstream.arrayBuffer();
		const contentDisposition = upstream.headers.get("content-disposition");
		let filename = "soat.xlsx";
		if (contentDisposition) {
			const match = contentDisposition.match(
				/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/
			);
			if (match && match[1]) {
				filename = match[1].replace(/['"]/g, "");
			}
		}

		return new NextResponse(fileBuffer, {
			status: 200,
			headers: {
				"Content-Type":
					upstream.headers.get("content-type") ||
					"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
				"Content-Disposition": `attachment; filename="${filename}"`,
				"Content-Length": fileBuffer.byteLength.toString(),
			},
		});
	} catch (error) {
		console.error("Erro ao processar download do SOAT:", error);
		return NextResponse.json(
			{ error: "Erro interno do servidor" },
			{ status: 500 }
		);
	}
}



