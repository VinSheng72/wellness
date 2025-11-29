'use client';

import { useEffect } from 'react';
import { ErrorBoundaryUI } from '@/components/ui/error-boundary';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('HR Dashboard error:', error);
  }, [error]);

  return (
    <ErrorBoundaryUI
      title="Failed to Load Dashboard"
      message="We encountered an error while loading your dashboard. Please try again."
      onReset={reset}
      backButtonText="Back to Login"
      backButtonHref="/login"
    />
  );
}
