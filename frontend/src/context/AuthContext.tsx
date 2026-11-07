import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  switchGateway,
  type SwitchAuthUser,
  type SwitchAuthConfig,
} from '../services/switchGateway';

interface AuthContextType {
  user: SwitchAuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  authConfig: SwitchAuthConfig | null;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  checkSession: () => Promise<SwitchAuthUser | null>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<SwitchAuthUser | null>(null);
  const [authConfig, setAuthConfig] = useState<SwitchAuthConfig | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Probe server auth configuration unauthenticated
  const loadAuthConfig = useCallback(async () => {
    try {
      const res = await switchGateway.getAuthConfig();
      if (res.data) {
        setAuthConfig(res.data);
      }
    } catch {
      // Ignore if offline
    }
  }, []);

  // Validate session cookie with GET /gateway/auth/me
  const checkSession = useCallback(async (): Promise<SwitchAuthUser | null> => {
    try {
      const res = await switchGateway.getCurrentUser();
      if (res.data && res.status === 200) {
        setUser(res.data);
        return res.data;
      }
      setUser(null);
      return null;
    } catch {
      setUser(null);
      return null;
    }
  }, []);

  useEffect(() => {
    let isMounted = true;
    const initializeAuth = async () => {
      setIsLoading(true);
      await Promise.all([loadAuthConfig(), checkSession()]);
      if (isMounted) {
        setIsLoading(false);
      }
    };

    void initializeAuth();
    return () => {
      isMounted = false;
    };
  }, [loadAuthConfig, checkSession]);

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const res = await switchGateway.login(email.trim(), password);
      if (res.data && res.status === 200) {
        setUser(res.data);
        return { success: true };
      }
      return {
        success: false,
        error: res.error || 'Invalid credentials or login failed',
      };
    } catch (err: unknown) {
      return {
        success: false,
        error: (err as Error)?.message || 'An unexpected authentication error occurred',
      };
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await switchGateway.logout();
    } finally {
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        authConfig,
        login,
        logout,
        checkSession,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

