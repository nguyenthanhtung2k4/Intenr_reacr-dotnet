import { ReactNode } from 'react';
import { AuthProvider } from '../context/AuthContext';
import { ToastProvider } from '../context/ToastContext';

interface AppProvidersProps {
  children: ReactNode;
}

export const AppProviders = ({ children }: AppProvidersProps) => {
  return (
    <ToastProvider>
      <AuthProvider>{children}</AuthProvider>
    </ToastProvider>
  );
};
