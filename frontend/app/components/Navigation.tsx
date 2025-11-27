'use client';

import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { useAuth } from '@/lib/auth';

export default function Navigation() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // Only show navigation on dashboard routes
  const shouldShowNavigation = pathname.startsWith('/hr-dashboard') || pathname.startsWith('/vendor-dashboard');
  
  if (!shouldShowNavigation) {
    return null;
  }

  const handleLogout = async () => {
    setIsLoggingOut(true);
    
    try {
      await logout();
    } catch (error) {
      // Logout method already handles redirect
      console.error('Logout error:', error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  // Determine current page title
  const getPageTitle = () => {
    if (pathname.startsWith('/hr-dashboard')) {
      return 'HR Admin Dashboard';
    } else if (pathname.startsWith('/vendor-dashboard')) {
      return 'Vendor Admin Dashboard';
    }
    return '';
  };

  const pageTitle = getPageTitle();

  return (
    <nav className="bg-blue-600 text-white shadow-md">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center space-x-4">
            <h1 className="text-xl font-bold">
              Wellness Event Booking
            </h1>
            {pageTitle && (
              <span className="text-lg font-medium text-blue-100">
                | {pageTitle}
              </span>
            )}
          </div>
          
          <div className="flex items-center space-x-4">
            {user && (
              <span className="text-sm font-medium text-blue-100">
                {user.username}
              </span>
            )}
            <button
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="rounded-md bg-blue-700 px-4 py-2 text-sm font-medium hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-blue-600 disabled:bg-blue-400 disabled:cursor-not-allowed"
            >
              {isLoggingOut ? 'Logging out...' : 'Logout'}
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
