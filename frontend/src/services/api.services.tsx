// service/api.service.tsx
import axios, { AxiosInstance } from 'axios';
import { Bowler, BowlerStatsData } from '../types/Bowler';
import { Team } from '../types/Team';
import { Acc } from '../types/Accounts';
import { MatchCreateData, MatchData, MatchScoreDetail, MatchScoreInput } from '../types/Match';
import { TournamentData } from '../types/Tourname';
import { StandingData } from '../types/Standing';
export type { Bowler, Team, Acc };

export interface LoginCredentials {
  email: string;
  password: string;
}
const URL_API = process.env.REACT_APP_API_URL;

if (!URL_API) {
  console.error('Lỗi cấu hình: Không tìm thấy REACT_APP_API_URL trong .env.');
}
// 1. Khởi tạo instance với URL gốc
const api = axios.create({
  baseURL: URL_API,
});

// 2. TOKEN INTERCEPTOR
api.interceptors.request.use((config) => {
  // Cập nhật token mới nhất từ localStorage
  const token = localStorage.getItem('jwtToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Deprecated: No-op as we use full paths now
export const setApiContext = (path: string) => {
  // currentSubPath = path;
};

// 1. KHỞI TẠO AXIOS INSTANCE VÀ QUẢN LÝ TOKEN
let authToken = localStorage.getItem('jwtToken');

export const setAuthToken = (token: string | null) => {
  if (token) {
    authToken = token;
    localStorage.setItem('jwtToken', token);
    api.defaults.headers.common.Authorization = `Bearer ${token}`;
  } else {
    authToken = null;
    localStorage.removeItem('jwtToken');
    api.defaults.headers.common.Authorization = '';
  }
};

const handleApiError = (error: any, functionName: string): never => {
  let errorMessage = `Lỗi khi giao tiếp với API (${functionName}).`;
  if (axios.isAxiosError(error)) {
    if (error.response) {
      errorMessage += ` Status: ${error.response.status}. Chi tiết: ${error.response.data.message || JSON.stringify(error.response.data)}`;
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

const normalizeBowler = (b: any): Bowler => {
  const teamRaw = b?.team ?? b?.Team;
  const rawZip = b?.bowlerZip ?? b?.BowlerZip;
  const parsedZip = Number(rawZip);

  return {
    BowlerId: b?.BowlerId ?? b?.bowlerId ?? b?.id ?? 0,
    isDelete: b?.isDelete ?? b?.IsDelete ?? false,
    bowlerLastName: b?.bowlerLastName ?? b?.BowlerLastName ?? '',
    bowlerFirstName: b?.bowlerFirstName ?? b?.BowlerFirstName ?? '',
    bowlerMiddleInit: b?.bowlerMiddleInit ?? b?.BowlerMiddleInit ?? null,
    bowlerAddress: b?.bowlerAddress ?? b?.BowlerAddress ?? '',
    bowlerCity: b?.bowlerCity ?? b?.BowlerCity ?? '',
    bowlerState: b?.bowlerState ?? b?.BowlerState ?? '',
    bowlerZip: Number.isFinite(parsedZip) ? parsedZip : 0,
    bowlerPhoneNumber: b?.bowlerPhoneNumber ?? b?.BowlerPhoneNumber ?? '',
    teamId: b?.teamId ?? b?.TeamId ?? b?.TeamID ?? b?.teamID ?? 0,
    team: teamRaw
      ? {
          teamID:
            teamRaw.teamID ?? teamRaw.TeamId ?? teamRaw.TeamID ?? teamRaw.id ?? teamRaw.teamId ?? 0,
          teamName: teamRaw.teamName ?? teamRaw.TeamName ?? teamRaw.name ?? '',
        }
      : { teamID: 0, teamName: '' },
  };
};

// 1. Lấy danh sách Bowlers
export const fetchAllBowlers = async (): Promise<Bowler[]> => {
  try {
    const response = await api.get('/BowlingLeague');
    const data = response.data || [];
    return data.map(normalizeBowler);
  } catch (error) {
    throw handleApiError(error, 'fetchAllBowlers');
  }
};

// 2. Lấy chi tiết Bowler theo ID
export const fetchBowlerDetails = async (id: string): Promise<Bowler> => {
  try {
    const response = await api.get(`/BowlingLeague/${id}`);
    return normalizeBowler(response.data);
  } catch (error) {
    throw handleApiError(error, 'fetchBowlerDetails');
  }
};

// 3. Lưu (Tạo mới hoặc Cập nhật) Bowler
export const saveBowler = async (bowlerData: any, id?: string | number) => {
  try {
    if (id && id !== 'new') {
      const response = await api.patch(`/BowlingLeague/${id}`, bowlerData);
      return normalizeBowler(response.data);
    } else {
      const response = await api.post('/BowlingLeague', bowlerData);
      return normalizeBowler(response.data);
    }
  } catch (error) {
    throw handleApiError(error, 'saveBowler');
  }
};

// 4. Xóa mềm (Soft Delete) Bowler
export const softDeleteBowler = async (id: string | number) => {
  try {
    // Validate ID
    if (!id || id === 0 || id === '0') {
      throw new Error('ID không hợp lệ để xóa');
    }

    const payload = { isDeleted: true };
    const response = await api.patch(`/BowlingLeague/${id}`, payload);
    return response.data;
  } catch (error) {
    throw handleApiError(error, 'softDeleteBowler');
  }
};

export const deleteBowler = softDeleteBowler;

// --- TEAM API FUNCTIONS ---

const normalizeTeam = (team: any): Team => ({
  TeamId: team?.TeamId ?? team?.teamId ?? team?.id,
  teamName: team?.teamName ?? team?.TeamName ?? team?.name ?? '',
  captainId: team?.captainId ?? team?.CaptainId ?? null,
});

// 5. Lấy danh sách Teams
export const fetchTeams = async (): Promise<Team[]> => {
  try {
    const response = await api.get('/Teams');
    const teams = response.data || [];
    return teams.map(normalizeTeam);
  } catch (error) {
    throw handleApiError(error, 'fetchTeams');
  }
};
// 6. Lấy danh sách Bowlers theo Team
export const fetchTeamBowlers = async (teamId: string): Promise<Bowler[]> => {
  try {
    const response = await api.get(`/Teams/${teamId}/bowlers`);
    const data = response.data || [];
    return data.map(normalizeBowler);
  } catch (error) {
    throw handleApiError(error, 'fetchTeamBowlers');
  }
};
// 7. Tạo mới Team
export const createTeam = async (teamData: { TeamName: string; CaptainId: number | null }) => {
  try {
    const response = await api.post(`/Teams`, teamData);
    return response.data;
  } catch (error) {
    throw handleApiError(error, 'createTeam');
  }
};

// 7.x Delete Team
export const deleteTeam = async (id: number) => {
  try {
    const payload = { isDelete: true };
    const response = await api.patch(`/Teams/${id}`, payload);
    return response.data;
  } catch (error) {
    throw handleApiError(error, 'softDeleteTeam');
  }
};

// 7.y Update Team
export const updateTeam = async (
  id: number,
  teamData: { teamName?: string; captainId?: number | null },
) => {
  try {
    const payload: any = {};
    if (teamData.teamName !== undefined) payload.teamName = teamData.teamName;
    if (teamData.captainId !== undefined) payload.captainId = teamData.captainId;

    const response = await api.patch(`/Teams/${id}`, payload);
    return response.data;
  } catch (error) {
    throw handleApiError(error, 'updateTeam');
  }
};

// 7.1. Thêm accounts
export const createAccounts = async (accountData: {
  Email: string;
  Password: string;
  Role: string | null;
}) => {
  try {
    const response = await api.post(`/BowlingLeague/accounts`, accountData);
    return response.data;
  } catch (error) {
    throw handleApiError(error, 'accounts');
  }
};

// /////////////////////////////////////////////////
// 7.2 Lấy danh sách Accounts

export const fetchAccounts = async (): Promise<Acc[]> => {
  try {
    const response = await api.get(`/BowlingLeague/accounts`);
    return response.data || [];
  } catch (error) {
    throw handleApiError(error, 'fetchAccounts');
  }
};
// 7.3 Cập nhật Accounts
export const fetchAccountUpdate = async (
  id: string,
  dataUpdate: {
    Email?: string;
    Password?: string;
    Role?: string;
  },
): Promise<Acc[]> => {
  try {
    const response = await api.put(`/BowlingLeague/accounts/${id}`, dataUpdate);
    return response.data;
  } catch (error) {
    throw handleApiError(error, 'fetchAccountUpdate');
  }
};
// 7.4 Xóa Accounts
export const fetchdeleteAccount = async (id: number) => {
  try {
    const dataDelete = { IsDelete: true };
    const response = await api.put(`/BowlingLeague/accounts/${id}`, dataDelete);
    return response.data;
  } catch (error) {
    throw handleApiError(error, 'deleteAccount');
  }
};

// 7.4 Lấy accounts  chi  tiết
export const fetchAccountsDetails = async (id: string): Promise<Acc> => {
  try {
    const response = await api.get(`/BowlingLeague/accounts/${id}`);
    return response.data || [];
  } catch (error) {
    throw handleApiError(error, 'fetchAccountsDetails');
  }
};

// 8. Đăng nhập (Sử dụng POST)
// ENDPOINT: /api/BowlingLeague/login
export const loginAccount = async (credentials: LoginCredentials): Promise<void> => {
  try {
    const response = await api.post(`/BowlingLeague/login`, credentials);
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
  role?: string;
}> => {
  if (!authToken) {
    return { isAuthenticated: false };
  }
  try {
    const response = await api.get(`/BowlingLeague/is-authenticated`);
    return response.data;
  } catch (error) {
    return { isAuthenticated: false };
  }
};

// 10. Đăng xuất (Sử dụng POST)
// ENDPOINT: /api/BowlingLeague/Logout
export const logoutAccount = async (): Promise<void> => {
  try {
    await api.post(`/BowlingLeague/Logout`);
    setAuthToken(null);
  } catch (error) {
    console.warn('Logout API warning (might be already logged out):', error);
    setAuthToken(null);
  }
};

// 11. Fetch Matches
export const fetchGlobalMatches = async (): Promise<MatchData[]> => {
  try {
    const response = await api.get('/Matches');
    return response.data || [];
  } catch (error) {
    throw handleApiError(error, 'fetchGlobalMatches');
  }
};

// 12. Create Match
export const createMatch = async (matchData: MatchCreateData) => {
  try {
    const response = await api.post('/Matches', matchData);
    return response.data;
  } catch (error) {
    throw handleApiError(error, 'createMatch');
  }
};

// 12.1 Update Match
export const updateMatch = async (id: number, matchData: MatchCreateData) => {
  try {
    const response = await api.put(`/Matches/${id}`, matchData);
    return response.data;
  } catch (error) {
    throw handleApiError(error, 'updateMatch');
  }
};

// 12.2 Delete Match
// export const deleteMatch = async (id: number) => {
//   try {
//     const response = await api.delete(`/Matches/${id}`);
//     return response.data;
//   } catch (error) {
//     throw handleApiError(error, 'deleteMatch');
//   }
// };

export const deleteMatch = async (id: number) => {
  try {
    const response = await api.put(`/Matches/${id}`, { isDelete: true });
    return response.data;
  } catch (error) {
    throw handleApiError(error, 'deleteMatch');
  }
};

// 13. Fetch Tournaments
export const fetchTournaments = async (): Promise<TournamentData[]> => {
  try {
    const response = await api.get('/Tournaments');
    return response.data || [];
  } catch (error) {
    throw handleApiError(error, 'fetchTournaments');
  }
};

// 13.1 Create Tournament
export const createTournament = async (tournamentData: {
  tourneyLocation: string;
  tourneyDate: string;
}) => {
  try {
    const response = await api.post('/Tournaments', tournamentData);
    return response.data;
  } catch (error) {
    throw handleApiError(error, 'createTournament');
  }
};

// 13.2 Update Tournament
export const updateTournament = async (
  id: number,
  tournamentData: { tourneyLocation: string; tourneyDate: string },
) => {
  try {
    const response = await api.put(`/Tournaments/${id}`, {
      tourneyId: id,
      ...tournamentData,
    });
    return response.data;
  } catch (error) {
    throw handleApiError(error, 'updateTournament');
  }
};

// 13.3 Delete Tournament (Soft Delete)
export const deleteTournament = async (id: number) => {
  try {
    const response = await api.put(`/Tournaments/${id}`, {
      tourneyId: id,
      isDelete: true,
    });
    return response.data;
  } catch (error) {
    throw handleApiError(error, 'deleteTournament');
  }
};

// 14. Fetch Standings
export const fetchLeagueStandings = async (): Promise<StandingData[]> => {
  try {
    const response = await api.get('/Standings');
    return response.data || [];
  } catch (error) {
    throw handleApiError(error, 'fetchLeagueStandings');
  }
};

// 15. Update Team Standing (Admin only)
export const updateTeamStanding = async (
  teamId: number,
  data: { manualWins?: number; manualLosses?: number; manualPoints?: number },
) => {
  try {
    const response = await api.put(`/Standings/${teamId}`, data);
    return response.data;
  } catch (error) {
    throw handleApiError(error, 'updateTeamStanding');
  }
};

// 16. Fetch Bowler Stats
export const fetchBowlerStats = async (): Promise<BowlerStatsData[]> => {
  try {
    const response = await api.get('/BowlingLeague/bowler-stats');
    return response.data || [];
  } catch (error) {
    throw handleApiError(error, 'fetchBowlerStats');
  }
};

// 17. Get Match Scores Detail
export const fetchMatchScores = async (matchId: number): Promise<MatchScoreDetail> => {
  try {
    const response = await api.get(`/Matches/${matchId}/scores`);
    return response.data;
  } catch (error) {
    throw handleApiError(error, 'fetchMatchScores');
  }
};

// 18. Submit Match Scores (Admin)
export const submitMatchScores = async (data: MatchScoreInput) => {
  try {
    const response = await api.post('/Matches/match-scores', data);
    return response.data;
  } catch (error) {
    throw handleApiError(error, 'submitMatchScores');
  }
};
