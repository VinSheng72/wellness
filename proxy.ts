import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

/**
 * Proxy to protect routes and validate user sessions
 * Extracts JWT token from cookies, verifies it, and adds user info to headers
 */
export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Extract session token from cookies
  const token = request.cookies.get('session')?.value;

  // If no token, redirect to login
  if (!token) {
    // Allow API routes to return 401 instead of redirecting
    if (pathname.startsWith('/api/')) {
      return NextResponse.json(
        { error: { code: 'UNAUTHORIZED', message: 'Authentication required' } },
        { status: 401 }
      );
    }
    
    // Redirect to login page for protected pages
    const loginUrl = new URL('/login', request.url);
    return NextResponse.redirect(loginUrl);
  }

  // Verify the session token using jose (Edge Runtime compatible)
  const jwtSecret = process.env.JWT_SECRET || 'default-secret-key-change-in-production';
  let userInfo: {
    userId: string;
    username: string;
    role: string;
    companyId?: string;
    vendorId?: string;
  } | null = null;

  try {
    const { payload } = await jwtVerify(
      token,
      new TextEncoder().encode(jwtSecret)
    );
    userInfo = {
      userId: payload.userId as string,
      username: payload.username as string,
      role: payload.role as string,
      companyId: payload.companyId as string | undefined,
      vendorId: payload.vendorId as string | undefined,
    };
  } catch (error) {
    // Token is invalid or expired
    userInfo = null;
  }

  // If token is invalid or expired, redirect to login
  if (!userInfo) {
    // Clear the invalid session cookie
    const response = pathname.startsWith('/api/')
      ? NextResponse.json(
          { error: { code: 'UNAUTHORIZED', message: 'Session expired, please login again' } },
          { status: 401 }
        )
      : NextResponse.redirect(new URL('/login', request.url));

    response.cookies.delete('session');
    return response;
  }

  // For API routes, add user information to request headers
  if (pathname.startsWith('/api/')) {
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('x-user-id', userInfo.userId);
    requestHeaders.set('x-user-role', userInfo.role);
    requestHeaders.set('x-username', userInfo.username);
    
    if (userInfo.companyId) {
      requestHeaders.set('x-company-id', userInfo.companyId);
    }
    
    if (userInfo.vendorId) {
      requestHeaders.set('x-vendor-id', userInfo.vendorId);
    }

    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  }

  // For dashboard routes, verify role-based access
  if (pathname.startsWith('/hr-dashboard') && userInfo.role !== 'HR_ADMIN') {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  if (pathname.startsWith('/vendor-dashboard') && userInfo.role !== 'VENDOR_ADMIN') {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Allow the request to proceed
  return NextResponse.next();
}

/**
 * Configure which routes the proxy should run on
 * Protects dashboard routes and API routes (except auth endpoints)
 */
export const config = {
  matcher: [
    '/hr-dashboard/:path*',
    '/vendor-dashboard/:path*',
    '/api/events/:path*',
    '/api/event-items/:path*',
    '/api/postal-code/:path*',
  ],
};
