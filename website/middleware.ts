import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/favicon') ||
    pathname === '/password'
  ) {
    return NextResponse.next();
  }

  const authCookie = request.cookies.get('ww-preview-auth');
  if (authCookie?.value === process.env.PREVIEW_PASSWORD_HASH) {
    return NextResponse.next();
  }

  const url = request.nextUrl.clone();
  url.pathname = '/password';
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
