import { NextRequest, NextResponse } from 'next/server';
import AuthService from '@/lib/services/AuthService';
import { connectDB } from '@/lib/db/connection';

/**
 * POST /api/auth/login
 * Authenticate user and create session
 */
export async function POST(request: NextRequest) {
  try {
    // Ensure database connection
    await connectDB();

    // Parse request body
    const body = await request.json();
    const { username, password } = body;

    // Validate request body
    if (!username || !password) {
      return NextResponse.json(
        { error: { code: 'VALIDATION_ERROR', message: 'Username and password are required' } },
        { status: 400 }
      );
    }

    // Authenticate user
    const { user } = await AuthService.login(username, password);

    // Create session token
    const token = await AuthService.createSessionToken(user);

    // Prepare response with user information
    const response = NextResponse.json({
      success: true,
      user: {
        id: user._id.toString(),
        username: user.username,
        role: user.role,
        companyId: user.companyId?.toString(),
        vendorId: user.vendorId?.toString(),
      },
    });

    // Set HTTP-only session cookie
    response.cookies.set('session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    });

    return response;
  } catch (error) {
    // Handle authentication errors
    if (error instanceof Error && error.message === 'Invalid username or password') {
      return NextResponse.json(
        { error: { code: 'AUTHENTICATION_ERROR', message: 'Invalid username or password' } },
        { status: 401 }
      );
    }

    // Handle unexpected errors
    console.error('Login error:', error);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'An unexpected error occurred' } },
      { status: 500 }
    );
  }
}
