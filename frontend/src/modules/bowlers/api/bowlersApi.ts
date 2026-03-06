import { api, handleApiError } from '../../../core/api/httpClient';
import { Bowler, BowlerStatsData } from '../../../types/Bowler';

export const normalizeBowler = (b: any): Bowler => {
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

export const fetchAllBowlers = async (): Promise<Bowler[]> => {
  try {
    const response = await api.get('/BowlingLeague');
    return (response.data || []).map(normalizeBowler);
  } catch (error) {
    throw handleApiError(error, 'fetchAllBowlers');
  }
};

export const fetchBowlerDetails = async (id: string): Promise<Bowler> => {
  try {
    const response = await api.get(`/BowlingLeague/${id}`);
    return normalizeBowler(response.data);
  } catch (error) {
    throw handleApiError(error, 'fetchBowlerDetails');
  }
};

export const saveBowler = async (bowlerData: any, id?: string | number) => {
  try {
    if (id && id !== 'new') {
      const response = await api.patch(`/BowlingLeague/${id}`, bowlerData);
      return normalizeBowler(response.data);
    }

    const response = await api.post('/BowlingLeague', bowlerData);
    return normalizeBowler(response.data);
  } catch (error) {
    throw handleApiError(error, 'saveBowler');
  }
};

export const softDeleteBowler = async (id: string | number) => {
  try {
    if (!id || id === 0 || id === '0') {
      throw new Error('Invalid bowler id.');
    }
    const response = await api.patch(`/BowlingLeague/${id}`, { isDeleted: true });
    return response.data;
  } catch (error) {
    throw handleApiError(error, 'softDeleteBowler');
  }
};

export const deleteBowler = softDeleteBowler;

export const fetchBowlerStats = async (): Promise<BowlerStatsData[]> => {
  try {
    const response = await api.get('/BowlingLeague/bowler-stats');
    return response.data || [];
  } catch (error) {
    throw handleApiError(error, 'fetchBowlerStats');
  }
};
