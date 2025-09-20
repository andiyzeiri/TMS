"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import { apiClient } from "@/lib/api-client";

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  organization_id: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

const REFRESH_INTERVAL = 14 * 60 * 1000; // 14 minutes (tokens expire in 15 minutes)
const STORAGE_KEY = 'tms_user';

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const handleLogout = useCallback(() => {
    setUser(null);
    localStorage.removeItem(STORAGE_KEY);
    router.push('/login');
  }, [router]);

  const refreshAuth = useCallback(async () => {
    try {
      const response = await apiClient.refreshToken();
      const userData = response.user;

      setUser(userData);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(userData));

      return userData;
    } catch (error: any) {
      console.error('Auth refresh failed:', error);

      // If refresh fails with 401, user needs to log in again
      if (error.status === 401) {
        handleLogout();
      }

      throw error;
    }
  }, [handleLogout]);

  // Initialize user from localStorage on mount
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // In development mode, create a mock user to bypass auth
        if (process.env.NODE_ENV === 'development') {
          const mockUser = {
            id: '1',
            name: 'Dev User',
            email: 'dev@example.com',
            role: 'admin',
            organization_id: '1'
          };
          setUser(mockUser);
          localStorage.setItem(STORAGE_KEY, JSON.stringify(mockUser));
          setLoading(false);
          return;
        }

        const storedUser = localStorage.getItem(STORAGE_KEY);
        if (storedUser) {
          const parsedUser = JSON.parse(storedUser);
          setUser(parsedUser);
        }

        // Try to refresh auth to verify cookies are still valid
        await refreshAuth();
      } catch (error) {
        console.error('Auth initialization failed:', error);
        // Clear invalid stored user
        localStorage.removeItem(STORAGE_KEY);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, [refreshAuth]);

  // Set up automatic token refresh (skip in development mode)
  useEffect(() => {
    if (!user || process.env.NODE_ENV === 'development') return;

    const interval = setInterval(() => {
      refreshAuth().catch((error) => {
        console.error('Auto refresh failed:', error);
        // If refresh fails, redirect to login
        handleLogout();
      });
    }, REFRESH_INTERVAL);

    return () => clearInterval(interval);
  }, [user, refreshAuth, handleLogout]);

  const login = useCallback(async (email: string, password: string) => {
    try {
      setLoading(true);
      const response = await apiClient.login({
        email,
        password,
      });

      const userData = response.user;
      setUser(userData);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(userData));

      // Redirect to dashboard or intended page
      const redirectTo = sessionStorage.getItem('auth_redirect') || '/dashboard';
      sessionStorage.removeItem('auth_redirect');
      router.push(redirectTo);
    } catch (error: any) {
      console.error('Login failed:', error);
      throw new Error(
        error.message || 'Login failed. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  }, [router]);

  const logout = useCallback(async () => {
    try {
      // Call logout endpoint to clear httpOnly cookies
      await apiClient.logout();
    } catch (error) {
      console.error('Logout request failed:', error);
      // Continue with client-side cleanup even if server request fails
    } finally {
      handleLogout();
    }
  }, [handleLogout]);

  const value: AuthContextType = {
    user,
    loading,
    login,
    logout,
    refreshAuth,
  };

  return (
    <AuthContext.Provider value={value}>
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

// Hook for protecting routes
export function useRequireAuth() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      // Store intended destination
      sessionStorage.setItem('auth_redirect', window.location.pathname);
      router.push('/login');
    }
  }, [user, loading, router]);

  return { user, loading };
}