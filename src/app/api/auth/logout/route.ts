import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
    try {
        const { user_id, session_id } = await request.json();

        if (!user_id || !session_id) {
            return NextResponse.json({ error: 'Dados incompletos' }, { status: 400 });
        }

        const apiUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}/accounts/logout`;

        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'ApiKey': process.env.NEXT_PUBLIC_API_KEY || '',
            },
            body: JSON.stringify({ user_id, session_id }),
        });

        const data = await response.json();

        if (!response.ok) {
            return NextResponse.json(
                { error: data.message || 'Erro no logout', details: data },
                { status: response.status }
            );
        }

        return NextResponse.json({ message: 'Logout efetuado com sucesso', data });
    } catch (error) {
        console.error('Erro interno no logout:', error);
        return NextResponse.json({ error: 'Erro interno no servidor' }, { status: 500 });
    }
}
