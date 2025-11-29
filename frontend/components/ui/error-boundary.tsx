'use client';

import { AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ErrorBoundaryUIProps {
  title?: string;
  message?: string;
  onReset: () => void;
  backButtonText?: string;
  backButtonHref?: string;
}

export function ErrorBoundaryUI({
  title = 'Something Went Wrong',
  message = 'We encountered an unexpected error. Please try again or contact support if the problem persists.',
  onReset,
  backButtonText = 'Go to Home',
  backButtonHref = '/',
}: ErrorBoundaryUIProps) {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-md">
        <div className="mb-4 flex justify-center">
          <AlertTriangle className="h-12 w-12 text-red-500" />
        </div>
        <h2 className="mb-2 text-center text-xl font-bold text-gray-900">
          {title}
        </h2>
        <p className="mb-6 text-center text-sm text-gray-600">
          {message}
        </p>
        <div className="space-y-3">
          <Button
            onClick={onReset}
            className="w-full"
          >
            Try Again
          </Button>
          <Button
            onClick={() => window.location.href = backButtonHref}
            variant="secondary"
            className="w-full"
          >
            {backButtonText}
          </Button>
        </div>
      </div>
    </div>
  );
}
