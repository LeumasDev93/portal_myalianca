// /* eslint-disable @typescript-eslint/no-explicit-any */
// // src/app/api/menssage/[threadId]/reply/route.ts
// import { NextRequest, NextResponse } from "next/server";

// const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL_DEFAULT!;
// const API_KEY = process.env.NEXT_PUBLIC_API_KEY!;
// const API_TOKEN = process.env.API_SECRET_TOKEN || "";

// export async function POST(
//     req: NextRequest,
//     { params }: { params: { threadId: string } }
// ) {
//     try {
//         const { threadId } = params;
//         const body = await req.json();
//         const { conteudo, user_id, file_list_ids } = body;

//         if (!threadId || !conteudo?.trim() || !user_id) {
//             return NextResponse.json(
//                 { error: "Parâmetros obrigatórios faltando." },
//                 { status: 400 }
//             );
//         }

//         const externalRes = await fetch(
//             `${API_URL}/messages/1.0.0/${threadId}/responder`,
//             {
//                 method: "POST",
//                 headers: {
//                     "Content-Type": "application/json",
//                     ApiKey: API_KEY,
//                     Authorization: API_TOKEN ? `Bearer ${API_TOKEN}` : "",
//                 },
//                 body: JSON.stringify({
//                     conteudo,
//                     user_id,
//                     file_list_ids: file_list_ids || [],
//                 }),
//             }
//         );

//         if (!externalRes.ok) {
//             const text = await externalRes.text();
//             console.error("Erro API externa:", text);
//             return NextResponse.json(
//                 { error: `Erro da API externa: ${text}` },
//                 { status: externalRes.status }
//             );
//         }

//         const data = await externalRes.json();
//         return NextResponse.json(data);
//     } catch (error: any) {
//         console.error("Erro interno:", error);
//         return NextResponse.json(
//             { error: error.message || "Erro interno no servidor." },
//             { status: 500 }
//         );
//     }
// }
