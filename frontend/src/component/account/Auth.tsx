// src/context/AuthContext.tsx

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react';
// Sửa import để lấy các hàm Auth đã sửa đổi
import {
  loginAccount,
  logoutAccount,
  checkAuthStatus,
} from '../../services/api.services'; // Đảm bảo đường dẫn này đúng

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  // Nếu cần, bạn có thể lưu thông tin user ID, email... ở đây
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // --- 1. KIỂM TRA TRẠNG THÁI KHI ỨNG DỤNG KHỞI ĐỘNG ---
  useEffect(() => {
    const checkStatus = async () => {
      try {
        const response = await checkAuthStatus(); // Sử dụng hàm mới
        setIsAuthenticated(response.isAuthenticated);
        console.log('Is Authenticated:', response.isAuthenticated);
      } catch (error) {
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };
    checkStatus();
  }, []);

  // --- 2. HÀM LOGIN ---
  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      await loginAccount({ email, password }); // Sử dụng hàm mới
      setIsAuthenticated(true);
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // --- 3. HÀM LOGOUT ---
  const logout = async () => {
    setIsLoading(true);
    try {
      await logoutAccount();
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, isLoading, login, logout }}>
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
