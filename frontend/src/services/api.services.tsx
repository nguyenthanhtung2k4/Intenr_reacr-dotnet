import axios from 'axios';
import { Bowler } from '../types/Bowler';
import { Team } from '../types/Team';

const URL_API = process.env.REACT_APP_API_URL;
const BOWLING_API_URL = `${URL_API}/BowlingLeague`;

if (!URL_API) {
  console.error('Lỗi cấu hình: Không tìm thấy REACT_APP_API_URL trong .env.');
}

// Hàm tiện ích để xử lý lỗi API và ném ra lỗi có ý nghĩa hơn
const handleApiError = (error: any, functionName: string): never => {
  let errorMessage = `Lỗi khi giao tiếp với API (${functionName}).`;
  if (axios.isAxiosError(error)) {
    if (error.response) {
      errorMessage += ` Status: ${error.response.status}. Chi tiết: ${
        error.response.data.message || JSON.stringify(error.response.data)
      }`;
    } else if (error.request) {
      errorMessage = `Lỗi kết nối mạng (${functionName}). Vui lòng kiểm tra server.`;
    }
  } else {
    errorMessage += ` Lỗi không xác định: ${error.message}`;
  } // Added missing semicolon
  console.error(`API Error in ${functionName}:`, error);
  throw new Error(errorMessage);
};

// --- BOWLER API FUNCTIONS ---

// 1. Lấy danh sách Bowlers
export const fetchAllBowlers = async (): Promise<Bowler[]> => {
  try {
    const response = await axios.get(BOWLING_API_URL);
    return response.data || [];
  } catch (error) {
    throw handleApiError(error, 'fetchAllBowlers'); // Explicitly throw the error
  }
};

// 2. Lấy chi tiết Bowler theo ID
export const fetchBowlerDetails = async (id: string): Promise<Bowler> => {
  try {
    const response = await axios.get(`${BOWLING_API_URL}/${id}`);
    return response.data;
  } catch (error) {
    throw handleApiError(error, 'fetchBowlerDetails'); // Explicitly throw the error
  }
};

// 3. Lưu (Tạo mới hoặc Cập nhật) Bowler
export const saveBowler = async (bowlerData: any, id?: string | number) => {
  try {
    if (id && id !== 'new') {
      // PUT cho cập nhật (Edit)
      const response = await axios.put(`${BOWLING_API_URL}/${id}`, bowlerData);
      return response.data;
    } else {
      // POST cho tạo mới (Create)
      const response = await axios.post(BOWLING_API_URL, bowlerData);
      return response.data;
    }
  } catch (error) {
    throw handleApiError(error, 'saveBowler'); // Explicitly throw the error
  }
};

// 4. Xóa mềm (Soft Delete) Bowler
export const softDeleteBowler = async (id: string) => {
  try {
    const payload = { isDeleted: true };
    const response = await axios.put(`${BOWLING_API_URL}/${id}`, payload);
    return response.data;
  } catch (error) {
    // Added type for error
    throw handleApiError(error, 'softDeleteBowler'); // Explicitly throw the error
  }
};

// --- TEAM API FUNCTIONS ---

// 5. Lấy danh sách Teams
export const fetchTeams = async (): Promise<Team[]> => {
  try {
    const response = await axios.get(`${BOWLING_API_URL}/teams`);
    return response.data || [];
  } catch (error) {
    throw handleApiError(error, 'fetchTeams'); // Explicitly throw the error
  }
};

// 6. Lấy danh sách Bowlers theo Team ID
export const fetchTeamBowlers = async (teamId: string): Promise<Bowler[]> => {
  try {
    const response = await axios.get(
      `${BOWLING_API_URL}/teams/${teamId}/bowlers`,
    );
    return response.data || [];
  } catch (error) {
    throw handleApiError(error, 'fetchTeamBowlers'); // Explicitly throw the error
  }
};

// 7. Tạo mới Team
export const createTeam = async (teamData: {
  TeamName: string;
  CaptainId: number | null;
}) => {
  try {
    const response = await axios.post(`${BOWLING_API_URL}/teams`, teamData);
    return response.data;
  } catch (error) {
    handleApiError(error, 'createTeam');
  }
};
