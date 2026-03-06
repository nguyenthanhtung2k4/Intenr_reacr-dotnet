import { api, handleApiError } from '../../../core/api/httpClient';
import {
  MatchCreateData,
  MatchData,
  MatchScoreDetail,
  MatchScoreInput,
} from '../../../types/Match';
import { StandingData } from '../../../types/Standing';
import { TournamentData } from '../../../types/Tournament';

export const fetchGlobalMatches = async (): Promise<MatchData[]> => {
  try {
    const response = await api.get('/Matches');
    return response.data || [];
  } catch (error) {
    throw handleApiError(error, 'fetchGlobalMatches');
  }
};

export const createMatch = async (matchData: MatchCreateData) => {
  try {
    const response = await api.post('/Matches', matchData);
    return response.data;
  } catch (error) {
    throw handleApiError(error, 'createMatch');
  }
};

export const updateMatch = async (id: number, matchData: MatchCreateData) => {
  try {
    const response = await api.put(`/Matches/${id}`, matchData);
    return response.data;
  } catch (error) {
    throw handleApiError(error, 'updateMatch');
  }
};

export const deleteMatch = async (id: number) => {
  try {
    const response = await api.put(`/Matches/${id}`, { isDelete: true });
    return response.data;
  } catch (error) {
    throw handleApiError(error, 'deleteMatch');
  }
};

export const fetchTournaments = async (): Promise<TournamentData[]> => {
  try {
    const response = await api.get('/Tournaments');
    return response.data || [];
  } catch (error) {
    throw handleApiError(error, 'fetchTournaments');
  }
};

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

export const fetchLeagueStandings = async (): Promise<StandingData[]> => {
  try {
    const response = await api.get('/Standings');
    return response.data || [];
  } catch (error) {
    throw handleApiError(error, 'fetchLeagueStandings');
  }
};

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

export const fetchMatchScores = async (matchId: number): Promise<MatchScoreDetail> => {
  try {
    const response = await api.get(`/Matches/${matchId}/scores`);
    return response.data;
  } catch (error) {
    throw handleApiError(error, 'fetchMatchScores');
  }
};

export const submitMatchScores = async (data: MatchScoreInput) => {
  try {
    const response = await api.post('/Matches/match-scores', data);
    return response.data;
  } catch (error) {
    throw handleApiError(error, 'submitMatchScores');
  }
};
