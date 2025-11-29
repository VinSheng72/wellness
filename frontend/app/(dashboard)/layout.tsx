'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import Navigation from '@/components/Navigation';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { user, isLoading } = useAuth();

  useEffect(() => {
    if (isLoading) return;

    if (!user) {
      router.replace('/login');
      return;
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <LoadingSpinner size="md" message="Loading..." />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <>
      <Navigation />
      {children}
    </>
  );
}
