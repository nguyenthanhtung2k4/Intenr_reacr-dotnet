import { api, handleApiError } from '../../../core/api/httpClient';
import { Bowler } from '../../../types/Bowler';
import { Team } from '../../../types/Team';
import { normalizeBowler } from '../../bowlers/api/bowlersApi';

const normalizeTeam = (team: any): Team => ({
  TeamId: team?.TeamId ?? team?.teamId ?? team?.id,
  teamName: team?.teamName ?? team?.TeamName ?? team?.name ?? '',
  captainId: team?.captainId ?? team?.CaptainId ?? null,
});

export const fetchTeams = async (): Promise<Team[]> => {
  try {
    const response = await api.get('/Teams');
    return (response.data || []).map(normalizeTeam);
  } catch (error) {
    throw handleApiError(error, 'fetchTeams');
  }
};

export const fetchTeamBowlers = async (teamId: string): Promise<Bowler[]> => {
  try {
    const response = await api.get(`/Teams/${teamId}/bowlers`);
    return (response.data || []).map(normalizeBowler);
  } catch (error) {
    throw handleApiError(error, 'fetchTeamBowlers');
  }
};

export const createTeam = async (teamData: { TeamName: string; CaptainId: number | null }) => {
  try {
    const response = await api.post('/Teams', teamData);
    return response.data;
  } catch (error) {
    throw handleApiError(error, 'createTeam');
  }
};

export const deleteTeam = async (id: number) => {
  try {
    const response = await api.patch(`/Teams/${id}`, { isDelete: true });
    return response.data;
  } catch (error) {
    throw handleApiError(error, 'deleteTeam');
  }
};

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

export type { Team, Bowler };
