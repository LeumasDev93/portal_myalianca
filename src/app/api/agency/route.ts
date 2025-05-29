// app/api/agencias/route.ts
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const apiUrl = 'http://41.221.195.121:8280/aliancamiddleware/agency';

    const response = await fetch(apiUrl, {
      headers: {
        Authorization: 'Bearer 3eb96e29-664b-4bb6-8813-bb7549fcee19',
        'Content-Type': 'application/json',
      },
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
