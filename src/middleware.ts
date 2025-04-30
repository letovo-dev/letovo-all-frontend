import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  if (request.nextUrl.pathname.startsWith('/api')) {
    // console.log('API request headers:', request.headers.get('Authorization'));
  }

  // const token = request.headers.get('Authorization')?.replace('Bearer ', '');
  // if (!token) {
  //   const url = new URL('/login', request.url);

  //   // return NextResponse.redirect(url);
  // }
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!login|public).*)', '/api/:path*'], // Исключите login, API и статические ресурсы
};
