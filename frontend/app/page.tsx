'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';

// Prevent caching to ensure fresh auth checks
export const dynamic = 'force-dynamic';

export default function Home() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Wait for authentication status to be determined
    if (isLoading) {
      return;
    }

    // Redirect unauthenticated users to login
    if (!user) {
      router.replace('/login');
      return;
    }

    // Redirect authenticated users to their role-appropriate dashboard
    if (user.role === 'HR_ADMIN') {
      router.replace('/hr-dashboard');
    } else if (user.role === 'VENDOR_ADMIN') {
      router.replace('/vendor-dashboard');
    }
  }, [user, isLoading, router]);

  // Always show loading state - never render content on root page
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
        <p className="mt-4 text-gray-600">
          {isLoading ? 'Loading...' : 'Redirecting...'}
        </p>
      </div>
    </div>
  );
}
