// service/api.service.tsx
import axios from 'axios';
import { Bowler } from '../types/Bowler';
import { Team } from '../types/Team';
import { Acc } from '../types/Accounts';

export interface LoginCredentials {
  email: string;
  password: string;
}

const URL_API = process.env.REACT_APP_API_URL;
const BOWLING_API_URL = `${URL_API}/BowlingLeague`;

if (!URL_API) {
  console.error('Lỗi cấu hình: Không tìm thấy REACT_APP_API_URL trong .env.');
}

// 1. KHỞI TẠO AXIOS INSTANCE VÀ QUẢN LÝ TOKEN
let authToken = localStorage.getItem('jwtToken');
const api = axios.create({
  // <--- TẠO CUSTOM AXIOS INSTANCE
  baseURL: BOWLING_API_URL,
  headers: {
    Authorization: authToken ? `Bearer ${authToken}` : '',
  },
});

export const setAuthToken = (token: string | null) => {
  if (token) {
    authToken = token;
    localStorage.setItem('jwtToken', token);
    api.defaults.headers.Authorization = `Bearer ${token}`;
  } else {
    authToken = null;
    localStorage.removeItem('jwtToken');
    api.defaults.headers.Authorization = '';
  }
};

const handleApiError = (error: any, functionName: string): never => {
  let errorMessage = `Lỗi khi giao tiếp với API (${functionName}).`;
  if (axios.isAxiosError(error)) {
    if (error.response) {
      errorMessage += ` Status: ${error.response.status}. Chi tiết: ${
        error.response.data.message || JSON.stringify(error.response.data)
      }`;
      if (error.response.status === 401) {
        setAuthToken(null);
      }
    } else if (error.request) {
      errorMessage = `Lỗi kết nối mạng (${functionName}). Vui lòng kiểm tra server.`;
    }
  } else {
    errorMessage += ` Lỗi không xác định: ${error.message}`;
  }
  console.error(`API Error in ${functionName}:`, error);
  throw new Error(errorMessage);
};

// 1. Lấy danh sách Bowlers
export const fetchAllBowlers = async (): Promise<Bowler[]> => {
  try {
    const response = await api.get('/');
    return response.data || [];
  } catch (error) {
    throw handleApiError(error, 'fetchAllBowlers');
  }
};

// 2. Lấy chi tiết Bowler theo ID
export const fetchBowlerDetails = async (id: string): Promise<Bowler> => {
  try {
    const response = await api.get(`/${id}`);
    return response.data;
  } catch (error) {
    throw handleApiError(error, 'fetchBowlerDetails');
  }
};

// 3. Lưu (Tạo mới hoặc Cập nhật) Bowler
export const saveBowler = async (bowlerData: any, id?: string | number) => {
  try {
    if (id && id !== 'new') {
      const response = await api.patch(`/${id}`, bowlerData);
      return response.data;
    } else {
      const response = await api.post('/', bowlerData);
      return response.data;
    }
  } catch (error) {
    throw handleApiError(error, 'saveBowler');
  }
};

// 4. Xóa mềm (Soft Delete) Bowler
export const softDeleteBowler = async (id: string) => {
  try {
    const payload = { isDeleted: true };
    const response = await api.patch(`/${id}`, payload);
    return response.data;
  } catch (error) {
    throw handleApiError(error, 'softDeleteBowler');
  }
};

// --- TEAM API FUNCTIONS ---

// 5. Lấy danh sách Teams
export const fetchTeams = async (): Promise<Team[]> => {
  try {
    const response = await api.get(`/teams`);
    return response.data || [];
  } catch (error) {
    throw handleApiError(error, 'fetchTeams');
  }
};

// 6. Lấy danh sách Bowlers theo Team ID
export const fetchTeamBowlers = async (teamId: string): Promise<Bowler[]> => {
  try {
    const response = await api.get(`/teams/${teamId}/bowlers`);
    return response.data || [];
  } catch (error) {
    throw handleApiError(error, 'fetchTeamBowlers');
  }
};

// 7. Tạo mới Team
export const createTeam = async (teamData: {
  TeamName: string;
  CaptainId: number | null;
}) => {
  try {
    const response = await api.post(`/teams`, teamData);
    return response.data;
  } catch (error) {
    throw handleApiError(error, 'createTeam');
  }
};

// 7.1. Thêm accounts
export const createAccounts = async (accountData: {
  Email: string;
  Password: string;
  Role: string | null;
}) => {
  try {
    const response = await api.post(`/accounts`, accountData);
    return response.data;
  } catch (error) {
    throw handleApiError(error, 'accounts');
  }
};

// 7.2 Lấy danh sách Accounts
export const fetchAccounts = async (): Promise<Acc[]> => {
  try {
    const response = await api.get(`/accounts`);
    return response.data || [];
  } catch (error) {
    throw handleApiError(error, 'fetchAccounts');
  }
};
// 7.3 Lấy danh sách Accounts
export const Details = async (id: string): Promise<Acc[]> => {
  try {
    const response = await api.get(`/accounts/${id}`);
    return response.data || [];
  } catch (error) {
    throw handleApiError(error, 'fetchAccountsDetails');
  }
};

// 8. Đăng nhập (Sử dụng POST)
// ENDPOINT: /api/BowlingLeague/login
export const loginAccount = async (
  credentials: LoginCredentials,
): Promise<void> => {
  try {
    const response = await api.post(`/login`, credentials);
    const token = response.data.token;
    if (token) {
      setAuthToken(token);
    }
  } catch (error) {
    throw handleApiError(error, 'loginAccount');
  }
};

// 9. Kiểm tra Session (Is Authenticated)
// ENDPOINT: /api/BowlingLeague/is-authenticated
export const checkAuthStatus = async (): Promise<{
  isAuthenticated: boolean;
  userId?: string;
}> => {
  if (!authToken) {
    return { isAuthenticated: false };
  }
  try {
    const response = await api.get(`/is-authenticated`);
    return response.data;
  } catch (error) {
    return { isAuthenticated: false };
  }
};

// 10. Đăng xuất (Sử dụng POST)
// ENDPOINT: /api/BowlingLeague/Logout
export const logoutAccount = async (): Promise<void> => {
  try {
    await api.post(`/Logout`);
    setAuthToken(null);
  } catch (error) {
    console.warn('Logout API warning (might be already logged out):', error);
    setAuthToken(null);
  }
};
