/**
 * Loading state for Login Page
 */
export default function Loading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="w-full max-w-md space-y-8 rounded-lg bg-white p-8 shadow-md">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-3/4 mx-auto"></div>
          <div className="h-4 bg-gray-100 rounded w-1/2 mx-auto"></div>
          
          <div className="space-y-4 mt-8">
            <div>
              <div className="h-4 bg-gray-200 rounded w-20 mb-2"></div>
              <div className="h-10 bg-gray-100 rounded"></div>
            </div>
            <div>
              <div className="h-4 bg-gray-200 rounded w-20 mb-2"></div>
              <div className="h-10 bg-gray-100 rounded"></div>
            </div>
          </div>
          
          <div className="h-10 bg-gray-200 rounded"></div>
        </div>
      </div>
    </div>
  );
}
