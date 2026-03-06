// src/context/AuthContext.tsx

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { loginAccount, logoutAccount, checkAuthStatus } from '../modules/auth/api/authApi';

interface AuthContextType {
  isAuthenticated: boolean;
  role: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [role, setRole] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkStatus = async () => {
      try {
        const response = await checkAuthStatus();
        setIsAuthenticated(response.isAuthenticated);
        setRole(response.role || null);
        console.log('Is Authenticated:', response.isAuthenticated, 'Role:', response.role);
      } catch (error) {
        setIsAuthenticated(false);
        setRole(null);
      } finally {
        setIsLoading(false);
      }
    };
    checkStatus();
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      await loginAccount({ email, password });
      // Re-check status to get role
      const response = await checkAuthStatus();
      setIsAuthenticated(response.isAuthenticated);
      setRole(response.role || null);
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await logoutAccount();
      setIsAuthenticated(false);
      setRole(null);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, role, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
