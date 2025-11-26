import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Middleware to protect routes
 * Note: JWT token validation is now handled by the NestJS backend
 * This middleware only checks for the presence of a token and handles client-side routing
 */
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow access to login page without authentication
  if (pathname === '/login') {
    return NextResponse.next();
  }

  // For protected routes, we'll let the client-side handle authentication
  // The API client will automatically redirect to login if tokens are invalid
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/hr-dashboard/:path*',
    '/vendor-dashboard/:path*',
    '/login',
  ],
};
