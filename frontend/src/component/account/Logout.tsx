import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './Auth';

export const LogoutButton = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLogout = async () => {
    console.log('Logging out...');
    try {
      await logout();
      console.log('Logout successful!');
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return <button onClick={handleLogout}>Logout</button>;
};
