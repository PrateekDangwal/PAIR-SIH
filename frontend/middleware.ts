import { NextRequest, NextResponse } from 'next/server';
export function middleware(request:NextRequest){
  if(request.nextUrl.pathname.startsWith('/app') && !request.cookies.get('pair_user')) return NextResponse.redirect(new URL('/login',request.url));
  return NextResponse.next();
}
export const config={matcher:['/app/:path*']};
