import { api, handleApiError, setAuthToken } from '../../../core/api/httpClient';

export interface LoginCredentials {
  email: string;
  password: string;
}

export const loginAccount = async (credentials: LoginCredentials): Promise<void> => {
  try {
    const response = await api.post('/BowlingLeague/login', credentials);
    const token = response.data.token;
    if (token) {
      setAuthToken(token);
    }
  } catch (error) {
    throw handleApiError(error, 'loginAccount');
  }
};

export const checkAuthStatus = async (): Promise<{
  isAuthenticated: boolean;
  userId?: string;
  role?: string;
}> => {
  try {
    const token = localStorage.getItem('jwtToken');
    if (!token) {
      return { isAuthenticated: false };
    }
    const response = await api.get('/BowlingLeague/is-authenticated');
    return response.data;
  } catch {
    return { isAuthenticated: false };
  }
};

export const logoutAccount = async (): Promise<void> => {
  try {
    await api.post('/BowlingLeague/Logout');
    setAuthToken(null);
  } catch (error) {
    console.warn('Logout warning:', error);
    setAuthToken(null);
  }
};

export { setAuthToken };
