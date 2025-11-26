import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import * as jose from 'jose';

/**
 * Middleware to protect routes and validate session tokens
 */
export async function middleware(request: NextRequest) {
  const token = request.cookies.get('session')?.value;
  const { pathname } = request.nextUrl;

  // Allow access to login page without authentication
  if (pathname === '/login') {
    // If already authenticated, redirect to appropriate dashboard
    if (token) {
      try {
        const jwtSecret = process.env.JWT_SECRET || 'default-secret-key-change-in-production';
        const { payload } = await jose.jwtVerify(
          token,
          new TextEncoder().encode(jwtSecret)
        );
        
        const role = payload.role as string;
        if (role === 'HR_ADMIN') {
          return NextResponse.redirect(new URL('/hr-dashboard', request.url));
        } else if (role === 'VENDOR_ADMIN') {
          return NextResponse.redirect(new URL('/vendor-dashboard', request.url));
        }
      } catch (error) {
        // Invalid token, allow access to login page
      }
    }
    return NextResponse.next();
  }

  // Redirect to login if no token
  if (!token) {
    // For API routes, return 401 JSON instead of redirecting
    if (pathname.startsWith('/api/')) {
      return NextResponse.json(
        { error: { code: 'UNAUTHORIZED', message: 'Authentication required' } },
        { status: 401 }
      );
    }
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Verify token
  try {
    const jwtSecret = process.env.JWT_SECRET || 'default-secret-key-change-in-production';
    const { payload } = await jose.jwtVerify(
      token,
      new TextEncoder().encode(jwtSecret)
    );

    // Add user info to request headers for API routes
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('x-user-id', payload.userId as string);
    requestHeaders.set('x-user-role', payload.role as string);
    requestHeaders.set('x-username', payload.username as string);
    
    if (payload.companyId) {
      requestHeaders.set('x-company-id', payload.companyId as string);
    }
    
    if (payload.vendorId) {
      requestHeaders.set('x-vendor-id', payload.vendorId as string);
    }

    // Check role-based access
    const role = payload.role as string;
    
    if (pathname.startsWith('/hr-dashboard') && role !== 'HR_ADMIN') {
      return NextResponse.redirect(new URL('/vendor-dashboard', request.url));
    }
    
    if (pathname.startsWith('/vendor-dashboard') && role !== 'VENDOR_ADMIN') {
      return NextResponse.redirect(new URL('/hr-dashboard', request.url));
    }

    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  } catch (error) {
    // Token is invalid or expired
    const response = pathname.startsWith('/api/')
      ? NextResponse.json(
          { error: { code: 'UNAUTHORIZED', message: 'Session expired, please login again' } },
          { status: 401 }
        )
      : NextResponse.redirect(new URL('/login', request.url));
    
    response.cookies.delete('session');
    return response;
  }
}

export const config = {
  matcher: [
    '/hr-dashboard/:path*',
    '/vendor-dashboard/:path*',
    '/api/events/:path*',
    '/api/event-items/:path*',
    '/api/postal-code/:path*',
    '/login',
  ],
};
