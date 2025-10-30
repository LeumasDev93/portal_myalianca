import { NextRequest, NextResponse } from 'next/server';

// Centraliza o fluxo no /api/payment/callback (mantém método e corpo)
export async function POST(request: NextRequest) {
  const url = new URL('/api/payment/callback', request.url);
  return NextResponse.rewrite(url);
}
