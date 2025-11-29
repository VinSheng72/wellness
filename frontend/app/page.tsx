'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { UserRole } from '@/lib/enums/user-role.enum';


export default function Home() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) {
      return;
    }

    if (!user) {
      router.replace('/login');
      return;
    }

    if (user.role === UserRole.HR_ADMIN) {
      router.replace('/hr');
    } else if (user.role === UserRole.VENDOR_ADMIN) {
      router.replace('/vendor');
    }
  }, [user, isLoading, router]);

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
