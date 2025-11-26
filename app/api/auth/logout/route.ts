import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

/**
 * POST /api/auth/logout
 * Logout user by clearing session cookie
 */
export async function POST() {
  try {
    // Clear the session cookie
    const cookieStore = await cookies();
    cookieStore.delete('session');

    return NextResponse.json(
      { success: true, message: 'Logged out successfully' },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: { message: 'Logout failed' } },
      { status: 500 }
    );
  }
}
