import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';

import { Toast } from '../shared/ui/Toast';

type ToastType = 'success' | 'error' | 'warning' | 'info';

interface ToastMessage {
  id: number;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  showToast: (message: string, type: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider = ({ children }: { children: ReactNode }) => {
  // messages: Mảng chứa tất cả thông báo hiện tại
  const [messages, setMessages] = useState<ToastMessage[]>([]);

  // Hàm hiển thị thông báo mới
  const showToast = useCallback((message: string, type: ToastType) => {
    const id = Date.now();
    const newToast: ToastMessage = { id, message, type };

    setMessages((prevMessages) => [newToast, ...prevMessages]);

    setTimeout(() => {
      setMessages((prevMessages) => prevMessages.filter((msg) => msg.id !== id));
    }, 5000);
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <Toast messages={messages} />
    </ToastContext.Provider>
  );
};

// 3. Custom Hook để sử dụng Toast
export const useToast = () => {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

export default ToastContext;
