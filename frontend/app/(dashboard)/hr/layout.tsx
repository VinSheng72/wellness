'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { UserRole } from '@/lib/enums/user-role.enum';

export default function HRLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { user, isLoading } = useAuth();

  useEffect(() => {
    if (isLoading || !user) return;

    if (user.role !== UserRole.HR_ADMIN) {
      router.replace('/vendor');
      return;
    }
  }, [user, isLoading, router]);

  if (!user || user.role !== UserRole.HR_ADMIN) {
    return null;
  }

  return <>{children}</>;
}
