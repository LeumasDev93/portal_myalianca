import { NextResponse, type NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

const publicRoutes = [
  { path: '/signUp', whenAuthenticated: 'redirect' },
  { path: '/', whenAuthenticated: 'redirect' },
] as const;

const privateRoutes = [
  { path: '/backoffice', whenAuthenticated: 'redirect' },
] as const;

const REDIRECT_WHEN_NOT_AUTHENTICATED_ROUTE = '/';

export async function middleware(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  const path = req.nextUrl.pathname;

  const isPublicRoute = publicRoutes.some(route => route.path === path);
  const isPrivateRoute = privateRoutes.some(route => route.path === path);

  if (isPrivateRoute && !token) {
    const redirectUrl = req.nextUrl.clone();
    redirectUrl.pathname = REDIRECT_WHEN_NOT_AUTHENTICATED_ROUTE;
    return NextResponse.redirect(redirectUrl);
  }

  if (isPublicRoute && !token) {
    return NextResponse.next();
  }

  const publicRoute = publicRoutes.find(route => route.path === path);
  if (token && publicRoute?.whenAuthenticated === 'redirect') {
    const redirectUrl = req.nextUrl.clone();
    redirectUrl.pathname = '/backoffice';
    return NextResponse.redirect(redirectUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)',
  ],
};
