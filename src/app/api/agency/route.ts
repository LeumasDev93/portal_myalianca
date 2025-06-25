// app/api/agencias/route.ts
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const apiUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}/agencys`
    const apiToken = process.env.API_SECRET_TOKEN;
    const response = await fetch(apiUrl, {
        headers: {
         'Authorization': `Bearer ${apiToken}`,
         'ApiKey': process.env.NEXT_PUBLIC_API_KEY || '' 
       } 
    });

    if (!response.ok) {
      throw new Error(`Erro ao buscar agências: ${response.status}`);
    }

    const data = await response.json();

    return NextResponse.json(data);
  } catch (error) {
    console.error('Erro ao buscar agências:', error);
    return NextResponse.json(
      { error: 'Falha ao buscar as agências', details: error },
      { status: 500 }
    );
  }
}
