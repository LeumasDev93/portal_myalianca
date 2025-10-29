import { NextResponse, type NextRequest } from 'next/server';

const PRIVATE_ROUTE_PREFIXES = ['/backoffice', '/empresarial'];

const LOGIN_REDIRECT = '/login';

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  
  // Permite POST do SISP diretamente para /backoffice (callback) sem exigir token
  if (pathname.startsWith('/backoffice') && req.method === 'POST') {
    return NextResponse.next();
  }
  
  // Pula middleware para rotas que não precisam de autenticação
  if (
    pathname.startsWith('/api/payment/callback') ||
    pathname.startsWith('/api/') ||
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/favicon.ico') ||
    pathname.startsWith('/sitemap.xml') ||
    pathname.startsWith('/robots.txt') ||
    pathname.includes('.') ||
    pathname === '/login' ||
    pathname === '/'
  ) {
    return NextResponse.next();
  }
  
  const isPrivate = PRIVATE_ROUTE_PREFIXES.some((prefix) =>
    pathname.startsWith(prefix)
  );

  // Verifica se o token existe no cookie (definido no client com `document.cookie`)
  const token = req.cookies.get('token')?.value;

  // Se não há token mas está acessando rota privada, redireciona para login
  // MAS apenas se não vier de um callback de pagamento
  if (isPrivate && !token) {
    // Verifica se há parâmetros de callback de pagamento (não redireciona se vier do SISP)
    const isPaymentCallback = req.nextUrl.searchParams.has('payment_status') || 
                             req.nextUrl.searchParams.has('reference') ||
                             req.nextUrl.searchParams.has('sessionId');
    
    if (isPaymentCallback) {
      // Permite acesso mesmo sem token se vier do callback de pagamento
      // O cliente vai restaurar a sessão do cookie
      return NextResponse.next();
    }

    const redirectUrl = req.nextUrl.clone();
    redirectUrl.pathname = LOGIN_REDIRECT;
    redirectUrl.searchParams.set('from', pathname);
    
    // Preserva parâmetros de menu se existirem
    const menu = req.nextUrl.searchParams.get('menu');
    if (menu) {
      redirectUrl.searchParams.set('menu', menu);
    }
    
    return NextResponse.redirect(redirectUrl);
  }

  // Não redirecionamos mais usuários autenticados de rotas públicas

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)',
  ],
};