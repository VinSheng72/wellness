'use client';

import { ReactNode, useCallback } from 'react';
import { toast } from 'sonner';
import { Toaster } from '@/components/ui/sonner';

type ToastType = 'success' | 'error' | 'info' | 'warning';

export function useToast() {
  const showToast = useCallback((message: string, type: ToastType = 'info') => {
    switch (type) {
      case 'success':
        toast.success(message);
        break;
      case 'error':
        toast.error(message);
        break;
      case 'warning':
        toast.warning(message);
        break;
      case 'info':
      default:
        toast.info(message);
        break;
    }
  }, []);

  return { showToast };
}

export function ToastProvider({ children }: { children: ReactNode }) {
  return (
    <>
      {children}
      <Toaster position="top-right" />
    </>
  );
}
