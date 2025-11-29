'use client';

import { Skeleton } from '@/components/ui/skeleton';

export function TableSkeleton() {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-6 gap-4 border-b border-gray-200 pb-3">
        {[...Array(6)].map((_, i) => (
          <Skeleton key={i} className="h-4" />
        ))}
      </div>
      
      {[...Array(5)].map((_, rowIndex) => (
        <div key={rowIndex} className="grid grid-cols-6 gap-4 py-3">
          {[...Array(6)].map((_, colIndex) => (
            <Skeleton key={colIndex} className="h-4" />
          ))}
        </div>
      ))}
    </div>
  );
}

export function FormSkeleton() {
  return (
    <div className="space-y-6">
      {[...Array(4)].map((_, i) => (
        <div key={i}>
          <Skeleton className="h-4 w-24 mb-2" />
          <Skeleton className="h-10" />
        </div>
      ))}
      <Skeleton className="h-10" />
    </div>
  );
}

export function DashboardSkeleton() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-32" />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="space-y-8">
          <div className="rounded-lg bg-white p-6 shadow">
            <Skeleton className="h-6 w-40 mb-4" />
            <FormSkeleton />
          </div>

          <div className="rounded-lg bg-white p-6 shadow">
            <Skeleton className="h-6 w-32 mb-4" />
            <TableSkeleton />
          </div>
        </div>
      </main>
    </div>
  );
}

export function CardSkeleton() {
  return (
    <div className="rounded-lg bg-white p-6 shadow">
      <Skeleton className="h-6 w-3/4 mb-4" />
      <div className="space-y-3">
        <Skeleton className="h-4" />
        <Skeleton className="h-4 w-5/6" />
        <Skeleton className="h-4 w-4/6" />
      </div>
    </div>
  );
}
