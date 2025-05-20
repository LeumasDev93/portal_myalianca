import { NextResponse, type NextRequest } from 'next/server';

const PUBLIC_ROUTES = ['/login', '/signUp', '/recuperar-senha'];
const PRIVATE_ROUTE_PREFIXES = ['/backoffice', '/empresarial'];

const LOGIN_REDIRECT = '/login';
const AUTHENTICATED_REDIRECT = '/backoffice';

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const isPublic = PUBLIC_ROUTES.some((route) => pathname.startsWith(route));
  const isPrivate = PRIVATE_ROUTE_PREFIXES.some((prefix) =>
    pathname.startsWith(prefix)
  );

  // Verifica se o token existe no cookie (definido no client com `document.cookie`)
  const token = req.cookies.get('token')?.value;

  // Usuário não autenticado tentando acessar rota privada
  if (isPrivate && !token) {
    const redirectUrl = req.nextUrl.clone();
    redirectUrl.pathname = LOGIN_REDIRECT;
    redirectUrl.searchParams.set('from', pathname);
    return NextResponse.redirect(redirectUrl);
  }

  // Usuário autenticado tentando acessar rota pública
  if (token && isPublic) {
    const redirectUrl = req.nextUrl.clone();
    redirectUrl.pathname = AUTHENTICATED_REDIRECT;
    return NextResponse.redirect(redirectUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)',
  ],
};
