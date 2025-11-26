'use client';

import { useRouter, usePathname } from 'next/navigation';
import { useState } from 'react';

export default function Navigation() {
  const router = useRouter();
  const pathname = usePathname();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // Don't show navigation on login page
  if (pathname === '/login') {
    return null;
  }

  const handleLogout = async () => {
    setIsLoggingOut(true);
    
    try {
      // Clear the session cookie by calling logout endpoint
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
      });

      if (response.ok) {
        // Redirect to login page
        router.push('/login');
      } else {
        // Even if logout fails, redirect to login
        router.push('/login');
      }
    } catch (error) {
      // On error, still redirect to login
      router.push('/login');
    } finally {
      setIsLoggingOut(false);
    }
  };

  // Determine current page title
  const getPageTitle = () => {
    if (pathname.startsWith('/hr-dashboard')) {
      return 'HR Dashboard';
    } else if (pathname.startsWith('/vendor-dashboard')) {
      return 'Vendor Dashboard';
    }
    return 'Wellness Event Booking';
  };

  return (
    <nav className="bg-blue-600 text-white shadow-md">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center">
            <h1 className="text-xl font-bold">
              Wellness Event Booking
            </h1>
            <span className="ml-4 text-sm text-blue-100">
              {getPageTitle()}
            </span>
          </div>
          
          <div className="flex items-center space-x-4">
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
