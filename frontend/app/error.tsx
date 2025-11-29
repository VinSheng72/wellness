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
    console.error('Application error:', error);
  }, [error]);

  return (
    <ErrorBoundaryUI
      onReset={reset}
    />
  );
}
