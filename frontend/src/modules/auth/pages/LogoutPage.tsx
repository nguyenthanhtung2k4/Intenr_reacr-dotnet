import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { useToast } from '../../../context/ToastContext';

export default function LogoutButton() {
  const navigate = useNavigate();
  const toast = useToast();
  const { isAuthenticated, logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
      toast.showToast('Đăng xuất thành công!', 'success');
      navigate('/auth/login');
    } catch (error) {
      console.error('Lỗi Đăng xuất:', error);
      toast.showToast('Lỗi khi đăng xuất!', 'error');
    }
  };

  const handleLoginNavigation = () => {
    navigate('/auth/login');
  };

  return (
    <>
      {isAuthenticated ? (
        <button
          onClick={handleLogout}
          className="text-red-600 font-medium hover:text-red-800 transition duration-150"
          type="button"
        >
          Đăng xuất
        </button>
      ) : (
        <button
          onClick={handleLoginNavigation}
          className="text-indigo-600 font-medium hover:text-indigo-800 transition duration-150"
          type="button"
        >
          Đăng nhập
        </button>
      )}
    </>
  );
}
