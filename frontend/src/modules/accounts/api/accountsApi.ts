import { api, handleApiError } from '../../../core/api/httpClient';
import { Acc } from '../../../types/Accounts';

export const createAccounts = async (accountData: {
  Email: string;
  Password: string;
  Role: string | null;
}) => {
  try {
    const response = await api.post('/BowlingLeague/accounts', accountData);
    return response.data;
  } catch (error) {
    throw handleApiError(error, 'createAccounts');
  }
};

export const fetchAccounts = async (): Promise<Acc[]> => {
  try {
    const response = await api.get('/BowlingLeague/accounts');
    return response.data || [];
  } catch (error) {
    throw handleApiError(error, 'fetchAccounts');
  }
};

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

export const fetchdeleteAccount = async (id: number) => {
  try {
    const response = await api.put(`/BowlingLeague/accounts/${id}`, { IsDelete: true });
    return response.data;
  } catch (error) {
    throw handleApiError(error, 'fetchdeleteAccount');
  }
};

export const fetchAccountsDetails = async (id: string): Promise<Acc> => {
  try {
    const response = await api.get(`/BowlingLeague/accounts/${id}`);
    return response.data || [];
  } catch (error) {
    throw handleApiError(error, 'fetchAccountsDetails');
  }
};
