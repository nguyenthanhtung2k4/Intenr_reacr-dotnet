// src/components/Toast.tsx

import React from 'react';

type ToastType = 'success' | 'error' | 'warning' | 'info';

interface ToastMessage {
  id: number;
  message: string;
  type: ToastType;
}

interface ToastProps {
  messages: ToastMessage[];
}

const getStyle = (type: ToastType): { bgColor: string; icon: string } => {
  switch (type) {
    case 'success':
      return { bgColor: 'bg-green-500', icon: '✅' };
    case 'error':
      return { bgColor: 'bg-red-500', icon: '❌' };
    case 'warning':
      return { bgColor: 'bg-yellow-500', icon: '⚠️' };
    case 'info':
    default:
      return { bgColor: 'bg-blue-500', icon: 'ℹ️' };
  }
};

export const Toast: React.FC<ToastProps> = ({ messages }) => {
  return (
    <div className="fixed top-4 right-4 z-[100] space-y-2 pointer-events-none">
      {messages.map((toast) => {
        const { bgColor, icon } = getStyle(toast.type);

        return (
          <div
            key={toast.id}
            className={`flex items-center p-4 text-white rounded-lg shadow-lg max-w-sm 
                        ${bgColor} transform transition-opacity duration-300 ease-out 
                        opacity-100 hover:opacity-90 pointer-events-auto`}
            role="alert"
          >
            <div className="text-xl mr-3">{icon}</div>
            <div>
              <span className="font-medium">{toast.message}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
};
