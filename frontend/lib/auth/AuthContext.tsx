'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api';

interface User {
  id: string;
  username: string;
  role: string;
  companyId?: string;
  vendorId?: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  logout: () => Promise<void>;
  refreshUser: (callback?: () => void) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = () => {
      const token = apiClient.getToken();
      
      if (!token) {
        setIsLoading(false);
        return;
      }

      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        setUser({
          id: payload.sub,
          username: payload.username,
          role: payload.role,
          companyId: payload.companyId,
          vendorId: payload.vendorId,
        });
      } catch (error) {
        // Invalid token format
        apiClient.clearTokens();
        setUser(null);
      }
      
      setIsLoading(false);
    };

    checkAuth();
  }, [router]);

  const refreshUser = (callback?: () => void) => {
    const token = apiClient.getToken();
    
    if (!token) {
      setUser(null);
      if (callback) {
        setTimeout(callback, 0);
      }
      return;
    }

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      setUser({
        id: payload.sub,
        username: payload.username,
        role: payload.role,
        companyId: payload.companyId,
        vendorId: payload.vendorId,
      });
      if (callback) {
        setTimeout(callback, 0);
      }
    } catch (error) {
      apiClient.clearTokens();
      setUser(null);
      if (callback) {
        setTimeout(callback, 0);
      }
    }
  };

  const logout = async () => {
    try {
      await apiClient.logout();
    } catch (error) {
    } finally {
      setUser(null);
      router.push('/login');
    }
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
