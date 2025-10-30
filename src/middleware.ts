import { NextResponse, type NextRequest } from 'next/server';

const PRIVATE_ROUTE_PREFIXES = ['/backoffice', '/empresarial'];

const LOGIN_REDIRECT = '/login';

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  
  // Intercepta POST para /backoffice e redireciona para a API de callback
  if (pathname.startsWith('/backoffice') && req.method === 'POST') {
    const rewriteUrl = req.nextUrl.clone();
    rewriteUrl.pathname = '/api/backoffice';
    return NextResponse.rewrite(rewriteUrl);
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
    // Permite uma passagem pós-pagamento com cookie curto
    const postpay = req.cookies.get('postpay')?.value;
    if (postpay === '1') {
      return NextResponse.next();
    }
    // Verifica se há parâmetros de callback de pagamento (não redireciona se vier do SISP)
    const isPaymentCallback = req.nextUrl.searchParams.has('payment_status') || 
                             req.nextUrl.searchParams.has('reference') ||
                             req.nextUrl.searchParams.has('sessionId') ||
                             req.nextUrl.searchParams.has('merchantSession') ||
                             req.nextUrl.searchParams.has('merchantRef');
    
    if (isPaymentCallback) {
      // Seta cookie postpay aqui também como fallback e permite a passagem
      const res = NextResponse.next();
      res.cookies.set('postpay', '1', {
        path: '/',
        maxAge: 10,
        sameSite: 'none',
        secure: true,
      });
      return res;
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