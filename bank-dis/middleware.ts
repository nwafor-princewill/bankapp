import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // In a real app, you would check for a valid session/token
  // For now, we'll just allow access to dashboard
  return NextResponse.next();
}

export const config = {
  matcher: '/dashboard/:path*',
};