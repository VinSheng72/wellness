'use client';

/**
 * Loading Skeleton Components
 * Provides visual feedback during async operations
 */

export function TableSkeleton() {
  return (
    <div className="animate-pulse space-y-4">
      {/* Table Header */}
      <div className="grid grid-cols-6 gap-4 border-b border-gray-200 pb-3">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="h-4 bg-gray-200 rounded"></div>
        ))}
      </div>
      
      {/* Table Rows */}
      {[...Array(5)].map((_, rowIndex) => (
        <div key={rowIndex} className="grid grid-cols-6 gap-4 py-3">
          {[...Array(6)].map((_, colIndex) => (
            <div key={colIndex} className="h-4 bg-gray-100 rounded"></div>
          ))}
        </div>
      ))}
    </div>
  );
}

export function FormSkeleton() {
  return (
    <div className="animate-pulse space-y-6">
      {[...Array(4)].map((_, i) => (
        <div key={i}>
          <div className="h-4 w-24 bg-gray-200 rounded mb-2"></div>
          <div className="h-10 bg-gray-100 rounded"></div>
        </div>
      ))}
      <div className="h-10 bg-gray-200 rounded"></div>
    </div>
  );
}

export function DashboardSkeleton() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="h-8 w-48 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-4 w-32 bg-gray-200 rounded animate-pulse"></div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="space-y-8">
          <div className="rounded-lg bg-white p-6 shadow">
            <div className="h-6 w-40 bg-gray-200 rounded mb-4 animate-pulse"></div>
            <FormSkeleton />
          </div>

          <div className="rounded-lg bg-white p-6 shadow">
            <div className="h-6 w-32 bg-gray-200 rounded mb-4 animate-pulse"></div>
            <TableSkeleton />
          </div>
        </div>
      </main>
    </div>
  );
}

export function CardSkeleton() {
  return (
    <div className="animate-pulse rounded-lg bg-white p-6 shadow">
      <div className="h-6 w-3/4 bg-gray-200 rounded mb-4"></div>
      <div className="space-y-3">
        <div className="h-4 bg-gray-100 rounded"></div>
        <div className="h-4 bg-gray-100 rounded w-5/6"></div>
        <div className="h-4 bg-gray-100 rounded w-4/6"></div>
      </div>
    </div>
  );
}
