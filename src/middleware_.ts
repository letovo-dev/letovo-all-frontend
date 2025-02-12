import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const token = request.headers.get('Authorization')?.replace('Bearer ', '');
  console.log('token', token);
  console.log(request.headers);
  console.log(request.headers.get('Authorization'));

  if (!token) {
    const url = new URL('/login', request.url);
    console.log(url);

    // return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!login|api|public).*)'], // Исключите login, API и статические ресурсы
};
