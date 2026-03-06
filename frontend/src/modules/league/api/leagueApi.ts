import { api, handleApiError } from '../../../core/api/httpClient';
import {
  MatchCreateData,
  MatchData,
  MatchScoreDetail,
  MatchScoreInput,
} from '../../../types/Match';
import { StandingData } from '../../../types/Standing';
import { TournamentData } from '../../../types/Tournament';

const toNumberOrUndefined = (value: any): number | undefined => {
  if (value === null || value === undefined || value === '') return undefined;
  const num = Number(value);
  return Number.isFinite(num) ? num : undefined;
};

const toNumber = (value: any, fallback = 0): number => {
  const num = Number(value);
  return Number.isFinite(num) ? num : fallback;
};

const normalizeMatch = (match: any): MatchData => {
  const oddLaneWins = toNumberOrUndefined(match?.oddLaneWins ?? match?.OddLaneWins);
  const evenLaneWins = toNumberOrUndefined(match?.evenLaneWins ?? match?.EvenLaneWins);
  const winningTeamId =
    toNumberOrUndefined(match?.winningTeamId ?? match?.WinningTeamId) ??
    toNumberOrUndefined(match?.winnerTeamId ?? match?.WinnerTeamId);
  const hasResultRaw = match?.hasResult ?? match?.HasResult;

  const hasResult =
    typeof hasResultRaw === 'boolean'
      ? hasResultRaw
      : Boolean(
          winningTeamId !== undefined ||
          match?.winningTeamName ||
          match?.WinningTeamName ||
          oddLaneWins !== undefined ||
          evenLaneWins !== undefined,
        );

  return {
    matchId: toNumber(match?.matchId ?? match?.MatchId ?? match?.id),
    tourneyLocation: match?.tourneyLocation ?? match?.TourneyLocation ?? '',
    tourneyDate: match?.tourneyDate ?? match?.TourneyDate ?? '',
    oddLaneTeam: match?.oddLaneTeam ?? match?.OddLaneTeam ?? '',
    evenLaneTeam: match?.evenLaneTeam ?? match?.EvenLaneTeam ?? '',
    lanes: match?.lanes ?? match?.Lanes ?? '',
    tourneyId: toNumberOrUndefined(match?.tourneyId ?? match?.TourneyId),
    oddLaneTeamId: toNumberOrUndefined(match?.oddLaneTeamId ?? match?.OddLaneTeamId),
    evenLaneTeamId: toNumberOrUndefined(match?.evenLaneTeamId ?? match?.EvenLaneTeamId),
    hasResult,
    winningTeamId,
    winningTeamName: match?.winningTeamName ?? match?.WinningTeamName,
    oddLaneWins,
    evenLaneWins,
  };
};

export const fetchGlobalMatches = async (): Promise<MatchData[]> => {
  try {
    const response = await api.get('/Matches');
    return (response.data || []).map(normalizeMatch);
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
